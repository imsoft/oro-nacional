-- Migration: Rollback User Follows System
-- Description: Remove all tables, functions, and policies related to user follows
-- Version: 043
-- Created: 2025-01-XX

-- ================================================
-- 1. Drop functions (must be done before dropping table)
-- ================================================
DROP FUNCTION IF EXISTS get_followers(UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_following(UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS is_following(UUID, UUID);
DROP FUNCTION IF EXISTS get_following_count(UUID);
DROP FUNCTION IF EXISTS get_follower_count(UUID);

-- ================================================
-- 2. Drop RLS policies
-- ================================================
DROP POLICY IF EXISTS "Users can view all follows" ON user_follows;
DROP POLICY IF EXISTS "Users can create their own follows" ON user_follows;
DROP POLICY IF EXISTS "Users can delete their own follows" ON user_follows;

-- ================================================
-- 3. Drop indexes
-- ================================================
DROP INDEX IF EXISTS idx_user_follows_created_at;
DROP INDEX IF EXISTS idx_user_follows_following;
DROP INDEX IF EXISTS idx_user_follows_follower;

-- ================================================
-- 4. Drop the table (this will also drop all constraints)
-- ================================================
DROP TABLE IF EXISTS user_follows;

-- ================================================
-- 5. Remove comments (optional, but clean)
-- ================================================
-- Comments are automatically removed when tables/functions are dropped

