import { z } from "zod";

const errorResponseSchema = z
  .object({
    error: z
      .object({ code: z.string().min(1), message: z.string().min(1) })
      .strict(),
    meta: z.object({ correlationId: z.string().min(1) }).strict(),
  })
  .strict();

const successEnvelopeSchema = <T extends z.ZodType>(data: T) =>
  z
    .object({
      data,
      meta: z.object({ correlationId: z.string().min(1) }).passthrough(),
    })
    .strict();

export class GatewayApiError extends Error {
  readonly code: string;
  readonly correlationId: string | undefined;

  constructor(code: string, message: string, correlationId?: string) {
    super(message);
    this.name = "GatewayApiError";
    this.code = code;
    this.correlationId = correlationId;
  }
}

export interface GatewayRequestOptions {
  readonly baseUrl: string;
  readonly accessToken: string;
  readonly path: string;
  readonly method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  readonly body?: unknown;
  readonly correlationId?: string;
  readonly idempotencyKey?: string;
  readonly expectedVersion?: number;
  readonly fetch?: typeof fetch;
  readonly signal?: AbortSignal;
}

export async function requestGateway<T extends z.ZodType>(
  options: GatewayRequestOptions,
  schema: T,
): Promise<z.infer<T>> {
  const correlationId = options.correlationId ?? crypto.randomUUID();
  const headers = new Headers({
    authorization: `Bearer ${options.accessToken}`,
    "x-correlation-id": correlationId,
  });
  if (options.body !== undefined)
    headers.set("content-type", "application/json");
  if (options.idempotencyKey)
    headers.set("idempotency-key", options.idempotencyKey);
  if (options.expectedVersion !== undefined)
    headers.set("if-match", String(options.expectedVersion));

  let response: Response;
  try {
    response = await (options.fetch ?? fetch)(
      new URL(options.path, normalizeBaseUrl(options.baseUrl)),
      {
        method: options.method ?? "GET",
        headers,
        signal: options.signal,
        ...(options.body === undefined
          ? {}
          : { body: JSON.stringify(options.body) }),
      },
    );
  } catch {
    throw new GatewayApiError(
      "NETWORK_UNAVAILABLE",
      "Unable to reach the service.",
      correlationId,
    );
  }

  const body = await readJson(response);
  if (!response.ok) {
    const parsed = errorResponseSchema.safeParse(body);
    if (parsed.success)
      throw new GatewayApiError(
        parsed.data.error.code,
        parsed.data.error.message,
        parsed.data.meta.correlationId,
      );
    throw new GatewayApiError(
      "INTERNAL_ERROR",
      "The service returned an invalid error response.",
      correlationId,
    );
  }
  const parsed = successEnvelopeSchema(schema).safeParse(body);
  if (!parsed.success)
    throw new GatewayApiError(
      "INTERNAL_ERROR",
      "The service returned an invalid response.",
      correlationId,
    );
  return (parsed.data as { data: z.infer<T> }).data;
}

export function normalizeBaseUrl(value: string): string {
  const url = new URL(value);
  return url.pathname.endsWith("/") ? url.toString() : `${url.toString()}/`;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}
