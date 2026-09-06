import assert from "node:assert/strict";
import test from "node:test";
import { tripListSchema } from "./trip-model.ts";

test("lists only runtime-validated trip summaries", async () => {
  const expected = [
    {
      id: "e1a3dbb3-0e10-4e17-83a7-2813c7b4c813",
      title: "Ha Giang Loop",
      startDate: "2026-09-10",
      endDate: "2026-09-14",
      status: "PLANNING",
      role: "OWNER",
      permission: "EDIT",
      version: 1,
    },
  ];
  assert.deepEqual(tripListSchema.parse(expected), expected);
  assert.throws(() => tripListSchema.parse([{ ...expected[0], role: "ADMIN" }]));
});
