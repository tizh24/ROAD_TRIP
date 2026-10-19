import type { QueryExecutor } from '@roadtrip/db-client';

export class CommunityRepository {
  constructor(private readonly database: QueryExecutor) {}

  async listPosts(currentUserId?: string, limit = 20, offset = 0) {
    const res = await this.database.query<{
      id: string;
      author_id: string;
      author_name: string | null;
      author_avatar: string | null;
      trip_id: string | null;
      trip_title: string | null;
      title: string;
      content: string;
      media_urls: string[];
      location_name: string | null;
      like_count: number;
      save_count: number;
      comment_count: number;
      has_liked: boolean;
      has_saved: boolean;
      created_at: string;
    }>(
      `SELECT
        p.id, p.author_id, p.trip_id, p.title, p.content, p.media_urls, p.location_name,
        p.like_count, p.save_count, p.comment_count, p.created_at,
        pr.full_name AS author_name, pr.avatar_url AS author_avatar,
        t.title AS trip_title,
        EXISTS(SELECT 1 FROM community_schema.post_likes pl WHERE pl.post_id = p.id AND pl.user_id = $1) AS has_liked,
        EXISTS(SELECT 1 FROM community_schema.post_saves ps WHERE ps.post_id = p.id AND ps.user_id = $1) AS has_saved
       FROM community_schema.posts p
       LEFT JOIN users_schema.profiles pr ON pr.id = p.author_id
       LEFT JOIN trip_schema.trips t ON t.id = p.trip_id
       WHERE p.status = 'PUBLISHED'
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [currentUserId || null, limit, offset],
    );

    return res.rows.map((r) => ({
      id: r.id,
      authorId: r.author_id,
      authorName: r.author_name || 'Người dùng Tripz',
      authorAvatar: r.author_avatar,
      tripId: r.trip_id,
      tripTitle: r.trip_title,
      title: r.title,
      content: r.content,
      mediaUrls: r.media_urls || [],
      locationName: r.location_name,
      likeCount: r.like_count,
      saveCount: r.save_count,
      commentCount: r.comment_count,
      hasLiked: r.has_liked,
      hasSaved: r.has_saved,
      createdAt: r.created_at,
    }));
  }

  async getPost(postId: string, currentUserId?: string) {
    const res = await this.database.query<{
      id: string;
      author_id: string;
      author_name: string | null;
      author_avatar: string | null;
      trip_id: string | null;
      trip_title: string | null;
      title: string;
      content: string;
      media_urls: string[];
      location_name: string | null;
      like_count: number;
      save_count: number;
      comment_count: number;
      has_liked: boolean;
      has_saved: boolean;
      created_at: string;
    }>(
      `SELECT
        p.id, p.author_id, p.trip_id, p.title, p.content, p.media_urls, p.location_name,
        p.like_count, p.save_count, p.comment_count, p.created_at,
        pr.full_name AS author_name, pr.avatar_url AS author_avatar,
        t.title AS trip_title,
        EXISTS(SELECT 1 FROM community_schema.post_likes pl WHERE pl.post_id = p.id AND pl.user_id = $2) AS has_liked,
        EXISTS(SELECT 1 FROM community_schema.post_saves ps WHERE ps.post_id = p.id AND ps.user_id = $2) AS has_saved
       FROM community_schema.posts p
       LEFT JOIN users_schema.profiles pr ON pr.id = p.author_id
       LEFT JOIN trip_schema.trips t ON t.id = p.trip_id
       WHERE p.id = $1 AND p.status = 'PUBLISHED'`,
      [postId, currentUserId || null],
    );
    const r = res.rows[0];
    if (!r) return null;
    return {
      id: r.id,
      authorId: r.author_id,
      authorName: r.author_name || 'Người dùng Tripz',
      authorAvatar: r.author_avatar,
      tripId: r.trip_id,
      tripTitle: r.trip_title,
      title: r.title,
      content: r.content,
      mediaUrls: r.media_urls || [],
      locationName: r.location_name,
      likeCount: r.like_count,
      saveCount: r.save_count,
      commentCount: r.comment_count,
      hasLiked: r.has_liked,
      hasSaved: r.has_saved,
      createdAt: r.created_at,
    };
  }

  async createPost(data: {
    authorId: string;
    title: string;
    content: string;
    tripId?: string | null;
    mediaUrls?: string[];
    locationName?: string | null;
  }) {
    const res = await this.database.query<{
      id: string;
      author_id: string;
      title: string;
      content: string;
      media_urls: string[];
      location_name: string | null;
      created_at: string;
    }>(
      `INSERT INTO community_schema.posts
        (author_id, title, content, trip_id, media_urls, location_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, author_id, title, content, media_urls, location_name, created_at`,
      [
        data.authorId,
        data.title,
        data.content,
        data.tripId || null,
        data.mediaUrls || [],
        data.locationName || null,
      ],
    );
    const r = res.rows[0]!;
    return {
      id: r.id,
      authorId: r.author_id,
      title: r.title,
      content: r.content,
      mediaUrls: r.media_urls,
      locationName: r.location_name,
      createdAt: r.created_at,
    };
  }

  async toggleLike(postId: string, userId: string) {
    const existing = await this.database.query(
      `SELECT 1 FROM community_schema.post_likes WHERE post_id = $1 AND user_id = $2`,
      [postId, userId],
    );
    if (existing.rows[0]) {
      await this.database.query(
        `DELETE FROM community_schema.post_likes WHERE post_id = $1 AND user_id = $2`,
        [postId, userId],
      );
      await this.database.query(
        `UPDATE community_schema.posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1`,
        [postId],
      );
      return { liked: false };
    } else {
      await this.database.query(
        `INSERT INTO community_schema.post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [postId, userId],
      );
      await this.database.query(
        `UPDATE community_schema.posts SET like_count = like_count + 1 WHERE id = $1`,
        [postId],
      );
      return { liked: true };
    }
  }

  async toggleSave(postId: string, userId: string) {
    const existing = await this.database.query(
      `SELECT 1 FROM community_schema.post_saves WHERE post_id = $1 AND user_id = $2`,
      [postId, userId],
    );
    if (existing.rows[0]) {
      await this.database.query(
        `DELETE FROM community_schema.post_saves WHERE post_id = $1 AND user_id = $2`,
        [postId, userId],
      );
      await this.database.query(
        `UPDATE community_schema.posts SET save_count = GREATEST(save_count - 1, 0) WHERE id = $1`,
        [postId],
      );
      return { saved: false };
    } else {
      await this.database.query(
        `INSERT INTO community_schema.post_saves (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [postId, userId],
      );
      await this.database.query(
        `UPDATE community_schema.posts SET save_count = save_count + 1 WHERE id = $1`,
        [postId],
      );
      return { saved: true };
    }
  }

  async listComments(postId: string) {
    const res = await this.database.query<{
      id: string;
      post_id: string;
      author_id: string;
      author_name: string | null;
      author_avatar: string | null;
      content: string;
      created_at: string;
    }>(
      `SELECT c.id, c.post_id, c.author_id, c.content, c.created_at,
              pr.full_name AS author_name, pr.avatar_url AS author_avatar
       FROM community_schema.comments c
       LEFT JOIN users_schema.profiles pr ON pr.id = c.author_id
       WHERE c.post_id = $1 AND c.status = 'VISIBLE'
       ORDER BY c.created_at ASC`,
      [postId],
    );
    return res.rows.map((r) => ({
      id: r.id,
      postId: r.post_id,
      authorId: r.author_id,
      authorName: r.author_name || 'Người dùng',
      authorAvatar: r.author_avatar,
      content: r.content,
      createdAt: r.created_at,
    }));
  }

  async createComment(data: {
    postId: string;
    authorId: string;
    content: string;
  }) {
    const res = await this.database.query<{
      id: string;
      post_id: string;
      author_id: string;
      content: string;
      created_at: string;
    }>(
      `INSERT INTO community_schema.comments (post_id, author_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, post_id, author_id, content, created_at`,
      [data.postId, data.authorId, data.content],
    );
    await this.database.query(
      `UPDATE community_schema.posts SET comment_count = comment_count + 1 WHERE id = $1`,
      [data.postId],
    );
    return res.rows[0]!;
  }

  async createReport(data: {
    reporterId: string;
    targetType: 'POST' | 'COMMENT' | 'TRIP' | 'USER';
    targetId: string;
    reason: string;
    details?: string | null;
  }) {
    const res = await this.database.query<{
      id: string;
      status: string;
      created_at: string;
    }>(
      `INSERT INTO community_schema.reports (reporter_id, target_type, target_id, reason, details)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, status, created_at`,
      [
        data.reporterId,
        data.targetType,
        data.targetId,
        data.reason,
        data.details || null,
      ],
    );
    return res.rows[0]!;
  }

  async toggleFollow(followerId: string, followingId: string) {
    if (followerId === followingId)
      throw new Error('Không thể theo dõi chính mình.');
    const existing = await this.database.query(
      `SELECT 1 FROM users_schema.follows WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId],
    );
    if (existing.rows[0]) {
      await this.database.query(
        `DELETE FROM users_schema.follows WHERE follower_id = $1 AND following_id = $2`,
        [followerId, followingId],
      );
      return { following: false };
    } else {
      await this.database.query(
        `INSERT INTO users_schema.follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [followerId, followingId],
      );
      return { following: true };
    }
  }

  async getUserProfile(targetUserId: string, currentUserId?: string) {
    const profileRes = await this.database.query<{
      id: string;
      full_name: string | null;
      avatar_url: string | null;
      created_at: string;
    }>(
      `SELECT id, full_name, avatar_url, created_at FROM users_schema.profiles WHERE id = $1`,
      [targetUserId],
    );
    const p = profileRes.rows[0];
    if (!p) return null;

    const [followersRes, followingRes, tripsRes, isFollowingRes] =
      await Promise.all([
        this.database.query<{ count: string }>(
          `SELECT COUNT(*) AS count FROM users_schema.follows WHERE following_id = $1`,
          [targetUserId],
        ),
        this.database.query<{ count: string }>(
          `SELECT COUNT(*) AS count FROM users_schema.follows WHERE follower_id = $1`,
          [targetUserId],
        ),
        this.database.query<{
          id: string;
          title: string;
          start_date: string;
          end_date: string;
          budget_amount: string;
          currency: string;
        }>(
          `SELECT id, title, start_date, end_date, budget_amount, currency
         FROM trip_schema.trips
         WHERE owner_id = $1 AND visibility = 'PUBLISHED' AND deleted_at IS NULL
         ORDER BY created_at DESC`,
          [targetUserId],
        ),
        currentUserId
          ? this.database.query(
              `SELECT 1 FROM users_schema.follows WHERE follower_id = $1 AND following_id = $2`,
              [currentUserId, targetUserId],
            )
          : Promise.resolve({ rows: [] }),
      ]);

    return {
      userId: p.id,
      fullName: p.full_name || 'Khách du lịch',
      avatarUrl: p.avatar_url,
      followerCount: parseInt(followersRes.rows[0]?.count || '0', 10),
      followingCount: parseInt(followingRes.rows[0]?.count || '0', 10),
      isFollowing: !!isFollowingRes.rows[0],
      publicTrips: tripsRes.rows.map((t) => ({
        id: t.id,
        title: t.title,
        startDate: t.start_date,
        endDate: t.end_date,
        budgetAmount: parseFloat(t.budget_amount),
        currency: t.currency,
      })),
    };
  }

  async listReports() {
    const res = await this.database.query<{
      id: string;
      reporter_id: string;
      target_type: string;
      target_id: string;
      reason: string;
      details: string | null;
      status: string;
      created_at: string;
    }>(
      `SELECT id, reporter_id, target_type, target_id, reason, details, status, created_at
       FROM community_schema.reports ORDER BY created_at DESC LIMIT 50`,
    );
    return res.rows;
  }

  async resolveReport(
    reportId: string,
    reviewerId: string,
    status: 'RESOLVED' | 'DISMISSED',
    notes?: string,
  ) {
    const res = await this.database.query<{ id: string; status: string }>(
      `UPDATE community_schema.reports
       SET status = $2, resolution_notes = $3, reviewed_by = $4, reviewed_at = now()
       WHERE id = $1
       RETURNING id, status`,
      [reportId, status, notes || null, reviewerId],
    );
    return res.rows[0];
  }

  async updatePostStatus(
    postId: string,
    status: 'PUBLISHED' | 'HIDDEN' | 'FLAGGED' | 'DELETED',
  ) {
    await this.database.query(
      `UPDATE community_schema.posts SET status = $2, updated_at = now() WHERE id = $1`,
      [postId, status],
    );
  }
}
