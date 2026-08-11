import { tursoExecute } from "@/lib/turso";
import { X_HANDLE, X_USER_ID } from "@/lib/shit-token";

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
};

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min — X credits are tight
const g = globalThis as unknown as {
  __xProfileCache?: { at: number; data: XProfileMetrics };
};

function xBearer(): string {
  return (
    process.env.X_BEARER_TOKEN ||
    process.env.TWITTER_BEARER_TOKEN ||
    process.env.X_USER_BEARER ||
    ""
  );
}

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
       FROM x_profile_cache WHERE id = ? LIMIT 1`,
      [X_USER_ID]
    );
    if (!r.rows.length) return null;
    const row = r.rows[0];
    return {
      id: String(row[0]),
      username: String(row[1]),
      name: String(row[2] || row[1]),
      followers: Number(row[3] || 0),
      following: Number(row[4] || 0),
      tweets: Number(row[5] || 0),
      likes: Number(row[6] || 0),
      profileImageUrl: row[7] ? String(row[7]) : undefined,
      updatedAt: String(row[8] || new Date().toISOString()),
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
        m.id,
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

async function fetchLive(): Promise<XProfileMetrics | null> {
  const bearer = xBearer();
  if (!bearer) return null;

  // Prefer id lookup (stable); fall back to username
  const urls = [
    `https://api.x.com/2/users/${X_USER_ID}?user.fields=public_metrics,profile_image_url,name,username`,
    `https://api.x.com/2/users/by/username/${encodeURIComponent(X_HANDLE)}?user.fields=public_metrics,profile_image_url,name,username`,
    `https://api.x.com/2/users/me?user.fields=public_metrics,profile_image_url,name,username`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${bearer}`,
          "User-Agent": "TokenShit/1.0",
        },
        cache: "no-store",
      });
      if (!res.ok) continue;
      const json = await res.json();
      const d = json.data;
      if (!d?.id) continue;
      // If /me returned a different user, skip unless username matches
      if (
        d.username &&
        String(d.username).toLowerCase() !== X_HANDLE.toLowerCase() &&
        String(d.id) !== X_USER_ID
      ) {
        continue;
      }
      const pm = d.public_metrics || {};
      return {
        id: String(d.id),
        username: String(d.username || X_HANDLE),
        name: String(d.name || "TOKENSHIT"),
        followers: Number(pm.followers_count || 0),
        following: Number(pm.following_count || 0),
        tweets: Number(pm.tweet_count || 0),
        likes: Number(pm.like_count || 0),
        profileImageUrl: d.profile_image_url
          ? String(d.profile_image_url).replace("_normal", "_bigger")
          : undefined,
        updatedAt: new Date().toISOString(),
        source: "live",
      };
    } catch {
      continue;
    }
  }
  return null;
}

export async function getXProfileMetrics(opts?: {
  force?: boolean;
}): Promise<XProfileMetrics> {
  const force = Boolean(opts?.force);
  const mem = g.__xProfileCache;
  if (!force && mem && Date.now() - mem.at < CACHE_TTL_MS) {
    return { ...mem.data, source: "cache" };
  }

  const live = await fetchLive();
  if (live) {
    g.__xProfileCache = { at: Date.now(), data: live };
    await writeDbCache(live);
    return live;
  }

  const db = await readDbCache();
  if (db) {
    g.__xProfileCache = { at: Date.now(), data: db };
    return db;
  }

  // Last-known seed from last successful xurl whoami (2026-08)
  const fallback: XProfileMetrics = {
    id: X_USER_ID,
    username: X_HANDLE,
    name: "TOKENSHIT",
    followers: 44,
    following: 0,
    tweets: 10,
    likes: 14,
    updatedAt: new Date().toISOString(),
    source: "fallback",
  };
  return fallback;
}
