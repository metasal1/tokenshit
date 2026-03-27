-- Phase 2 Migration: Add users table and refactor votes

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  solana_address TEXT UNIQUE NOT NULL,
  twitter_id TEXT UNIQUE,
  twitter_handle TEXT,
  email TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  metadata JSON
);

CREATE INDEX IF NOT EXISTS idx_users_solana_address ON users(solana_address);
CREATE INDEX IF NOT EXISTS idx_users_twitter_id ON users(twitter_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Alter votes table to add user_id
-- First, check if the column already exists before adding
-- SQLite doesn't have IF NOT EXISTS for ALTER TABLE, so we handle errors gracefully
ALTER TABLE votes ADD COLUMN user_id TEXT REFERENCES users(id);

-- 3. Create new unique constraint (one vote per user per token per day)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_token_date 
  ON votes(user_id, asset_id, DATE(voted_at));

-- 4. Optional: Create a sessions table for managing auth state
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reown_session_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- 5. Optional: Create a leaderboard view (top voted tokens)
CREATE VIEW IF NOT EXISTS leaderboard AS
  SELECT 
    asset_id,
    SUM(CASE WHEN vote = 'hit' THEN 1 ELSE 0 END) as hits,
    SUM(CASE WHEN vote = 'shit' THEN 1 ELSE 0 END) as shits,
    COUNT(*) as total_votes,
    ROUND(100.0 * SUM(CASE WHEN vote = 'hit' THEN 1 ELSE 0 END) / COUNT(*), 1) as hit_rate
  FROM votes
  WHERE DATE(voted_at) = DATE('now')
  GROUP BY asset_id
  ORDER BY total_votes DESC;
