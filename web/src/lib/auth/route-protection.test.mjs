import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLoginUrl,
  getSafeInternalPath,
  hasSupabaseAuthCookie,
  isProtectedRoute,
} from "./route-protection.ts";

test("protects the trips route tree only", () => {
  assert.equal(isProtectedRoute("/trips"), true);
  assert.equal(isProtectedRoute("/trips/new"), true);
  assert.equal(isProtectedRoute("/trips/trip-123"), true);
  assert.equal(isProtectedRoute("/trip/trip-123"), false);
  assert.equal(isProtectedRoute("/trips-archive"), false);
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

test("recognizes Supabase auth cookies including chunked cookies", () => {
  assert.equal(
    hasSupabaseAuthCookie([{ name: "sb-project-ref-auth-token.0" }]),
    true,
  );
  assert.equal(hasSupabaseAuthCookie([{ name: "theme" }]), false);
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
