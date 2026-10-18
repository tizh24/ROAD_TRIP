import { z } from "zod";
import { gatewayClient } from "./gateway-client";

const trip = z.object({
  id: z.string().uuid(), title: z.string(), description: z.string().nullable(),
  startDate: z.string(), endDate: z.string(), budgetAmount: z.number(), currency: z.string(),
});

export type PublicTrip = z.infer<typeof trip>;

export function listPublicTrips() {
  return gatewayClient.request("api/v1/public/trips", z.array(trip));
}

export function getPublicTrip(id: string) {
  return gatewayClient.request(`api/v1/public/trips/${encodeURIComponent(id)}`, trip.extend({ days: z.array(z.object({ id: z.string().uuid(), date: z.string(), dayIndex: z.number(), stops: z.array(z.object({ id: z.string().uuid(), placeId: z.string(), name: z.string(), address: z.string(), latitude: z.number(), longitude: z.number(), notes: z.string().nullable(), stopIndex: z.number(), version: z.number() })) })) }));
}

export function clonePublicTrip(id: string, idempotencyKey: string) {
  return gatewayClient.request(`api/v1/public/trips/${encodeURIComponent(id)}/clone`, z.object({ id: z.string().uuid() }), { method: "POST", idempotencyKey });
}
