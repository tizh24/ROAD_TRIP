import assert from "node:assert/strict";
import test from "node:test";
import {
  createdInvitationSchema,
  createdTripMemoryPhotoSchema,
  invitationSchema,
  tripDetailSchema,
  tripListSchema,
  updatedTripMemorySchema,
} from "./trip-model.ts";

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

test("keeps raw invitation tokens exclusive to create responses", () => {
  const invitation = {
    id: "e1a3dbb3-0e10-4e17-83a7-2813c7b4c813",
    tripId: "f52179a7-4cc9-4ea9-bafd-fbaee6282934",
    inviteeEmail: "member@example.com",
    permission: "VIEW",
    status: "PENDING",
    expiresAt: "2026-09-16T00:00:00.000Z",
    acceptedUserId: null,
    createdAt: "2026-09-09T00:00:00.000Z",
  };

  assert.deepEqual(invitationSchema.parse(invitation), invitation);
  assert.throws(() => invitationSchema.parse({ ...invitation, token: "secret" }));
  assert.throws(() => createdInvitationSchema.parse(invitation));
  assert.equal(
    createdInvitationSchema.parse({ ...invitation, token: "a".repeat(43) }).token,
    "a".repeat(43),
  );
});

test("validates tripDetailSchema with visibility and sourceTripId", () => {
  const detail = {
    id: "e1a3dbb3-0e10-4e17-83a7-2813c7b4c813",
    title: "Ha Giang Loop",
    startDate: "2026-09-10",
    endDate: "2026-09-14",
    status: "PLANNING",
    role: "OWNER",
    permission: "EDIT",
    version: 1,
    ownerId: "f52179a7-4cc9-4ea9-bafd-fbaee6282934",
    description: "Great loop",
    budgetAmount: 5000000,
    currency: "VND",
    visibility: "PUBLISHED",
    sourceTripId: null,
    days: [],
  };

  const parsed = tripDetailSchema.parse(detail);
  assert.equal(parsed.visibility, "PUBLISHED");
  assert.equal(parsed.sourceTripId, null);
});

test("validates the distinct memory update and photo-create contracts", () => {
  const memoryId = "e1a3dbb3-0e10-4e17-83a7-2813c7b4c813";
  const tripId = "f52179a7-4cc9-4ea9-bafd-fbaee6282934";

  assert.deepEqual(
    updatedTripMemorySchema.parse({
      id: memoryId,
      tripId,
      title: "Hà Giang mùa mây",
      summary: null,
      coverPhotoUrl: null,
      visibility: "PRIVATE",
    }),
    {
      id: memoryId,
      tripId,
      title: "Hà Giang mùa mây",
      summary: null,
      coverPhotoUrl: null,
      visibility: "PRIVATE",
    },
  );

  assert.deepEqual(
    createdTripMemoryPhotoSchema.parse({
      id: "f5a8f0f4-8d6e-49e0-a903-24921ce5a61c",
      memoryId,
      photoUrl: "https://images.example/photo.jpg",
      caption: null,
      createdAt: "2026-10-21T00:00:00.000Z",
    }).caption,
    null,
  );
});
