import { expect, test } from "@playwright/test";

const apiPattern = "**/api/v1/auth/session/import";

test.describe("Gateway cookie BFF recovery and callback flows", () => {
  test.skip(!process.env.E2E_BASE_URL, "Requires E2E_BASE_URL.");

  test("imports recovery tokens through the Gateway only, clears the fragment and moves to reset", async ({
    page,
  }) => {
    const supabaseRequests: string[] = [];
    page.on("request", (request) => {
      if (/supabase\./i.test(request.url())) supabaseRequests.push(request.url());
    });
    let body: unknown;
    await page.route(apiPattern, async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "access-control-allow-origin": process.env.E2E_BASE_URL!, "access-control-allow-credentials": "true" },
        body: JSON.stringify({ data: { authenticated: true }, meta: { correlationId: "e2e-recovery" } }),
      });
    });
    await page.route(apiPattern, (route) =>
      route.request().method() === "OPTIONS"
        ? route.fulfill({ status: 204, headers: { "access-control-allow-origin": process.env.E2E_BASE_URL!, "access-control-allow-credentials": "true", "access-control-allow-headers": "content-type,x-correlation-id,x-csrf-token", "access-control-allow-methods": "POST" } })
        : route.fallback(),
    );

    await page.goto("/auth/recovery#access_token=at&refresh_token=rt&expires_in=3600&type=recovery");
    await expect(page).toHaveURL(/\/reset-password$/);
    await expect(page.getByRole("heading", { name: "Đặt mật khẩu mới" })).toBeVisible();
    expect(body).toEqual({ accessToken: "at", refreshToken: "rt", expiresIn: 3600 });
    expect(supabaseRequests).toEqual([]);
  });

  test("shows a recoverable error when the link has no tokens", async ({ page }) => {
    await page.goto("/auth/recovery");
    await expect(page.locator("[role=alert]:not(#__next-route-announcer__)")).toContainText("không hợp lệ hoặc đã hết hạn");
    await page.getByRole("link", { name: "Yêu cầu liên kết mới" }).click();
    await expect(page).toHaveURL(/\/forgot-password$/);
  });

  test("shows a recoverable error when the Gateway rejects the tokens", async ({ page }) => {
    await page.route(apiPattern, (route) =>
      route.request().method() === "OPTIONS"
        ? route.fulfill({ status: 204, headers: { "access-control-allow-origin": process.env.E2E_BASE_URL!, "access-control-allow-credentials": "true", "access-control-allow-headers": "content-type,x-correlation-id,x-csrf-token", "access-control-allow-methods": "POST" } })
        : route.fulfill({
            status: 401,
            contentType: "application/json",
            headers: { "access-control-allow-origin": process.env.E2E_BASE_URL!, "access-control-allow-credentials": "true" },
            body: JSON.stringify({ error: { code: "AUTH_INVALID", message: "invalid" }, meta: { correlationId: "e2e" } }),
          }),
    );
    await page.goto("/auth/recovery#access_token=bad&refresh_token=bad&expires_in=60");
    await expect(page.locator("[role=alert]:not(#__next-route-announcer__)")).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/recovery$/);
  });

  test("treats the legacy OAuth callback as a failed link without contacting Supabase", async ({ page }) => {
    const supabaseRequests: string[] = [];
    page.on("request", (request) => {
      if (/supabase\./i.test(request.url())) supabaseRequests.push(request.url());
    });
    await page.goto("/auth/callback?code=anything");
    await expect(page).toHaveURL(/\/login\?authError=callback$/);
    await expect(page.locator("[role=alert]:not(#__next-route-announcer__)")).toContainText("Liên kết đăng nhập không hợp lệ");
    expect(supabaseRequests).toEqual([]);
  });
});
