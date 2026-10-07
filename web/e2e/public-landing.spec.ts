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
        name: /Đi xa hơn theo cách của riêng bạn/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Điểm đến được yêu thích" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Lập chuyến đi/i }).first(),
    ).toHaveAttribute("href", "/trips/new");
    await expect(
      page.getByRole("link", { name: /Xem hành trình mẫu/i }),
    ).toHaveAttribute("href", "/explore");

    await page.getByRole("button", { name: "Mở điều hướng" }).click();
    await expect(
      page.getByRole("link", { name: "Đăng nhập" }).last(),
    ).toHaveAttribute("href", "/login");
  });

  test("keeps every in-page navigation target centered and inside the laptop viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto("/");

    await expect(page.locator("header")).toHaveCSS("position", "fixed");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);

    const destinations = [
      { label: "Điểm đến", title: "#diem-den-title", section: "#diem-den" },
      { label: "Trải nghiệm", title: "#dich-vu-title", section: "#dich-vu" },
      { label: "Cách hoạt động", title: "#cach-hoat-dong-title", section: "#cach-hoat-dong" },
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
