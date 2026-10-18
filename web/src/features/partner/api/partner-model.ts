import { z } from "zod";

export const partnerApplicationSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  applicantName: z.string().nullable().optional(),
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  taxId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["NONE", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"]),
  reviewNotes: z.string().nullable().optional(),
  reviewedBy: z.string().nullable().optional(),
  reviewedAt: z.string().nullable().optional(),
  createdAt: z.string().optional(),
});

export type PartnerApplication = z.infer<typeof partnerApplicationSchema>;

export const partnerListingSchema = z.object({
  id: z.string().uuid(),
  partnerId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  category: z.enum(["STAY", "FOOD", "EXPERIENCE", "TRANSPORT", "EQUIPMENT"]),
  locationName: z.string(),
  priceAmount: z.number(),
  priceCurrency: z.string(),
  mediaUrls: z.array(z.string()),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"]),
  createdAt: z.string(),
});

export type PartnerListing = z.infer<typeof partnerListingSchema>;

export const adminUserSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string(),
  email: z.string(),
  role: z.enum(["USER", "PARTNER", "MODERATOR", "ADMIN"]),
  status: z.enum(["ACTIVE", "BANNED", "DELETED"]),
  createdAt: z.string(),
});

export type AdminUser = z.infer<typeof adminUserSchema>;
