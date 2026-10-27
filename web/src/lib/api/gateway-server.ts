import "server-only";

import { cookies, headers } from "next/headers";

type GatewayEnvelope<T> = {
  data?: T;
  error?: { code?: string; message?: string };
};

function gatewayBaseUrl() {
  // NEXT_PUBLIC_API_URL is inlined at build time for the browser. Server actions in a container
  // need the gateway address on the internal network, supplied at runtime.
  return process.env.GATEWAY_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4100";
}

export async function gatewayPublic<T>(path: string): Promise<GatewayEnvelope<T>> {
  try {
    const response = await fetch(new URL(`/api/v1${path}`, gatewayBaseUrl()), { cache: "no-store" });
    return (await response.json()) as GatewayEnvelope<T>;
  } catch { return { error: { code: "GATEWAY_UNAVAILABLE" } }; }
}

export async function gatewayMutation<T>(
  path: string,
  body: unknown,
): Promise<GatewayEnvelope<T>> {
  const cookieStore = await cookies();
  const csrf = cookieStore.get(process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME ?? "rt_csrf")?.value;
  try {
    const response = await fetch(new URL(`/api/v1${path}`, gatewayBaseUrl()), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: cookieStore.toString(),
        ...(csrf ? { "x-csrf-token": csrf } : {}),
        ...(await requestOrigin() ? { origin: await requestOrigin() } : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    await copyGatewayCookies(response);
    return (await response.json()) as GatewayEnvelope<T>;
  } catch {
    return { error: { code: "GATEWAY_UNAVAILABLE" } };
  }
}

export async function gatewayProfileMutation(
  body: { fullName: string },
): Promise<GatewayEnvelope<unknown>> {
  const cookieStore = await cookies();
  const csrf = cookieStore.get(process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME ?? "rt_csrf")?.value;
  try {
    const response = await fetch(new URL("/api/v1/profile", gatewayBaseUrl()), {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        cookie: cookieStore.toString(),
        ...(csrf ? { "x-csrf-token": csrf } : {}),
        ...(await requestOrigin() ? { origin: await requestOrigin() } : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    return (await response.json()) as GatewayEnvelope<unknown>;
  } catch {
    return { error: { code: "GATEWAY_UNAVAILABLE" } };
  }
}

export async function gatewayCurrentSession(): Promise<GatewayEnvelope<{
  id: string;
  email?: string;
  platformRole?: "USER" | "PARTNER" | "MODERATOR" | "ADMIN";
}>> {
  const cookieStore = await cookies();
  try {
    const response = await fetch(new URL("/api/v1/me", gatewayBaseUrl()), {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    });
    return (await response.json()) as GatewayEnvelope<{
      id: string;
      email?: string;
      platformRole?: "USER" | "PARTNER" | "MODERATOR" | "ADMIN";
    }>;
  } catch {
    return { error: { code: "GATEWAY_UNAVAILABLE" } };
  }
}

export async function gatewayProfile(): Promise<GatewayEnvelope<{
  fullName: string;
  email: string;
}>> {
  const cookieStore = await cookies();
  try {
    const response = await fetch(new URL("/api/v1/profile", gatewayBaseUrl()), {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    });
    return (await response.json()) as GatewayEnvelope<{
      fullName: string;
      email: string;
    }>;
  } catch {
    return { error: { code: "GATEWAY_UNAVAILABLE" } };
  }
}

async function requestOrigin() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (!host) return undefined;
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

async function copyGatewayCookies(response: Response) {
  const setCookie = response.headers.get("set-cookie");
  if (!setCookie) return;
  const cookieStore = await cookies();
  for (const rawCookie of setCookie.split(/,(?=[^;]+=)/)) {
    const [first, ...attributes] = rawCookie.split(";").map((part) => part.trim());
    const index = first.indexOf("=");
    if (index < 1) continue;
    const parsed = new Map(
      attributes.map((attribute) => {
        const separator = attribute.indexOf("=");
        return separator > 0
          ? [attribute.slice(0, separator).toLowerCase(), attribute.slice(separator + 1)]
          : [attribute.toLowerCase(), ""];
      }),
    );
    cookieStore.set(first.slice(0, index), first.slice(index + 1), {
      httpOnly: parsed.has("httponly"),
      secure: parsed.has("secure"),
      sameSite: parsed.get("samesite")?.toLowerCase() === "strict" ? "strict" : "lax",
      path: parsed.get("path") ?? "/",
      ...(parsed.get("domain") ? { domain: parsed.get("domain") } : {}),
      ...(parsed.get("max-age") ? { maxAge: Number(parsed.get("max-age")) } : {}),
    });
  }
}
