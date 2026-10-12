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
        name: /Mọi cung đường.*Một hành trình.*đáng nhớ/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Khám phá Việt Nam,.*từng cung đường/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Lên kế hoạch chuyến đi/i }).first(),
    ).toHaveAttribute("href", "/trips/new");
    await expect(
      page.getByRole("link", { name: /Khám phá cung đường/i }).first(),
    ).toHaveAttribute("href", "/explore");

    await expect(page.getByRole("button", { name: "Mở điều hướng" })).toBeVisible();
  });

  test("keeps every in-page navigation target centered and inside the laptop viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto("/");

    await expect(page.locator("header")).toHaveCSS("position", "relative");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);

    const destinations = [
      { label: "Khám phá", title: "#kham-pha h2", section: "#kham-pha" },
      { label: "Cách hoạt động", title: "#cach-hoat-dong h2", section: "#cach-hoat-dong" },
    ] as const;

    for (const destination of destinations) {
      await page.getByRole("link", { name: destination.label }).first().click();
      await page.waitForTimeout(700);
      await expect(page.locator(destination.title)).toBeInViewport();
      await expect(page.locator(destination.section)).toBeInViewport();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  });
});
