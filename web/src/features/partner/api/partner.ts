import { z } from "zod";
import { requestGateway } from "@/features/trip-planning/api/gateway-request";
import {
  adminUserSchema,
  partnerApplicationSchema,
  partnerListingSchema,
  type AdminUser,
  type PartnerApplication,
  type PartnerListing,
} from "./partner-model";

export type { AdminUser, PartnerApplication, PartnerListing };

function gatewayUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4100";
}

export async function submitPartnerApplication(data: {
  businessName: string;
  businessType: string;
  contactEmail: string;
  contactPhone: string;
  taxId?: string;
  description?: string;
}): Promise<PartnerApplication> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: "api/v1/partner/apply",
      method: "POST",
      body: data,
    },
    partnerApplicationSchema,
  );
}

export async function getPartnerApplication(): Promise<PartnerApplication> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: "api/v1/partner/application",
    },
    partnerApplicationSchema,
  );
}

export async function getPartnerListings(): Promise<readonly PartnerListing[]> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: "api/v1/partner/listings",
    },
    z.array(partnerListingSchema),
  );
}

export async function createPartnerListing(data: {
  title: string;
  description: string;
  category: "STAY" | "FOOD" | "EXPERIENCE" | "TRANSPORT" | "EQUIPMENT";
  locationName: string;
  priceAmount: number;
  priceCurrency?: string;
  mediaUrls?: string[];
  status?: "DRAFT" | "ACTIVE" | "PAUSED";
}): Promise<PartnerListing> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: "api/v1/partner/listings",
      method: "POST",
      body: data,
    },
    partnerListingSchema,
  );
}

export async function updatePartnerListing(
  listingId: string,
  data: Partial<{
    title: string;
    description: string;
    category: "STAY" | "FOOD" | "EXPERIENCE" | "TRANSPORT" | "EQUIPMENT";
    locationName: string;
    priceAmount: number;
    priceCurrency: string;
    mediaUrls: string[];
    status: "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED";
  }>,
): Promise<{ id: string }> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: `api/v1/partner/listings/${listingId}`,
      method: "PATCH",
      body: data,
    },
    z.object({ id: z.string().uuid() }),
  );
}

export async function deletePartnerListing(listingId: string): Promise<{ id: string; archived: boolean }> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: `api/v1/partner/listings/${listingId}`,
      method: "DELETE",
    },
    z.object({ id: z.string().uuid(), archived: z.boolean() }),
  );
}

export async function getAdminPartnerApplications(status?: string): Promise<readonly PartnerApplication[]> {
  const path = status ? `api/v1/admin/partners/applications?status=${status}` : "api/v1/admin/partners/applications";
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path,
    },
    z.array(partnerApplicationSchema),
  );
}

export async function reviewAdminPartnerApplication(
  applicationId: string,
  action: "APPROVE" | "REJECT",
  notes?: string,
): Promise<{ id: string; status: string }> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: `api/v1/admin/partners/applications/${applicationId}/review`,
      method: "POST",
      body: { action, notes },
    },
    z.object({ id: z.string().uuid(), status: z.string() }),
  );
}

export async function getAdminUsers(): Promise<readonly AdminUser[]> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: "api/v1/admin/users",
    },
    z.array(adminUserSchema),
  );
}

export async function updateAdminUserRole(
  userId: string,
  role: "USER" | "PARTNER" | "MODERATOR" | "ADMIN",
): Promise<unknown> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: `api/v1/admin/users/${userId}/role`,
      method: "PATCH",
      body: { role },
    },
    z.unknown(),
  );
}
