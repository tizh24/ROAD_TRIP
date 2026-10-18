import { z } from "zod";
import { requestGateway } from "@/features/trip-planning/api/gateway-request";
import {
  orderRecordSchema,
  travelBookRecordSchema,
  type OrderRecord,
  type TravelBookRecord,
} from "./billing-model";

export type { OrderRecord, TravelBookRecord };

function gatewayUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4100";
}

export async function createBillingOrder(data: {
  itemType: "TRAVEL_BOOK" | "PARTNER_SERVICE" | "SUBSCRIPTION" | "OTHER";
  itemId: string;
  title: string;
  amount: number;
  currency?: string;
  tripId?: string;
  metadata?: Record<string, any>;
}): Promise<OrderRecord> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: "api/v1/billing/orders",
      method: "POST",
      body: data,
    },
    orderRecordSchema,
  );
}

export async function getBillingOrder(orderId: string): Promise<OrderRecord> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: `api/v1/billing/orders/${orderId}`,
    },
    orderRecordSchema,
  );
}

export async function listBillingOrders(): Promise<readonly OrderRecord[]> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: "api/v1/billing/orders",
    },
    z.array(orderRecordSchema),
  );
}

export async function getOrCreateTravelBook(tripId: string): Promise<TravelBookRecord> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: `api/v1/travel-books/trip/${tripId}`,
    },
    travelBookRecordSchema,
  );
}

export async function getTravelBook(bookId: string): Promise<TravelBookRecord> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: `api/v1/travel-books/${bookId}`,
    },
    travelBookRecordSchema,
  );
}

export async function updateTravelBook(
  bookId: string,
  data: Partial<{
    title: string;
    subtitle: string;
    format: "DIGITAL_PDF" | "SOFTCOVER" | "HARDCOVER";
    coverPhotoUrl: string | null;
    shippingAddress: {
      recipientName?: string;
      phone?: string;
      address?: string;
      city?: string;
    };
  }>,
): Promise<{ id: string }> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: `api/v1/travel-books/${bookId}`,
      method: "PATCH",
      body: data,
    },
    z.object({ id: z.string().uuid() }),
  );
}
