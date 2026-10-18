import assert from "node:assert/strict";
import test from "node:test";
import {
  appRoles,
  hasCapability,
  platformCapabilities,
} from "./capabilities.ts";

test("covers the 4 product roles and essential capabilities", () => {
  assert.deepEqual(appRoles, ["USER", "PARTNER", "MODERATOR", "ADMIN"]);
  assert.ok(platformCapabilities.includes("admin.access"));
  assert.ok(platformCapabilities.includes("partner.access"));
  assert.ok(platformCapabilities.includes("content.moderation.execute"));
});

test("grants standard user only non-privileged capabilities", () => {
  assert.equal(hasCapability("USER", "public.trip.read"), true);
  assert.equal(hasCapability("USER", "profile.read"), true);
  assert.equal(hasCapability("USER", "trip.create"), true);
  assert.equal(hasCapability("USER", "trip.clone"), true);

  assert.equal(hasCapability("USER", "partner.access"), false);
  assert.equal(hasCapability("USER", "partner.listing.write"), false);
  assert.equal(hasCapability("USER", "content.moderation.execute"), false);
  assert.equal(hasCapability("USER", "admin.access"), false);
  assert.equal(hasCapability("USER", "admin.role.grant"), false);
});

test("grants partner commercial capabilities but denies moderation and admin", () => {
  assert.equal(hasCapability("PARTNER", "partner.access"), true);
  assert.equal(hasCapability("PARTNER", "partner.listing.read"), true);
  assert.equal(hasCapability("PARTNER", "partner.listing.write"), true);
  assert.equal(hasCapability("PARTNER", "partner.analytics.read"), true);

  assert.equal(hasCapability("PARTNER", "content.moderation.execute"), false);
  assert.equal(hasCapability("PARTNER", "admin.access"), false);
  assert.equal(hasCapability("PARTNER", "admin.role.grant"), false);
});

test("grants moderator content capabilities but denies admin roles and partner writes", () => {
  assert.equal(hasCapability("MODERATOR", "content.moderation.read"), true);
  assert.equal(hasCapability("MODERATOR", "content.moderation.execute"), true);

  assert.equal(hasCapability("MODERATOR", "admin.access"), false);
  assert.equal(hasCapability("MODERATOR", "admin.role.grant"), false);
  assert.equal(hasCapability("MODERATOR", "admin.status.update"), false);
  assert.equal(hasCapability("MODERATOR", "admin.audit.read"), false);
  assert.equal(hasCapability("MODERATOR", "partner.listing.write"), false);
});

test("grants admin full platform capabilities", () => {
  for (const cap of platformCapabilities) {
    assert.equal(hasCapability("ADMIN", cap), true);
  }
});

test("restricts guest to public read only", () => {
  assert.equal(hasCapability(undefined, "public.trip.read"), true);
  assert.equal(hasCapability(null, "public.trip.read"), true);
  assert.equal(hasCapability(undefined, "profile.read"), false);
  assert.equal(hasCapability(undefined, "trip.create"), false);
  assert.equal(hasCapability(undefined, "admin.access"), false);
});
