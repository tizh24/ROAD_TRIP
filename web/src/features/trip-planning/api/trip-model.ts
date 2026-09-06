import { z } from "zod";

export const tripListItemSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().min(1),
    startDate: z.string().date(),
    endDate: z.string().date(),
    status: z.enum(["PLANNING", "ONGOING", "COMPLETED", "CANCELLED"]),
    role: z.enum(["OWNER", "MEMBER"]),
    permission: z.enum(["VIEW", "EDIT"]),
    version: z.number().int().positive(),
  })
  .strict();

export const tripListSchema = z.array(tripListItemSchema);

export type TripListItem = z.infer<typeof tripListItemSchema>;

export const tripDetailSchema = tripListItemSchema
  .extend({
    ownerId: z.string().uuid(),
    description: z.string().nullable(),
    budgetAmount: z.number().nonnegative(),
    currency: z.string().length(3),
    days: z.array(z.object({
      id: z.string().uuid(), date: z.string().date(), dayIndex: z.number().int().positive(),
      stops: z.array(z.object({
        id: z.string().uuid(), placeId: z.string(), name: z.string(), address: z.string(),
        latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180),
        notes: z.string().nullable(), stopIndex: z.number().int().positive(), version: z.number().int().positive(),
      }).strict()),
    }).strict()),
  })
  .strict();

export const createTripInputSchema = z
  .object({
    title: z.string().trim().min(1, "Nhập tên chuyến đi.").max(120),
    description: z.string().trim().max(2_000).nullable(),
    startDate: z.string().date(),
    endDate: z.string().date(),
    budgetAmount: z.number().nonnegative(),
    currency: z.literal("VND"),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.endDate < value.startDate) {
      context.addIssue({ code: "custom", path: ["endDate"], message: "Ngày kết thúc phải sau ngày bắt đầu." });
    }
    const start = new Date(`${value.startDate}T00:00:00Z`);
    const end = new Date(`${value.endDate}T00:00:00Z`);
    if ((end.getTime() - start.getTime()) / 86_400_000 + 1 > 30) {
      context.addIssue({ code: "custom", path: ["endDate"], message: "Chuyến đi tối đa 30 ngày." });
    }
  });

export type CreateTripInput = z.infer<typeof createTripInputSchema>;
export type TripDetail = z.infer<typeof tripDetailSchema>;

export const placeSchema = z.object({
  id: z.string().min(1), name: z.string().min(1), address: z.string().min(1),
  coordinate: z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) }).strict(),
}).strict();
export type Place = z.infer<typeof placeSchema>;

export const stopMutationSchema = z.object({
  id: z.string().uuid(), tripId: z.string().uuid(), dayId: z.string().uuid(), stopIndex: z.number().int().positive(), version: z.number().int().positive(),
}).strict();

export const routePreviewSchema = z.object({
  geometry: z.object({ type: z.literal("LineString"), coordinates: z.array(z.tuple([z.number(), z.number()])).min(2) }).strict(),
  distanceMeters: z.number().nonnegative(), durationSeconds: z.number().nonnegative(), source: z.enum(["provider", "cache"]), calculatedAt: z.string(),
}).strict();
