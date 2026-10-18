import { z } from "zod";

export const communityPostSchema = z.object({
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

export const communityCommentSchema = z.object({
  id: z.string().uuid(),
  postId: z.string().uuid(),
  authorId: z.string().uuid(),
  authorName: z.string(),
  authorAvatar: z.string().nullable().optional(),
  content: z.string(),
  createdAt: z.string(),
});

export type CommunityComment = z.infer<typeof communityCommentSchema>;

export const userProfileSchema = z.object({
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
