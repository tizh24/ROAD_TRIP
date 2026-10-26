import { expect, test } from "@playwright/test";

const sections = [
  "Mọi thứ cho một chuyến đi, ở cùng một nơi.",
  "Bắt đầu từ một vùng đất.",
  "Lên kế hoạch trong ba bước.",
  "Nhận gợi ý cung đường khi bản tin ra mắt.",
];

test.describe("public landing page", () => {
  test.skip(!process.env.E2E_BASE_URL, "Requires E2E_BASE_URL.");

  for (const viewport of [
    { name: "mobile", width: 320, height: 800 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1440, height: 900 },
  ]) {
    test(`renders one header, main and footer without overflow at ${viewport.name} width`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/");

      await expect(page.locator("header")).toHaveCount(1);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("footer")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1, name: "Đi đường dài, theo cách của bạn." })).toBeVisible();
      for (const heading of sections) {
        await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible();
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
      ).toBe(true);
    });
  }

  test("routes the main actions to existing destinations", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const plan = page.getByRole("link", { name: "Bắt đầu lên kế hoạch" }).first();
    await expect(plan).toHaveAttribute("href", "/trips/new");
    await expect(page.getByRole("link", { name: "Khám phá lộ trình" }).first()).toHaveAttribute("href", "/explore");
    await expect(page.getByRole("banner").getByRole("link", { name: "Đăng nhập" })).toHaveAttribute("href", "/login");
    await expect(page.getByRole("link", { name: "Xem lộ trình quanh Sa Pa" })).toHaveAttribute(
      "href",
      "/explore?q=Sa%20Pa",
    );

    await plan.click();
    await expect(page).toHaveURL((url) => url.pathname === "/login" && url.searchParams.get("next") === "/trips/new");
  });

  test("opens and closes the mobile menu with the keyboard", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const toggle = page.getByRole("button", { name: "Mở điều hướng" });
    await toggle.focus();
    await page.keyboard.press("Enter");
    const nav = page.getByRole("navigation", { name: "Điều hướng di động" });
    await expect(nav).toBeVisible();
    await expect(page.getByRole("button", { name: "Đóng điều hướng" })).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");
    await expect(nav).toBeHidden();
    await expect(page.getByRole("button", { name: "Mở điều hướng" })).toBeFocused();

    await page.getByRole("button", { name: "Mở điều hướng" }).click();
    await nav.getByRole("link", { name: "Cộng đồng" }).click();
    await expect(page).toHaveURL((url) => url.pathname === "/login" && url.searchParams.get("next") === "/feed");
  });

  test("validates the newsletter email and never claims it stored anything", async ({ page }) => {
    await page.goto("/");
    const email = page.getByLabel("Email của bạn");
    await email.fill("khong-hop-le");
    await page.getByRole("button", { name: "Gửi email" }).click();
    await expect(page.getByText("Nhập một địa chỉ email hợp lệ")).toBeVisible();

    await email.fill("ten@example.com");
    await page.getByRole("button", { name: "Gửi email" }).click();
    await expect(page.getByRole("status")).toContainText("chưa lưu email của bạn");
    await expect(page.getByText("Đăng ký thành công")).toHaveCount(0);
  });

  test("shows no invented metrics, testimonials or AI claims", async ({ page }) => {
    await page.goto("/");
    const text = await page.locator("main").innerText();
    for (const banned of ["50.000+", "4.9/5.0", "63/63", "AI ", "Founder @"]) {
      expect(text).not.toContain(banned);
    }
  });
});
