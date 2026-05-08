-- Email signups collected from logged-in users (Privy uses Twitter login,
-- so email is not captured at auth time).

CREATE TABLE IF NOT EXISTS email_signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  twitter_handle TEXT,
  wallet_address TEXT,
  privy_id TEXT,
  source TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_signups_twitter ON email_signups(twitter_handle);
CREATE INDEX IF NOT EXISTS idx_email_signups_wallet ON email_signups(wallet_address);
