import assert from "node:assert/strict";
import test from "node:test";
import {
  orderRecordSchema,
  travelBookRecordSchema,
} from "./billing-model.ts";

test("validates order record schema contract", () => {
  const order = {
    id: "a0000000-0000-4000-8000-000000000001",
    userId: "b0000000-0000-4000-8000-000000000001",
    tripId: "c0000000-0000-4000-8000-000000000001",
    itemType: "TRAVEL_BOOK",
    itemId: "d0000000-0000-4000-8000-000000000001",
    title: "Travel Book: Hà Giang Mùa Lúa Chín",
    amount: 499000,
    currency: "VND",
    status: "COMPLETED",
    paymentMethod: "VIETQR",
    paymentRef: "tx_123456",
    metadata: { format: "HARDCOVER", copies: 1 },
    createdAt: "2026-10-18T00:00:00.000Z",
  };

  const parsed = orderRecordSchema.parse(order);
  assert.equal(parsed.title, "Travel Book: Hà Giang Mùa Lúa Chín");
  assert.equal(parsed.amount, 499000);
  assert.equal(parsed.status, "COMPLETED");
});

test("validates travel book record schema contract", () => {
  const book = {
    id: "d0000000-0000-4000-8000-000000000001",
    tripId: "c0000000-0000-4000-8000-000000000001",
    userId: "b0000000-0000-4000-8000-000000000001",
    title: "Hành Trình Tây Bắc 2026",
    subtitle: "Tuyển tập ảnh và nhật ký cung đèo",
    format: "HARDCOVER",
    pageCount: 24,
    coverPhotoUrl: "https://example.com/cover.jpg",
    shippingAddress: {
      recipientName: "Nguyễn Văn Phượt",
      phone: "0912345678",
      address: "123 Cầu Giấy",
      city: "Hà Nội",
    },
    status: "DRAFT",
    orderId: null,
    previewData: { photosCount: 20 },
    createdAt: "2026-10-18T00:00:00.000Z",
  };

  const parsed = travelBookRecordSchema.parse(book);
  assert.equal(parsed.title, "Hành Trình Tây Bắc 2026");
  assert.equal(parsed.format, "HARDCOVER");
  assert.equal(parsed.pageCount, 24);
});
