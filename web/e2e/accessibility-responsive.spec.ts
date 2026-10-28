import { expect, test } from "@playwright/test";

const ready = Boolean(process.env.E2E_BASE_URL);
const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

test.describe("accessibility and responsive smoke", () => {
  test.skip(!ready, "Requires E2E_BASE_URL for the running web application.");

  for (const viewport of viewports) {
    test(`login is labelled and does not overflow at ${viewport.name} width`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/login");
      await expect(
        page.getByRole("heading", { level: 1, name: /Chào mừng trở lại!?/ }),
      ).toBeVisible();
      await expect(page.getByLabel("Email")).toBeVisible();
      await expect(page.getByLabel("Mật khẩu")).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(overflow).toBe(false);
    });
  }

  test("critical login controls have visible keyboard focus", async ({ page }) => {
    await page.goto("/login");
    const order = [
      page.getByRole("link", { name: /Về trang chủ/i }),
      page.getByRole("button", { name: /Google/ }),
      page.getByRole("button", { name: /Facebook/ }),
      page.getByRole("button", { name: /Apple/ }),
      page.getByLabel("Email"),
      page.getByRole("link", { name: "Quên mật khẩu?" }),
      page.getByLabel("Mật khẩu"),
      page.getByRole("button", { name: "Đăng nhập bằng email" }),
    ];
    for (const control of order) {
      await page.keyboard.press("Tab");
      await expect(control).toBeFocused();
    }
  });

  test("social sign-in buttons are present and say they are not enabled yet", async ({ page }) => {
    await page.goto("/login");
    for (const name of ["Google", "Facebook", "Apple"]) {
      await page.getByRole("button", { name: new RegExp(name) }).click();
      await expect(page.getByText(`Đăng nhập bằng ${name} chưa được bật`)).toBeVisible();
    }
    await expect(page).toHaveURL(/\/login$/);
  });
});
