import { expect, test } from "@playwright/test";

// Widths required by the cross-surface editorial UI spec.
const widths = [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920];
const routes = ["/", "/explore", "/login", "/signup", "/forgot-password"];

test.describe("public and auth viewport matrix", () => {
  test.skip(!process.env.E2E_BASE_URL, "Requires E2E_BASE_URL.");

  for (const route of routes) {
    test(`${route} has no horizontal overflow, one h1 and one main at every target width`, async ({ page }) => {
      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);
        await expect(page.locator("main")).toHaveCount(1);
        await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `${route} overflows by ${overflow}px at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }

  test("primary controls keep 44px touch targets on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const route of ["/explore", "/login"]) {
      await page.goto(route);
      const buttons = page.locator("main").getByRole("button");
      const count = await buttons.count();
      for (let index = 0; index < count; index += 1) {
        const box = await buttons.nth(index).boundingBox();
        if (box) expect(box.height, `${route} button ${index} is ${box.height}px tall`).toBeGreaterThanOrEqual(43.5);
      }
    }
  });
});
