import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import { GatewayApiError, requestGateway } from "./gateway-request.ts";

test("adds authenticated mutation headers and validates the envelope", async () => {
  let captured;
  const result = await requestGateway(
    {
      baseUrl: "https://gateway.example/api/v1",
      accessToken: "access-token",
      path: "trips",
      method: "POST",
      body: { title: "North loop" },
      correlationId: "request-1",
      idempotencyKey: "create-1",
      expectedVersion: 2,
      fetch: async (_input, init) => {
        captured = init;
        return new Response(
          JSON.stringify({
            data: { id: "trip-1" },
            meta: { correlationId: "request-1" },
          }),
          { status: 200 },
        );
      },
    },
    z.object({ id: z.string() }).strict(),
  );
  assert.deepEqual(result, { id: "trip-1" });
  assert.equal(captured.headers.get("authorization"), "Bearer access-token");
  assert.equal(captured.headers.get("idempotency-key"), "create-1");
  assert.equal(captured.headers.get("if-match"), "2");
});

test("maps stable Gateway error envelopes", async () => {
  await assert.rejects(
    requestGateway(
      {
        baseUrl: "https://gateway.example/api/v1",
        accessToken: "token",
        path: "trips",
        correlationId: "request-2",
        fetch: async () =>
          new Response(
            JSON.stringify({
              error: { code: "FORBIDDEN", message: "No access" },
              meta: { correlationId: "request-2" },
            }),
            { status: 403 },
          ),
      },
      z.unknown(),
    ),
    (error) => error instanceof GatewayApiError && error.code === "FORBIDDEN",
  );
});
