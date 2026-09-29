import assert from "node:assert/strict";
import test from "node:test";
import { trackAnalytics } from "./analytics.ts";

const deterministic = { now: () => new Date("2026-09-09T00:00:00.000Z"), randomUUID: () => "event-1" };

test("emits only an approved privacy-safe event contract", () => {
  const events = [];
  assert.equal(trackAnalytics("member_invited", { permission: "VIEW" }, { ...deterministic, transport: (event) => events.push(event) }), true);
  assert.deepEqual(events[0], { eventId: "event-1", name: "member_invited", occurredAt: "2026-09-09T00:00:00.000Z", properties: { permission: "VIEW" } });
  assert.throws(() => trackAnalytics("member_invited", { permission: "VIEW", email: "private@example.com" }, deterministic));
});

test("deduplicates retried mutations using their idempotency key", () => {
  const values = new Map(); const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }; let count = 0;
  const options = { ...deterministic, dedupeKey: "mutation-1", storage, transport: () => { count += 1; } };
  assert.equal(trackAnalytics("trip_created", { dayCount: 3 }, options), true);
  assert.equal(trackAnalytics("trip_created", { dayCount: 3 }, options), false);
  assert.equal(count, 1);
});
