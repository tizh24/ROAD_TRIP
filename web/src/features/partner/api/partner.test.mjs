import assert from "node:assert/strict";
import test from "node:test";
import {
  partnerApplicationSchema,
  partnerListingSchema,
  adminUserSchema,
} from "./partner-model.ts";

test("validates partner application status schema contract", () => {
  const app = {
    id: "e0000000-0000-4000-8000-000000000001",
    userId: "d0000000-0000-4000-8000-000000000001",
    businessName: "Mộc Châu Xanh Homestay",
    businessType: "HOMESTAY",
    contactEmail: "mocchauxanh@gmail.com",
    contactPhone: "0987654321",
    taxId: "010999888",
    description: "Homestay view đồi chè",
    status: "PENDING",
    reviewNotes: null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: "2026-10-18T00:00:00.000Z",
  };

  const parsed = partnerApplicationSchema.parse(app);
  assert.equal(parsed.businessName, "Mộc Châu Xanh Homestay");
  assert.equal(parsed.status, "PENDING");
});

test("validates partner listing schema contract", () => {
  const listing = {
    id: "f0000000-0000-4000-8000-000000000001",
    partnerId: "d0000000-0000-4000-8000-000000000001",
    title: "Phòng đôi view đồi chè",
    description: "Bao gồm bữa sáng và trà chiều",
    category: "STAY",
    locationName: "Mộc Châu, Sơn La",
    priceAmount: 850000,
    priceCurrency: "VND",
    mediaUrls: ["https://example.com/room.jpg"],
    status: "ACTIVE",
    createdAt: "2026-10-18T00:00:00.000Z",
  };

  const parsed = partnerListingSchema.parse(listing);
  assert.equal(parsed.title, "Phòng đôi view đồi chè");
  assert.equal(parsed.category, "STAY");
  assert.equal(parsed.priceAmount, 850000);
});

test("validates admin user schema contract", () => {
  const user = {
    id: "a0000000-0000-4000-8000-000000000001",
    fullName: "Nguyễn Đối Tác",
    email: "partner@tripz.vn",
    role: "PARTNER",
    status: "ACTIVE",
    createdAt: "2026-10-18T00:00:00.000Z",
  };

  const parsed = adminUserSchema.parse(user);
  assert.equal(parsed.role, "PARTNER");
});
