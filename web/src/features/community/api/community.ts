import { z } from "zod";
import { requestGateway } from "../../trip-planning/api/gateway-request.ts";

function gatewayUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4100";
}

const communityPostSchema = z.object({
  id: z.string().uuid(),
  authorId: z.string().uuid(),
  authorName: z.string(),
  authorAvatar: z.string().nullable().optional(),
  tripId: z.string().uuid().nullable().optional(),
  tripTitle: z.string().nullable().optional(),
  title: z.string(),
  content: z.string(),
  mediaUrls: z.array(z.string()),
  locationName: z.string().nullable().optional(),
  likeCount: z.number(),
  saveCount: z.number(),
  commentCount: z.number(),
  hasLiked: z.boolean(),
  hasSaved: z.boolean(),
  createdAt: z.string(),
});

export type CommunityPost = z.infer<typeof communityPostSchema>;

const communityCommentSchema = z.object({
  id: z.string().uuid(),
  postId: z.string().uuid(),
  authorId: z.string().uuid(),
  authorName: z.string(),
  authorAvatar: z.string().nullable().optional(),
  content: z.string(),
  createdAt: z.string(),
});

export type CommunityComment = z.infer<typeof communityCommentSchema>;

const userProfileSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string(),
  avatarUrl: z.string().nullable().optional(),
  followerCount: z.number(),
  followingCount: z.number(),
  isFollowing: z.boolean(),
  publicTrips: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      budgetAmount: z.number(),
      currency: z.string(),
    }),
  ),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

export async function fetchCommunityPosts(limit = 20, offset = 0): Promise<readonly CommunityPost[]> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: `api/v1/community/posts?limit=${limit}&offset=${offset}`,
    },
    z.array(communityPostSchema),
  );
}

export async function fetchCommunityPost(postId: string): Promise<CommunityPost> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: `api/v1/community/posts/${postId}`,
    },
    communityPostSchema,
  );
}

export async function createCommunityPost(data: {
  title: string;
  content: string;
  tripId?: string;
  mediaUrls?: string[];
  locationName?: string;
}): Promise<CommunityPost> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: "api/v1/community/posts",
      method: "POST",
      body: data,
    },
    communityPostSchema,
  );
}

export async function togglePostLike(postId: string): Promise<{ liked: boolean }> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: `api/v1/community/posts/${postId}/like`,
      method: "POST",
    },
    z.object({ liked: z.boolean() }),
  );
}

export async function togglePostSave(postId: string): Promise<{ saved: boolean }> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: `api/v1/community/posts/${postId}/save`,
      method: "POST",
    },
    z.object({ saved: z.boolean() }),
  );
}

export async function fetchPostComments(postId: string): Promise<readonly CommunityComment[]> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: `api/v1/community/posts/${postId}/comments`,
    },
    z.array(communityCommentSchema),
  );
}

export async function createPostComment(postId: string, content: string): Promise<CommunityComment> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: `api/v1/community/posts/${postId}/comments`,
      method: "POST",
      body: { content },
    },
    communityCommentSchema,
  );
}

export async function toggleUserFollow(userId: string): Promise<{ following: boolean }> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: `api/v1/community/users/${userId}/follow`,
      method: "POST",
    },
    z.object({ following: z.boolean() }),
  );
}

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: `api/v1/community/users/${userId}/profile`,
    },
    userProfileSchema,
  );
}

export async function submitReport(data: {
  targetType: "POST" | "COMMENT" | "TRIP" | "USER";
  targetId: string;
  reason: string;
  details?: string;
}): Promise<{ id: string; status: string }> {
  return requestGateway(
    {
      baseUrl: gatewayUrl(),
      path: "api/v1/community/reports",
      method: "POST",
      body: data,
    },
    z.object({ id: z.string().uuid(), status: z.string() }),
  );
}
