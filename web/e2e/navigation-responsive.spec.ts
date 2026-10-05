import { expect, test } from "@playwright/test";

const ready = Boolean(process.env.E2E_BASE_URL);

test.describe("navigation responsive smoke", () => {
  test.skip(!ready, "Requires E2E_BASE_URL for the running web application.");

  for (const viewport of [
    { name: "mobile", width: 375, height: 812 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1440, height: 900 },
  ]) {
    test(`does not overflow at ${viewport.name} width`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await expect(page.locator("header")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);

      if (viewport.name !== "desktop") {
        await page.getByRole("button", { name: "Mở điều hướng" }).click();
        await expect(page.getByRole("navigation", { name: "Điều hướng di động" })).toBeVisible();
      }
    });
  }
});
