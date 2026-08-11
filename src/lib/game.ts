import { tursoExecute } from "@/lib/turso";
import { GAME } from "@/lib/shit-token";

/** Ensure game tables exist (idempotent). */
export async function ensureGameSchema() {
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS player_clout (
      player_id TEXT PRIMARY KEY,
      twitter TEXT,
      wallet TEXT,
      xp INTEGER NOT NULL DEFAULT 0,
      votes INTEGER NOT NULL DEFAULT 0,
      burns INTEGER NOT NULL DEFAULT 0,
      shit_burned REAL NOT NULL DEFAULT 0,
      streak INTEGER NOT NULL DEFAULT 0,
      last_vote_day TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    []
  );
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS shit_burns (
      signature TEXT PRIMARY KEY,
      player_id TEXT NOT NULL,
      amount REAL NOT NULL,
      xp_awarded INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    []
  );
}

export async function getPlayer(playerId: string) {
  await ensureGameSchema();
  const r = await tursoExecute(
    `SELECT player_id, twitter, wallet, xp, votes, burns, shit_burned, streak, last_vote_day
     FROM player_clout WHERE player_id = ?`,
    [playerId]
  );
  const row = r.rows[0];
  if (!row) return null;
  return {
    playerId: String(row[0]),
    twitter: row[1] ? String(row[1]) : null,
    wallet: row[2] ? String(row[2]) : null,
    xp: Number(row[3] || 0),
    votes: Number(row[4] || 0),
    burns: Number(row[5] || 0),
    shitBurned: Number(row[6] || 0),
    streak: Number(row[7] || 0),
    lastVoteDay: row[8] ? String(row[8]) : null,
  };
}

export async function awardVoteXp(opts: {
  playerId: string;
  twitter?: string | null;
  wallet?: string | null;
}) {
  await ensureGameSchema();
  const today = new Date().toISOString().slice(0, 10);
  const existing = await getPlayer(opts.playerId);
  let streak = 1;
  if (existing?.lastVoteDay) {
    const prev = existing.lastVoteDay;
    const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (prev === today) {
      // already voted today for XP streak purposes — still count vote xp once? award small
      streak = existing.streak;
    } else if (prev === y) {
      streak = existing.streak + 1;
    } else {
      streak = 1;
    }
  }
  const streakBonus = Math.min(
    GAME.xpStreakCap,
    Math.max(0, streak - 1) * GAME.xpStreakPerDay
  );
  const gain = GAME.xpVote + streakBonus;

  if (!existing) {
    await tursoExecute(
      `INSERT INTO player_clout (player_id, twitter, wallet, xp, votes, streak, last_vote_day)
       VALUES (?, ?, ?, ?, 1, ?, ?)`,
      [
        opts.playerId,
        opts.twitter || null,
        opts.wallet || null,
        gain,
        streak,
        today,
      ]
    );
  } else {
    await tursoExecute(
      `UPDATE player_clout SET
         xp = xp + ?,
         votes = votes + 1,
         streak = ?,
         last_vote_day = ?,
         twitter = COALESCE(?, twitter),
         wallet = COALESCE(?, wallet),
         updated_at = datetime('now')
       WHERE player_id = ?`,
      [
        gain,
        streak,
        today,
        opts.twitter || null,
        opts.wallet || null,
        opts.playerId,
      ]
    );
  }
  return { gain, streak, xp: (existing?.xp || 0) + gain };
}

export async function topClout(limit = 20) {
  await ensureGameSchema();
  const r = await tursoExecute(
    `SELECT player_id, twitter, wallet, xp, votes, burns, shit_burned, streak
     FROM player_clout ORDER BY xp DESC LIMIT ?`,
    [limit]
  );
  return r.rows.map((row) => ({
    playerId: String(row[0]),
    twitter: row[1] ? String(row[1]) : null,
    wallet: row[2] ? String(row[2]) : null,
    xp: Number(row[3] || 0),
    votes: Number(row[4] || 0),
    burns: Number(row[5] || 0),
    shitBurned: Number(row[6] || 0),
    streak: Number(row[7] || 0),
  }));
}
