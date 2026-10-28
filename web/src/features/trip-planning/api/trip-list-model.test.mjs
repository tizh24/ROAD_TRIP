import assert from "node:assert/strict";
import test from "node:test";
import {
  TRIP_PAGE_SIZE,
  compareNearest,
  countByStatus,
  selectTrips,
} from "./trip-list-model.ts";

const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const day = (offset) => new Date(Date.UTC(2026, 5, 15) + offset * 86_400_000).toISOString().slice(0, 10);
const trip = (n, startOffset, length = 1, status = "PLANNING") => ({
  id: id(n),
  title: `Chuyến ${n}`,
  startDate: day(startOffset),
  endDate: day(startOffset + length - 1),
  status,
  role: "OWNER",
  permission: "EDIT",
  version: 1,
});
const today = day(0);

test("nearest puts upcoming and ongoing trips before history, soonest first", () => {
  const history = trip(1, -40);
  const recentPast = trip(2, -5);
  const ongoing = trip(3, -1, 4, "ONGOING");
  const soon = trip(4, 3);
  const later = trip(5, 90);
  const sorted = selectTrips([history, later, recentPast, soon, ongoing], {
    status: "ALL",
    query: "",
    sort: "NEAREST",
    today,
  });
  assert.deepEqual(
    sorted.map((item) => item.id),
    [ongoing, soon, later, recentPast, history].map((item) => item.id),
  );
});

test("nearest is deterministic for equal dates", () => {
  const a = trip(7, 3);
  const b = trip(6, 3);
  assert.ok(compareNearest(a, b, today) > 0);
  assert.ok(compareNearest(b, a, today) < 0);
});

test("filters and counts stay correct on a long list while a page stays bounded", () => {
  const statuses = ["PLANNING", "ONGOING", "COMPLETED", "CANCELLED"];
  const trips = Array.from({ length: 600 }, (_, index) => trip(index + 1, index - 300, 2, statuses[index % 4]));

  assert.equal(countByStatus(trips, "ALL"), 600);
  assert.equal(countByStatus(trips, "ONGOING"), 150);

  const ongoing = selectTrips(trips, { status: "ONGOING", query: "", sort: "NEAREST", today });
  assert.equal(ongoing.length, 150);
  assert.equal(ongoing.slice(0, TRIP_PAGE_SIZE).length, TRIP_PAGE_SIZE);

  const searched = selectTrips(trips, { status: "ALL", query: "  chuyến 600 ", sort: "NEWEST", today });
  assert.deepEqual(searched.map((item) => item.id), [id(600)]);
});

test("selectTrips does not mutate its input", () => {
  const trips = [trip(2, 5), trip(1, 1)];
  const before = trips.map((item) => item.id);
  selectTrips(trips, { status: "ALL", query: "", sort: "NEAREST", today });
  assert.deepEqual(trips.map((item) => item.id), before);
});
