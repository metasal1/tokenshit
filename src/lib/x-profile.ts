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
  /** Present when live fetch failed */
  liveError?: string;
};

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 min
const g = globalThis as unknown as {
  __xProfileCache?: { at: number; data: XProfileMetrics };
  __xProfileLiveErr?: string;
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
    const updatedAt = String(row[8] || "");
    // SQLite datetime is UTC-ish without Z — treat as expired if parse fails age check below
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

function cacheAgeMs(m: XProfileMetrics): number {
  const t = Date.parse(m.updatedAt);
  if (!Number.isFinite(t)) return Number.POSITIVE_INFINITY;
  return Date.now() - t;
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

async function fetchLive(): Promise<{
  data: XProfileMetrics | null;
  error?: string;
}> {
  const bearer = xBearer();
  if (!bearer) return { data: null, error: "X_BEARER_TOKEN missing" };

  const urls = [
    `https://api.x.com/2/users/${X_USER_ID}?user.fields=public_metrics,profile_image_url,name,username`,
    `https://api.x.com/2/users/by/username/${encodeURIComponent(X_HANDLE)}?user.fields=public_metrics,profile_image_url,name,username`,
  ];

  const errors: string[] = [];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${bearer}`,
          "User-Agent": "TokenShit/1.0",
        },
        cache: "no-store",
      });
      const text = await res.text();
      if (!res.ok) {
        errors.push(`${res.status}:${text.slice(0, 120)}`);
        continue;
      }
      let json: { data?: Record<string, unknown> };
      try {
        json = JSON.parse(text);
      } catch {
        errors.push("non-json");
        continue;
      }
      const d = json.data as
        | {
            id?: string;
            username?: string;
            name?: string;
            profile_image_url?: string;
            public_metrics?: Record<string, number>;
          }
        | undefined;
      if (!d?.id) {
        errors.push("no data.id");
        continue;
      }
      if (
        d.username &&
        String(d.username).toLowerCase() !== X_HANDLE.toLowerCase() &&
        String(d.id) !== X_USER_ID
      ) {
        errors.push(`wrong user @${d.username}`);
        continue;
      }
      const pm = d.public_metrics || {};
      return {
        data: {
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
        },
      };
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }
  return { data: null, error: errors.join(" | ") || "live fetch failed" };
}

export async function getXProfileMetrics(opts?: {
  force?: boolean;
}): Promise<XProfileMetrics> {
  const force = Boolean(opts?.force);
  const mem = g.__xProfileCache;
  if (!force && mem && Date.now() - mem.at < CACHE_TTL_MS) {
    return { ...mem.data, source: mem.data.source === "live" ? "cache" : mem.data.source };
  }

  const live = await fetchLive();
  if (live.data) {
    g.__xProfileLiveErr = undefined;
    g.__xProfileCache = { at: Date.now(), data: live.data };
    await writeDbCache(live.data);
    return live.data;
  }
  g.__xProfileLiveErr = live.error;

  const db = await readDbCache();
  if (db) {
    const age = cacheAgeMs(db);
    // Still serve stale DB, but mark cache; client can force refresh
    g.__xProfileCache = { at: Date.now(), data: db };
    return {
      ...db,
      source: "cache",
      liveError: live.error,
      // keep true updatedAt so UI can show staleness
    };
  }

  const fallback: XProfileMetrics = {
    id: X_USER_ID,
    username: X_HANDLE,
    name: "TOKENSHIT",
    followers: 0,
    following: 0,
    tweets: 0,
    likes: 0,
    updatedAt: new Date().toISOString(),
    source: "fallback",
    liveError: live.error || "no cache",
  };
  return fallback;
}
