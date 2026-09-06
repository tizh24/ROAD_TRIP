import { z } from "zod";
import { gatewayClient } from "./gateway-client";
import { createTripInputSchema, placeSchema, routePreviewSchema, stopMutationSchema, tripDetailSchema, tripListSchema, type CreateTripInput, type Place } from "./trip-model";

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
  return gatewayClient.request(`trips/${encodeURIComponent(tripId)}`, tripDetailSchema);
}

export function searchPlaces(query: string, signal?: AbortSignal) {
  return gatewayClient.request(`places/search?q=${encodeURIComponent(query)}`, placeSchema.array(), { signal });
}

export function addStop(tripId: string, dayId: string, place: Place, idempotencyKey: string) {
  return gatewayClient.request(`trips/${encodeURIComponent(tripId)}/days/${encodeURIComponent(dayId)}/stops`, stopMutationSchema, {
    method: "POST", idempotencyKey,
    body: { placeId: place.id, name: place.name, address: place.address, latitude: place.coordinate.latitude, longitude: place.coordinate.longitude },
  });
}

export function removeStop(tripId: string, stopId: string) {
  return gatewayClient.request(`trips/${encodeURIComponent(tripId)}/stops/${encodeURIComponent(stopId)}`, z.object({}).strict(), { method: "DELETE" });
}

export function reorderStops(tripId: string, dayId: string, orderedStopIds: readonly string[]) {
  return gatewayClient.request(`trips/${encodeURIComponent(tripId)}/days/${encodeURIComponent(dayId)}/stops/order`, z.object({}).strict(), { method: "PUT", body: { orderedStopIds } });
}

export function moveStop(tripId: string, stopId: string, targetDayId: string, targetIndex: number) {
  return gatewayClient.request(`trips/${encodeURIComponent(tripId)}/stops/${encodeURIComponent(stopId)}/day`, z.object({}).strict(), { method: "PUT", body: { targetDayId, targetIndex } });
}

export function updateStop(tripId: string, stop: { id: string; name: string; address: string; latitude: number; longitude: number; notes: string | null; version: number }) {
  return gatewayClient.request(`trips/${encodeURIComponent(tripId)}/stops/${encodeURIComponent(stop.id)}`, z.object({ version: z.number().int().positive() }).strict(), {
    method: "PATCH", expectedVersion: stop.version,
    body: { name: stop.name, address: stop.address, latitude: stop.latitude, longitude: stop.longitude, notes: stop.notes },
  });
}

export function previewRoute(coordinates: readonly { latitude: number; longitude: number }[]) {
  return gatewayClient.request("routes/preview", routePreviewSchema, { method: "POST", body: { coordinates, vehicle: "motorcycle" } });
}
