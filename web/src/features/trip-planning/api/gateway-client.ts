"use client";

import { z } from "zod";
import {
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
      "baseUrl" | "path"
    > = {},
  ): Promise<z.infer<T>> {
    return requestGateway(
      {
        ...options,
        baseUrl: gatewayBaseUrl(),
        path,
      },
      schema,
    );
  }
}

export const gatewayClient = new GatewayClient();
