/**
 * Simplify x-profile: use fetchXUserPublic chain; always refresh stale low cache.
 */
import { tursoExecute } from "@/lib/turso";
import { X_HANDLE, X_USER_ID } from "@/lib/shit-token";
import { fetchXUserPublic } from "@/lib/x-data";

export type XProfileMetrics = {
  username: string;
  name: string;
  id: string;
  followers: number;
  following: number;
  tweets: number;
  likes: number;
  profileImageUrl?: string;
  updatedAt: string;
  source: "live" | "cache" | "fallback";
  liveSource?: string;
  liveError?: string;
};

const CACHE_TTL_MS = 45 * 60 * 1000;
const g = globalThis as unknown as {
  __xProfileCache?: { at: number; data: XProfileMetrics };
};

export async function ensureXMetricsSchema() {
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS x_profile_cache (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      name TEXT,
      followers INTEGER NOT NULL DEFAULT 0,
      following INTEGER NOT NULL DEFAULT 0,
      tweets INTEGER NOT NULL DEFAULT 0,
      likes INTEGER NOT NULL DEFAULT 0,
      profile_image_url TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    []
  );
}

async function readDbCache(): Promise<XProfileMetrics | null> {
  try {
    await ensureXMetricsSchema();
    const r = await tursoExecute(
      `SELECT id, username, name, followers, following, tweets, likes, profile_image_url, updated_at
       FROM x_profile_cache WHERE id = ? OR lower(username) = lower(?)
       ORDER BY datetime(updated_at) DESC LIMIT 1`,
      [X_USER_ID, X_HANDLE]
    );
    if (!r.rows.length) return null;
    const row = r.rows[0];
    const updatedAt = String(row[8] || "");
    return {
      id: String(row[0]),
      username: String(row[1]),
      name: String(row[2] || row[1]),
      followers: Number(row[3] || 0),
      following: Number(row[4] || 0),
      tweets: Number(row[5] || 0),
      likes: Number(row[6] || 0),
      profileImageUrl: row[7] ? String(row[7]) : undefined,
      updatedAt: updatedAt.includes("T")
        ? updatedAt
        : updatedAt.replace(" ", "T") + "Z",
      source: "cache",
    };
  } catch {
    return null;
  }
}

async function writeDbCache(m: XProfileMetrics) {
  try {
    await ensureXMetricsSchema();
    await tursoExecute(
      `INSERT INTO x_profile_cache
        (id, username, name, followers, following, tweets, likes, profile_image_url, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
         username = excluded.username,
         name = excluded.name,
         followers = excluded.followers,
         following = excluded.following,
         tweets = excluded.tweets,
         likes = excluded.likes,
         profile_image_url = excluded.profile_image_url,
         updated_at = datetime('now')`,
      [
        m.id || X_USER_ID,
        m.username,
        m.name,
        m.followers,
        m.following,
        m.tweets,
        m.likes,
        m.profileImageUrl || null,
      ]
    );
  } catch {
    /* ignore */
  }
}

export async function getXProfileMetrics(opts?: {
  force?: boolean;
}): Promise<XProfileMetrics> {
  const force = Boolean(opts?.force);
  const mem = g.__xProfileCache;
  if (!force && mem && Date.now() - mem.at < CACHE_TTL_MS && mem.data.followers > 0) {
    return { ...mem.data, source: "cache" };
  }

  let liveError: string | undefined;
  try {
    const m = await fetchXUserPublic(X_HANDLE);
    if (m.ok && m.followers > 0) {
      const data: XProfileMetrics = {
        id: m.id || X_USER_ID,
        username: m.username || X_HANDLE,
        name: m.name || "TOKENSHIT",
        followers: m.followers,
        following: m.following,
        tweets: m.tweets,
        likes: 0,
        profileImageUrl: m.profileImageUrl,
        updatedAt: new Date().toISOString(),
        source: "live",
        liveSource: m.source,
      };
      // Prefer higher of live vs previous cache if free source under-reports
      const prev = mem?.data || (await readDbCache());
      if (
        prev &&
        prev.followers > data.followers &&
        m.source !== "x-official" &&
        m.source !== "tweetapi" &&
        prev.followers - data.followers < 50
      ) {
        // small dip on free API — keep max
        data.followers = Math.max(data.followers, prev.followers);
      }
      g.__xProfileCache = { at: Date.now(), data };
      void writeDbCache(data);
      return data;
    }
    liveError = m.error || "no followers";
  } catch (e) {
    liveError = e instanceof Error ? e.message : String(e);
  }

  const db = await readDbCache();
  if (db && db.followers > 0) {
    g.__xProfileCache = { at: Date.now(), data: db };
    return { ...db, source: "cache", liveError };
  }

  return {
    id: X_USER_ID,
    username: X_HANDLE,
    name: "TOKENSHIT",
    followers: 0,
    following: 0,
    tweets: 0,
    likes: 0,
    updatedAt: new Date().toISOString(),
    source: "fallback",
    liveError: liveError || "no cache",
  };
}
