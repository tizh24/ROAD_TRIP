import { expect, type Page, test } from "@playwright/test";

const ownerState = process.env.E2E_OWNER_STORAGE_STATE;
const ready = Boolean(process.env.E2E_BASE_URL && ownerState);
const correlationId = "e2e-trip-planning-matrix";

const places = {
  hanoi: {
    id: "e2e-hanoi",
    name: "Hồ Hoàn Kiếm",
    address: "Hoàn Kiếm, Hà Nội",
    coordinate: { latitude: 21.0285, longitude: 105.8542 },
  },
  ninhBinh: {
    id: "e2e-ninh-binh",
    name: "Tràng An",
    address: "Hoa Lư, Ninh Bình",
    coordinate: { latitude: 20.2506, longitude: 105.9745 },
  },
} as const;

test.describe("Journeys A and B — persisted trip planning", () => {
  test.skip(
    !ready,
    "Requires E2E_BASE_URL and an authenticated E2E_OWNER_STORAGE_STATE file.",
  );

  test("create, retry safely, plan, reload, resume, and preserve data through failures", async ({
    browser,
  }) => {
    const title = `E2E road trip ${Date.now()}`;
    const { startDate, endDate } = futureDateRange();
    const owner = await browser.newContext({ storageState: ownerState });
    const page = await owner.newPage();
    await mockSuccessfulGeo(page);

    let createRequest:
      | { url: string; headers: Record<string, string>; body: string }
      | undefined;
    page.on("request", async (request) => {
      if (
        request.method() !== "POST" ||
        !/\/api\/v1\/trips\/?$/.test(request.url())
      )
        return;
      createRequest = {
        url: request.url(),
        headers: await request.allHeaders(),
        body: request.postData() ?? "",
      };
    });

    await page.goto("/trips/new");
    await page.getByLabel("Tên chuyến đi").fill(title);
    await page
      .getByLabel("Mô tả")
      .fill("Automated Journey A and B verification");
    await page.getByLabel("Ngày bắt đầu").fill(startDate);
    await page.getByLabel("Ngày kết thúc").fill(endDate);
    await page.getByLabel("Ngân sách dự kiến (VND)").fill("2500000");
    await page.getByRole("button", { name: "Tạo và tiếp tục" }).click();

    await expect(page).toHaveURL(/\/trips\/[0-9a-f-]{36}$/i);
    await expect(
      page.getByRole("heading", { level: 1, name: title }),
    ).toBeVisible();
    expect(
      createRequest,
      "the UI create request should be observable",
    ).toBeDefined();

    const retryResponse = await page.request.fetch(createRequest!.url, {
      method: "POST",
      headers: pickRetryHeaders(createRequest!.headers),
      data: createRequest!.body,
    });
    expect(retryResponse.ok()).toBe(true);
    const retryBody = (await retryResponse.json()) as {
      data?: { id?: string };
    };
    expect(retryBody.data?.id).toBe(page.url().split("/").at(-1));

    await addPlace(page, "Hà Nội", places.hanoi.name);
    await addPlace(page, "Ninh Bình", places.ninhBinh.name);
    const stops = page.locator("ol > li");
    await expect(stops).toHaveCount(2);
    await expect(stops.nth(0)).toContainText(places.hanoi.name);
    await page
      .getByRole("button", { name: `Đưa ${places.ninhBinh.name} lên` })
      .click();
    await expect(stops.nth(0)).toContainText(places.ninhBinh.name);
    await expect(
      page.getByText(/15 km · 20 phút · từ nhà cung cấp/),
    ).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole("heading", { level: 1, name: title }),
    ).toBeVisible();
    await expect(stops).toHaveCount(2);
    await expect(stops.nth(0)).toContainText(places.ninhBinh.name);

    await page.unroute("**/api/v1/routes/preview");
    await page.route("**/api/v1/routes/preview", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "GEO_PROVIDER_UNAVAILABLE",
            message: "Provider unavailable",
          },
          meta: { correlationId },
        }),
      });
    });
    await page.reload();
    await expect(
      page.getByText("Không thể tải tuyến đường; itinerary vẫn được lưu."),
    ).toBeVisible();
    await expect(stops).toHaveCount(2);

    await owner.close();

    const returningOwner = await browser.newContext({
      storageState: ownerState,
    });
    const resumedPage = await returningOwner.newPage();
    await mockSuccessfulGeo(resumedPage);
    await resumedPage.goto("/trips");
    await resumedPage.getByRole("link", { name: new RegExp(title) }).click();
    await expect(
      resumedPage.getByRole("heading", { level: 1, name: title }),
    ).toBeVisible();

    const note = `Journey B note ${Date.now()}`;
    const notes = resumedPage.getByLabel("Ghi chú").first();
    const saveResponse = resumedPage.waitForResponse(
      (response) =>
        response.request().method() === "PATCH" &&
        /\/api\/v1\/trips\/[^/]+\/stops\/[^/]+$/.test(response.url()),
    );
    await notes.fill(note);
    expect((await saveResponse).ok()).toBe(true);
    await expect(
      notes.locator("xpath=../following-sibling::*[@role='status']"),
    ).toHaveText("Đã lưu");
    await resumedPage.reload();
    await expect(resumedPage.getByLabel("Ghi chú").first()).toHaveValue(note);

    await resumedPage.route("**/api/v1/trips/*/stops/*", async (route) => {
      if (route.request().method() !== "PATCH") return route.fallback();
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({
          error: { code: "TRIP_VERSION_CONFLICT", message: "Version conflict" },
          meta: { correlationId },
        }),
      });
    });
    const localNote = `${note} retained locally`;
    await resumedPage.getByLabel("Ghi chú").first().fill(localNote);
    await expect(
      resumedPage.getByText(/Không thể lưu\. Chỉnh sửa vẫn được giữ/),
    ).toBeVisible({
      timeout: 10_000,
    });
    await expect(resumedPage.getByLabel("Ghi chú").first()).toHaveValue(
      localNote,
    );
    await returningOwner.close();
  });
});

async function addPlace(page: Page, query: string, expectedName: string) {
  const search = page.getByRole("combobox", { name: "Thêm điểm dừng" });
  await search.fill(query);
  await page.getByRole("option", { name: new RegExp(expectedName) }).click();
  await expect(page.getByText(expectedName, { exact: true })).toBeVisible();
}

async function mockSuccessfulGeo(page: Page) {
  await page.route("**/api/v1/places/search**", async (route) => {
    const query = new URL(route.request().url()).searchParams.get("q") ?? "";
    const place = query.toLocaleLowerCase("vi").includes("ninh")
      ? places.ninhBinh
      : places.hanoi;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [place], meta: { correlationId } }),
    });
  });
  await page.route("**/api/v1/routes/preview", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          geometry: {
            type: "LineString",
            coordinates: [
              [
                places.hanoi.coordinate.longitude,
                places.hanoi.coordinate.latitude,
              ],
              [
                places.ninhBinh.coordinate.longitude,
                places.ninhBinh.coordinate.latitude,
              ],
            ],
          },
          distanceMeters: 15_000,
          durationSeconds: 1_200,
          source: "provider",
          calculatedAt: new Date().toISOString(),
        },
        meta: { correlationId },
      }),
    });
  });
  await page.route("https://*.tile.openstreetmap.org/**", (route) =>
    route.abort(),
  );
}

function pickRetryHeaders(
  headers: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    ["authorization", "content-type", "idempotency-key", "x-correlation-id"]
      .filter((name) => headers[name])
      .map((name) => [name, headers[name]!]),
  );
}

function futureDateRange() {
  const start = new Date();
  start.setUTCDate(start.getUTCDate() + 30);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}
