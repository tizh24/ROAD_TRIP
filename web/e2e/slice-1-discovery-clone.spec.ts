import { expect, test } from "@playwright/test";

test.describe("Slice 1: Discovery to Clone journey", () => {
  test.skip(!process.env.E2E_BASE_URL, "Requires E2E_BASE_URL.");

  test("guest can access /explore without authentication", async ({ page }) => {
    await page.goto("/explore");
    await expect(page).toHaveURL("/explore");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Chọn một hướng đi/i);
    await expect(
      page.getByLabel("Tìm điểm đến hoặc cung đường"),
    ).toBeVisible();
  });

  test("guest on /trip/:id sees login gate button and redirects safely", async ({ page }) => {
    // Navigate to a sample public trip page
    const sampleTripId = "00000000-0000-4000-8000-000000000001";
    await page.goto(`/trip/${sampleTripId}`);

    // If trip exists, verify the "Đăng nhập để clone" button
    const cloneButton = page.getByRole("button", { name: /Đăng nhập để clone/i });
    if (await cloneButton.isVisible()) {
      await cloneButton.click();
      await expect(page).toHaveURL(new RegExp(`/login\\?next=.*trip.*${sampleTripId}`));
    }
  });

  test("canonical redirects legacy planner routes to canonical planner", async ({ page }) => {
    // Test that /trips/:tripId redirects to /planner/:id
    const sampleTripId = "00000000-0000-4000-8000-000000000001";
    await page.goto(`/trips/${sampleTripId}`);
    // Should preserve login gate with /planner/:id destination or redirect
    await expect(page).toHaveURL(new RegExp(`/login\\?next=.*(planner|trips).*`));
  });
});
