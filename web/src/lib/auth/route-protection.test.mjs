import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLoginUrl,
  getSafeInternalPath,
  hasGatewayAuthCookie,
  isProtectedRoute,
} from "./route-protection.ts";

test("protects every authenticated application route tree", () => {
  assert.equal(isProtectedRoute("/dashboard"), true);
  assert.equal(isProtectedRoute("/trips"), true);
  assert.equal(isProtectedRoute("/trips/new"), true);
  assert.equal(isProtectedRoute("/trips/trip-123"), true);
  assert.equal(isProtectedRoute("/trip-invitations/invitation-token"), true);
  assert.equal(isProtectedRoute("/planner"), true);
  assert.equal(isProtectedRoute("/planner/trip-123"), true);
  assert.equal(isProtectedRoute("/road"), true);
  assert.equal(isProtectedRoute("/road/trip-123"), true);
  assert.equal(isProtectedRoute("/profile/settings"), true);
  assert.equal(isProtectedRoute("/profile/community-member"), false);
  assert.equal(isProtectedRoute("/memory/journey-123"), true);
  assert.equal(isProtectedRoute("/feed"), true);
  assert.equal(isProtectedRoute("/partner/analytics"), true);
  assert.equal(isProtectedRoute("/admin/finance"), true);
  assert.equal(isProtectedRoute("/travel-book/book-123"), true);
  assert.equal(isProtectedRoute("/payment"), true);
  assert.equal(isProtectedRoute("/trip/trip-123"), false);
  assert.equal(isProtectedRoute("/signup"), false);
  assert.equal(isProtectedRoute("/trips-archive"), false);
  assert.equal(isProtectedRoute("/trip-invitations-archive"), false);
});

test("preserves the requested path and query in the login URL", () => {
  const loginUrl = buildLoginUrl(
    new URL("https://road-trip.test/trips/trip-123?day=2&mode=edit"),
    false,
  );

  assert.equal(loginUrl.pathname, "/login");
  assert.equal(loginUrl.searchParams.get("next"), "/trips/trip-123?day=2&mode=edit");
  assert.equal(loginUrl.searchParams.has("authError"), false);
});

test("marks an invalid existing session as expired", () => {
  const loginUrl = buildLoginUrl(
    new URL("https://road-trip.test/trips/new"),
    true,
  );

  assert.equal(loginUrl.searchParams.get("authError"), "session_expired");
});

test("recognizes the Gateway access cookie", () => {
  assert.equal(
    hasGatewayAuthCookie([{ name: "rt_access" }]),
    true,
  );
  assert.equal(hasGatewayAuthCookie([{ name: "theme" }]), false);
});

test("accepts internal return paths and rejects redirect injection", () => {
  assert.equal(
    getSafeInternalPath("/trips/trip-123?day=2"),
    "/trips/trip-123?day=2",
  );
  assert.equal(getSafeInternalPath("https://evil.example/trips"), null);
  assert.equal(getSafeInternalPath("//evil.example/trips"), null);
  assert.equal(getSafeInternalPath("/\\evil.example/trips"), null);
  assert.equal(getSafeInternalPath("/trips\r\nLocation: https://evil.example"), null);
});
