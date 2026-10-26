-- Migration: 20261018040000_add_slice_4_community_and_social.sql
-- Slice 4: Community posts, comments, likes, saves, reports, follows, and moderation

CREATE SCHEMA IF NOT EXISTS community_schema;
CREATE SCHEMA IF NOT EXISTS users_schema;
GRANT USAGE ON SCHEMA users_schema TO authenticated, service_role, postgres;
GRANT USAGE ON SCHEMA community_schema TO authenticated, service_role, postgres;

-- 1. Posts table
CREATE TABLE IF NOT EXISTS community_schema.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id uuid REFERENCES trip_schema.trips(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text NOT NULL,
  media_urls text[] NOT NULL DEFAULT '{}',
  location_name text,
  status text NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('PUBLISHED', 'HIDDEN', 'FLAGGED', 'DELETED')),
  like_count integer NOT NULL DEFAULT 0 CHECK (like_count >= 0),
  save_count integer NOT NULL DEFAULT 0 CHECK (save_count >= 0),
  comment_count integer NOT NULL DEFAULT 0 CHECK (comment_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Comments table
CREATE TABLE IF NOT EXISTS community_schema.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_schema.posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'VISIBLE' CHECK (status IN ('VISIBLE', 'HIDDEN', 'DELETED')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Post Likes
CREATE TABLE IF NOT EXISTS community_schema.post_likes (
  post_id uuid NOT NULL REFERENCES community_schema.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- 4. Post Saves
CREATE TABLE IF NOT EXISTS community_schema.post_saves (
  post_id uuid NOT NULL REFERENCES community_schema.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- 5. Reports (Content moderation)
CREATE TABLE IF NOT EXISTS community_schema.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('POST', 'COMMENT', 'TRIP', 'USER')),
  target_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RESOLVED', 'DISMISSED')),
  resolution_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Follows
CREATE TABLE IF NOT EXISTS users_schema.follows (
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT follows_not_self CHECK (follower_id <> following_id)
);

-- Enable RLS
ALTER TABLE community_schema.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_schema.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_schema.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_schema.post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_schema.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_schema.follows ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA community_schema TO authenticated, service_role;
GRANT SELECT, INSERT, DELETE ON TABLE users_schema.follows TO authenticated, service_role;

-- Policies for posts: visible if PUBLISHED or owner
CREATE POLICY posts_select_policy ON community_schema.posts
  FOR SELECT TO authenticated
  USING (status = 'PUBLISHED' OR author_id = auth.uid());

CREATE POLICY posts_insert_policy ON community_schema.posts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY posts_update_policy ON community_schema.posts
  FOR UPDATE TO authenticated
  USING (auth.uid() = author_id);

-- Policies for comments
CREATE POLICY comments_select_policy ON community_schema.comments
  FOR SELECT TO authenticated
  USING (status = 'VISIBLE' OR author_id = auth.uid());

CREATE POLICY comments_insert_policy ON community_schema.comments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Policies for likes, saves, follows
CREATE POLICY likes_all_policy ON community_schema.post_likes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY saves_all_policy ON community_schema.post_saves FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY follows_all_policy ON users_schema.follows FOR ALL TO authenticated USING (auth.uid() = follower_id) WITH CHECK (auth.uid() = follower_id);
CREATE POLICY reports_insert_policy ON community_schema.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
