import { z } from "zod";

export const orderRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  tripId: z.string().uuid().nullable().optional(),
  itemType: z.enum(["TRAVEL_BOOK", "PARTNER_SERVICE", "SUBSCRIPTION", "OTHER"]),
  itemId: z.string(),
  title: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"]),
  paymentMethod: z.string().nullable().optional(),
  paymentRef: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string(),
});

export type OrderRecord = z.infer<typeof orderRecordSchema>;

export const travelBookRecordSchema = z.object({
  id: z.string().uuid(),
  tripId: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  subtitle: z.string().nullable().optional(),
  format: z.enum(["DIGITAL_PDF", "SOFTCOVER", "HARDCOVER"]),
  pageCount: z.number(),
  coverPhotoUrl: z.string().nullable().optional(),
  shippingAddress: z
    .object({
      recipientName: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
    })
    .nullable()
    .optional(),
  status: z.enum(["DRAFT", "ORDERED", "PRINTING", "SHIPPED", "DELIVERED"]),
  orderId: z.string().uuid().nullable().optional(),
  previewData: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string(),
});

export type TravelBookRecord = z.infer<typeof travelBookRecordSchema>;
