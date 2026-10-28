import { expect, test } from "@playwright/test";

const sections = [
  "Lập thử một chuyến đi.",
  "Bắt đầu từ một vùng đất.",
  "Cùng chỉnh lịch trình.",
  "Từ ý tưởng đến chặng đầu tiên.",
  "Bạn muốn đi qua đâu?",
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
      await expect(
        page.getByRole("heading", { level: 1, name: "Lên lịch cả chuyến đi trên một tấm bản đồ." }),
      ).toBeVisible();
      for (const heading of sections) {
        await expect(page.getByRole("heading", { level: 2, name: heading })).toBeAttached();
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
    await expect(page.getByRole("link", { name: "Xem lộ trình quanh Mã Pí Lèng" })).toHaveAttribute(
      "href",
      "/explore?q=M%C3%A3%20P%C3%AD%20L%C3%A8ng",
    );

    await plan.click();
    await expect(page).toHaveURL((url) => url.pathname === "/login" && url.searchParams.get("next") === "/trips/new");
  });

  test("the live demo recalculates when its controls change", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const demo = page.locator("#demo-title").locator("xpath=ancestor::section[1]");
    await demo.scrollIntoViewIfNeeded();

    await expect(demo.getByText("147 km")).toBeVisible();
    await expect(demo.getByText("4 giờ 12 phút")).toBeVisible();

    await demo.getByText("Ô tô", { exact: true }).click();
    await expect(demo.getByText("3 giờ 41 phút")).toBeVisible();

    await demo.getByRole("switch", { name: "Thêm giờ nghỉ ăn trưa" }).click();
    await expect(demo.getByText("Nghỉ ăn trưa", { exact: true })).toBeVisible();
    await expect(demo.getByText("4 giờ 26 phút")).toBeVisible();

    await demo.getByRole("slider", { name: "Số ngày" }).fill("1");
    await expect(demo.getByText("Ngày 2")).toHaveCount(0);
  });

  test("the pinned trip sheet follows its controls", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const section = page.locator("#features-title").locator("xpath=ancestor::section[1]");
    await section.scrollIntoViewIfNeeded();

    await section.getByText("Được chỉnh sửa", { exact: true }).last().click();
    await expect(section.getByText("Được chỉnh sửa").first()).toBeVisible();
    await section.getByText("Công khai", { exact: true }).last().click();
    await expect(section.getByText("Hiển thị với cộng đồng")).toBeVisible();

    await section.getByLabel("Số tiền khoản chi (đồng)").fill("150000");
    await section.getByRole("button", { name: "Thêm khoản chi" }).click();
    await expect(section.getByText("1.400.000 đ")).toBeVisible();
  });

  test("the closing sentence searches the public routes", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.getByLabel("Địa điểm").fill("Sa Pa");
    await page.getByRole("button", { name: "Tìm", exact: true }).click();
    await expect(page).toHaveURL((url) => url.pathname === "/explore" && url.searchParams.get("q") === "Sa Pa");
  });

  test("shows no invented metrics, testimonials or AI claims, and credits every picture", async ({ page }) => {
    await page.goto("/");
    const text = await page.locator("main").innerText();
    for (const banned of ["50.000+", "4.9/5.0", "63/63", "Founder @"]) {
      expect(text).not.toContain(banned);
    }
    // The standalone word "AI", not letters inside another word (for example "KHAI" in uppercase labels).
    expect(text).not.toMatch(/(^|[^\p{L}])AI([^\p{L}]|$)/u);
    await expect(page.locator("footer").getByText("Wikimedia Commons").first()).toBeVisible();
  });
});
