import assert from "node:assert/strict";
import test from "node:test";
import {
  fetchCommunityPosts,
  togglePostLike,
  fetchUserProfile,
} from "./community.ts";

test("fetches and validates community posts list contract", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        data: [
          {
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
          },
        ],
        meta: { correlationId: "test-corr-1" },
      }),
      { status: 200 },
    );

  try {
    const posts = await fetchCommunityPosts();
    assert.equal(posts.length, 1);
    assert.equal(posts[0].title, "Kinh nghiệm săn mây Cầu Đất");
    assert.equal(posts[0].likeCount, 12);
    assert.equal(posts[0].hasLiked, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("toggles like on a community post", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        data: { liked: true },
        meta: { correlationId: "test-corr-2" },
      }),
      { status: 200 },
    );

  try {
    const result = await togglePostLike("a0000000-0000-0000-0000-000000000001");
    assert.deepEqual(result, { liked: true });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
