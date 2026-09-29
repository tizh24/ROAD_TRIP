"use client";

import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import {
  GatewayApiError,
  requestGateway,
  type GatewayRequestOptions,
} from "./gateway-request";

function gatewayBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL;
  if (!value) throw new Error("Thiếu NEXT_PUBLIC_API_URL.");
  return value;
}

export class GatewayClient {
  async request<T extends z.ZodType>(
    path: string,
    schema: T,
    options: Omit<
      GatewayRequestOptions,
      "baseUrl" | "accessToken" | "path"
    > = {},
  ): Promise<z.infer<T>> {
    const {
      data: { session },
    } = await createClient().auth.getSession();
    if (!session?.access_token)
      throw new GatewayApiError("AUTH_REQUIRED", "Please sign in to continue.");
    return requestGateway(
      {
        ...options,
        baseUrl: gatewayBaseUrl(),
        accessToken: session.access_token,
        path,
      },
      schema,
    );
  }
}

export const gatewayClient = new GatewayClient();
