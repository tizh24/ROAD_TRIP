import { z } from "zod";
import { requestGateway } from "@/features/trip-planning/api/gateway-request";
import {
  communityCommentSchema,
  communityPostSchema,
  userProfileSchema,
  type CommunityComment,
  type CommunityPost,
  type UserProfile,
} from "./community-model";

export type { CommunityComment, CommunityPost, UserProfile };

function gatewayUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4100";
}

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
