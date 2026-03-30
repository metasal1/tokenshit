CREATE TABLE IF NOT EXISTS referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_twitter TEXT NOT NULL,
  referred_twitter TEXT NOT NULL,
  referred_wallet TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_referral_unique ON referrals(referred_twitter);
CREATE INDEX IF NOT EXISTS idx_referrer ON referrals(referrer_twitter);
