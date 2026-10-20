import { expect, test } from "@playwright/test";

test.describe("public landing page", () => {
  test.skip(!process.env.E2E_BASE_URL, "Requires E2E_BASE_URL.");

  test("shows the landing sections and routes visitors to key actions", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Khám phá Việt Nam\.\s*Tự do\. Phiêu lưu\./i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Cảm Hứng Điểm Đến" }),
    ).toBeVisible();
    await page
      .getByPlaceholder("VD: Hà Giang, Phú Quốc...")
      .fill("Hà Giang");
    await page.getByRole("button", { name: "Khám Phá Ngay" }).click();
    await expect(page).toHaveURL(/\/explore\?q=H%C3%A0\+Giang$/);

    await page.goto("/");
    await page.getByRole("button", { name: "AI May Đo Độc Bản" }).click();
    await page
      .getByPlaceholder("VD: Hà Giang, Phú Quốc...")
      .fill("Đà Lạt");
    await page.getByRole("button", { name: "Khám Phá Ngay" }).click();
    await expect(page).toHaveURL((url) => {
      return (
        url.pathname === "/login" &&
        url.searchParams.get("next") === "/planner/new?title=%C4%90%C3%A0+L%E1%BA%A1t"
      );
    });

    await page.goto("/");
    const menu = page.getByRole("button", { name: "Mở điều hướng" });
    await expect(menu).toBeVisible();
    await menu.click();
    await expect(page.getByRole("navigation", { name: "Điều hướng di động" })).toBeVisible();
    await menu.click();
    await expect(page.getByRole("navigation", { name: "Điều hướng di động" })).toBeHidden();
  });

  test("keeps the landing and primary navigation inside the laptop viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto("/");

    await expect(page.locator("header")).toHaveCSS("position", "sticky");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);

    await expect(page.getByRole("heading", { name: "Cảm Hứng Điểm Đến" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Trải Nghiệm Độc Bản Với 3 Bước/i }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Khám phá" }).click();
    await expect(page).toHaveURL("/explore");
    await page.goto("/");
    await page.getByRole("link", { name: "Cộng đồng", exact: true }).click();
    await expect(page).toHaveURL("/feed");
  });
});
