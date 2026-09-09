import { z } from "zod";

const eventProperties = {
  login_completed: z.object({ method: z.enum(["password", "pkce"]) }).strict(),
  trip_creation_started: z.object({}).strict(),
  trip_created: z.object({ dayCount: z.number().int().min(1).max(30) }).strict(),
  first_stop_added: z.object({}).strict(),
  route_calculated: z.object({ outcome: z.enum(["success", "failure"]), stopCount: z.number().int().min(2), source: z.enum(["provider", "cache"]).optional() }).strict(),
  member_invited: z.object({ permission: z.enum(["VIEW", "EDIT"]) }).strict(),
  member_invitation_accepted: z.object({ permission: z.enum(["VIEW", "EDIT"]) }).strict(),
  trip_edit_resumed: z.object({ role: z.enum(["OWNER", "MEMBER"]), permission: z.enum(["VIEW", "EDIT"]) }).strict(),
} as const;

export type AnalyticsEventName = keyof typeof eventProperties;
export type AnalyticsProperties<Name extends AnalyticsEventName> = z.infer<(typeof eventProperties)[Name]>;
export type AnalyticsEnvelope = { eventId: string; name: AnalyticsEventName; occurredAt: string; properties: Record<string, unknown> };
type AnalyticsStorage = Pick<globalThis.Storage, "getItem" | "setItem">;
type Options = { dedupeKey?: string; storage?: AnalyticsStorage; transport?: (event: AnalyticsEnvelope) => void; now?: () => Date; randomUUID?: () => string };

export function trackAnalytics<Name extends AnalyticsEventName>(name: Name, properties: AnalyticsProperties<Name>, options: Options = {}) {
  const parsed = eventProperties[name].parse(properties) as Record<string, unknown>;
  const storage = options.storage ?? safeSessionStorage();
  const key = options.dedupeKey ? `roadtrip:analytics:${name}:${options.dedupeKey}` : undefined;
  if (key && storage?.getItem(key)) return false;
  const event: AnalyticsEnvelope = { eventId: options.randomUUID?.() ?? crypto.randomUUID(), name, occurredAt: (options.now ?? (() => new Date()))().toISOString(), properties: parsed };
  (options.transport ?? browserTransport)(event);
  if (key) storage?.setItem(key, event.eventId);
  return true;
}

function safeSessionStorage(): AnalyticsStorage | undefined {
  try { return typeof window === "undefined" ? undefined : window.sessionStorage; } catch { return undefined; }
}

function browserTransport(event: AnalyticsEnvelope) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("roadtrip:analytics", { detail: event }));
  const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_URL;
  if (!endpoint) return;
  const body = JSON.stringify(event);
  if (!navigator.sendBeacon?.(endpoint, new Blob([body], { type: "application/json" }))) {
    void fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true, credentials: "omit" });
  }
}
