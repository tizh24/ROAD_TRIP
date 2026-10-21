import { z } from "zod";
import { gatewayClient } from "./gateway-client";
import {
  createTripInputSchema,
  createdInvitationSchema,
  createdTripMemoryPhotoSchema,
  invitationSchema,
  memberSchema,
  placeSchema,
  routePreviewSchema,
  stopMutationSchema,
  tripDetailSchema,
  tripExpenseSchema,
  tripListSchema,
  tripLiveLocationSchema,
  tripMemorySchema,
  updatedTripMemorySchema,
  type CreateTripInput,
  type Place,
} from "./trip-model";

export function listTrips() {
  return gatewayClient.request("trips", tripListSchema);
}

export function createTrip(input: CreateTripInput, idempotencyKey: string) {
  return gatewayClient.request("trips", tripDetailSchema, {
    method: "POST",
    body: createTripInputSchema.parse(input),
    idempotencyKey,
  });
}

export function getTrip(tripId: string) {
  return gatewayClient.request(
    `trips/${encodeURIComponent(tripId)}`,
    tripDetailSchema,
  );
}

export function searchPlaces(query: string, signal?: AbortSignal) {
  return gatewayClient.request(
    `places/search?q=${encodeURIComponent(query)}`,
    placeSchema.array(),
    { signal },
  );
}

export function addStop(
  tripId: string,
  dayId: string,
  place: Place,
  idempotencyKey: string,
) {
  return gatewayClient.request(
    `trips/${encodeURIComponent(tripId)}/days/${encodeURIComponent(dayId)}/stops`,
    stopMutationSchema,
    {
      method: "POST",
      idempotencyKey,
      body: {
        placeId: place.id,
        name: place.name,
        address: place.address,
        latitude: place.coordinate.latitude,
        longitude: place.coordinate.longitude,
      },
    },
  );
}

export function removeStop(tripId: string, stopId: string) {
  return gatewayClient.request(
    `trips/${encodeURIComponent(tripId)}/stops/${encodeURIComponent(stopId)}`,
    z.object({}).strict(),
    { method: "DELETE" },
  );
}

export function reorderStops(
  tripId: string,
  dayId: string,
  orderedStopIds: readonly string[],
  expectedVersion?: number,
) {
  return gatewayClient.request(
    `trips/${encodeURIComponent(tripId)}/days/${encodeURIComponent(dayId)}/stops/order`,
    z.object({}).strict(),
    {
      method: "PUT",
      body: { orderedStopIds },
      expectedVersion,
    },
  );
}

export function moveStop(
  tripId: string,
  stopId: string,
  targetDayId: string,
  targetIndex: number,
  expectedVersion?: number,
) {
  return gatewayClient.request(
    `trips/${encodeURIComponent(tripId)}/stops/${encodeURIComponent(stopId)}/day`,
    z.object({}).strict(),
    {
      method: "PUT",
      body: { targetDayId, targetIndex },
      expectedVersion,
    },
  );
}

export function updateTripVisibility(
  tripId: string,
  visibility: "PRIVATE" | "UNLISTED" | "PUBLISHED",
) {
  return gatewayClient.request(
    `trips/${encodeURIComponent(tripId)}/visibility`,
    z
      .object({
        visibility: z.string(),
        publishedAt: z.string().nullable(),
        version: z.number(),
      })
      .strict(),
    {
      method: "PATCH",
      body: { visibility },
    },
  );
}

export function updateStop(
  tripId: string,
  stop: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    notes: string | null;
    version: number;
  },
) {
  return gatewayClient.request(
    `trips/${encodeURIComponent(tripId)}/stops/${encodeURIComponent(stop.id)}`,
    z.object({ version: z.number().int().positive() }).strict(),
    {
      method: "PATCH",
      expectedVersion: stop.version,
      body: {
        name: stop.name,
        address: stop.address,
        latitude: stop.latitude,
        longitude: stop.longitude,
        notes: stop.notes,
      },
    },
  );
}

export function previewRoute(
  coordinates: readonly { latitude: number; longitude: number }[],
) {
  return gatewayClient.request("routes/preview", routePreviewSchema, {
    method: "POST",
    body: { coordinates, vehicle: "motorcycle" },
  });
}
export function createInvitation(
  tripId: string,
  email: string,
  permission: "VIEW" | "EDIT",
) {
  return gatewayClient.request(
    `trips/${encodeURIComponent(tripId)}/invitations`,
    createdInvitationSchema,
    { method: "POST", body: { email, permission } },
  );
}
export function getInvitation(token: string) {
  return gatewayClient.request(
    `trip-invitations/${encodeURIComponent(token)}`,
    invitationSchema,
  );
}
export function respondToInvitation(
  token: string,
  action: "accept" | "decline",
) {
  return gatewayClient.request(
    `trip-invitations/${encodeURIComponent(token)}/${action}`,
    invitationSchema,
    { method: "POST" },
  );
}
export function listInvitations(tripId: string) {
  return gatewayClient.request(
    `trips/${encodeURIComponent(tripId)}/invitations`,
    invitationSchema.array(),
  );
}
export function listMembers(tripId: string) {
  return gatewayClient.request(
    `trips/${encodeURIComponent(tripId)}/members`,
    memberSchema.array(),
  );
}
export function changeMemberPermission(
  tripId: string,
  userId: string,
  permission: "VIEW" | "EDIT",
) {
  return gatewayClient.request(
    `trips/${encodeURIComponent(tripId)}/members/${encodeURIComponent(userId)}`,
    z.object({}).strict(),
    { method: "PATCH", body: { permission } },
  );
}
export function removeMember(tripId: string, userId: string) {
  return gatewayClient.request(
    `trips/${encodeURIComponent(tripId)}/members/${encodeURIComponent(userId)}`,
    z.object({}).strict(),
    { method: "DELETE" },
  );
}
export function revokeInvitation(tripId: string, invitationId: string) {
  return gatewayClient.request(
    `trips/${encodeURIComponent(tripId)}/invitations/${encodeURIComponent(invitationId)}`,
    z.object({}).strict(),
    { method: "DELETE" },
  );
}

export function updateTripStatus(
  tripId: string,
  status: "PLANNING" | "ONGOING" | "COMPLETED" | "CANCELLED",
) {
  return gatewayClient.request(
    `trips/${encodeURIComponent(tripId)}/status`,
    z.object({ status: z.string(), version: z.number() }).strict(),
    {
      method: "PATCH",
      body: { status },
    },
  );
}

export function getTripMemory(tripId: string) {
  return gatewayClient.request(
    `trips/${encodeURIComponent(tripId)}/memory`,
    tripMemorySchema,
  );
}

export function updateTripMemory(
  tripId: string,
  data: {
    title: string;
    summary: string | null;
    visibility: "PRIVATE" | "UNLISTED" | "PUBLISHED";
    coverPhotoUrl?: string | null;
  },
) {
  return gatewayClient.request(
    `trips/${encodeURIComponent(tripId)}/memory`,
    updatedTripMemorySchema,
    {
      method: "PUT",
      body: data,
    },
  );
}

export function addTripMemoryPhoto(
  tripId: string,
  photo: { photoUrl: string; caption?: string | null },
) {
  return gatewayClient.request(
    `trips/${encodeURIComponent(tripId)}/memory/photos`,
    createdTripMemoryPhotoSchema,
    {
      method: "POST",
      body: photo,
    },
  );
}

export function listTripExpenses(tripId: string) {
  return gatewayClient.request(
    `trips/${encodeURIComponent(tripId)}/expenses`,
    tripExpenseSchema.array(),
  );
}

export function addTripExpense(
  tripId: string,
  expense: {
    amount: number;
    currency?: string;
    category: string;
    description: string;
  },
) {
  return gatewayClient.request(
    `trips/${encodeURIComponent(tripId)}/expenses`,
    tripExpenseSchema,
    {
      method: "POST",
      body: expense,
    },
  );
}

export function deleteTripExpense(tripId: string, expenseId: string) {
  return gatewayClient.request(
    `trips/${encodeURIComponent(tripId)}/expenses/${encodeURIComponent(expenseId)}`,
    z.object({}).strict(),
    {
      method: "DELETE",
    },
  );
}

export function updateTripLocation(
  tripId: string,
  location: {
    latitude: number;
    longitude: number;
    sharingActive?: boolean;
    consentGiven?: boolean;
  },
) {
  return gatewayClient.request(
    `trips/${encodeURIComponent(tripId)}/location`,
    tripLiveLocationSchema,
    {
      method: "POST",
      body: location,
    },
  );
}

export function listTripLocations(tripId: string) {
  return gatewayClient.request(
    `trips/${encodeURIComponent(tripId)}/locations`,
    tripLiveLocationSchema.array(),
  );
}
