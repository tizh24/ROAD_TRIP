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
    });
  }

  test("the shared navbar sheet traps focus, closes on Escape and returns focus", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/explore");
    const trigger = page.getByRole("button", { name: "Mở điều hướng" });
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Khám phá" })).toBeVisible();
    await expect.poll(() => page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: /điều hướng/ })).toBeFocused();
  });
});
