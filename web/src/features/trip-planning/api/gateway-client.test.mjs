import assert from "node:assert/strict";
import test from "node:test";
import { gatewayApiPath } from "./gateway-request.ts";

test("prefixes planner paths with the Gateway API version", () => {
  assert.equal(gatewayApiPath("trips"), "api/v1/trips");
  assert.equal(gatewayApiPath("/places/search?q=ha-giang"), "api/v1/places/search?q=ha-giang");
});

test("does not duplicate a path that is already versioned", () => {
  assert.equal(gatewayApiPath("api/v1/public/trips"), "api/v1/public/trips");
});
