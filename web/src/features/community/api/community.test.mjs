import assert from "node:assert/strict";
import test from "node:test";
import {
  communityPostSchema,
  userProfileSchema,
} from "./community-model.ts";

test("fetches and validates community posts list contract", async () => {
  const post = {
    id: "a0000000-0000-4000-8000-000000000001",
    authorId: "b0000000-0000-4000-8000-000000000001",
    authorName: "Traveler Nguyen",
    authorAvatar: null,
    tripId: "c0000000-0000-4000-8000-000000000001",
    tripTitle: "Chuyến đi Đà Lạt 3 ngày 2 đêm",
    title: "Kinh nghiệm săn mây Cầu Đất",
    content: "Nên dậy từ 4h sáng để bắt trọn bình minh...",
    mediaUrls: ["https://example.com/dalat.jpg"],
    locationName: "Cầu Đất, Đà Lạt",
    likeCount: 12,
    saveCount: 5,
    commentCount: 3,
    hasLiked: true,
    hasSaved: false,
    createdAt: "2026-10-18T00:00:00.000Z",
  };

  const parsed = communityPostSchema.parse(post);
  assert.equal(parsed.title, "Kinh nghiệm săn mây Cầu Đất");
  assert.equal(parsed.likeCount, 12);
  assert.equal(parsed.hasLiked, true);
});

test("validates user profile schema contract", async () => {
  const profile = {
    userId: "d0000000-0000-4000-8000-000000000001",
    fullName: "Nguyễn Văn Phượt",
    avatarUrl: null,
    followerCount: 25,
    followingCount: 10,
    isFollowing: true,
    publicTrips: [
      {
        id: "e0000000-0000-4000-8000-000000000001",
        title: "Đà Lạt Mộng Mơ",
        startDate: "2026-11-01",
        endDate: "2026-11-04",
        budgetAmount: 3500000,
        currency: "VND",
      },
    ],
  };

  const parsed = userProfileSchema.parse(profile);
  assert.equal(parsed.fullName, "Nguyễn Văn Phượt");
  assert.equal(parsed.publicTrips.length, 1);
});
