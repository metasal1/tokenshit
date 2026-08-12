/**
 * Privy account count for public ticker.
 * Paginated GET /api/v1/users — cached in Turso to avoid full scans every poll.
 */
import { tursoExecute } from "@/lib/turso";

const PRIVY_APP_ID =
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || process.env.PRIVY_APP_ID || "";
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET || "";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_PAGES = 200;

async function ensureCache() {
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS app_stats (
      key TEXT PRIMARY KEY,
      value_num REAL,
      value_text TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    []
  );
}

function basicAuth(): string {
  // btoa-compatible for Workers
  const raw = `${PRIVY_APP_ID}:${PRIVY_APP_SECRET}`;
  if (typeof btoa === "function") {
    return btoa(raw);
  }
  return Buffer.from(raw, "utf8").toString("base64");
}

async function fetchPrivyUserCountFresh(): Promise<number> {
  if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
    throw new Error("Privy app credentials missing");
  }
  const auth = basicAuth();
  let cursor: string | null = null;
  let total = 0;
  for (let page = 0; page < MAX_PAGES; page++) {
    const url = new URL("https://auth.privy.io/api/v1/users");
    url.searchParams.set("limit", "100");
    if (cursor) url.searchParams.set("cursor", cursor);
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Basic ${auth}`,
        "privy-app-id": PRIVY_APP_ID,
        "User-Agent": "TokenShit/1.0",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Privy users ${res.status}: ${t.slice(0, 160)}`);
    }
    const json = (await res.json()) as {
      data?: unknown[];
      next_cursor?: string | null;
    };
    const batch = Array.isArray(json.data) ? json.data.length : 0;
    total += batch;
    cursor = json.next_cursor || null;
    if (!cursor || batch === 0) break;
  }
  return total;
}

async function readCache(): Promise<{
  users: number;
  updatedAt: string | null;
  ageMs: number | null;
} | null> {
  try {
    await ensureCache();
    const r = await tursoExecute(
      `SELECT value_num, updated_at FROM app_stats WHERE key = 'privy_users' LIMIT 1`,
      []
    );
    if (!r.rows.length) return null;
    const users = Number(r.rows[0][0] ?? 0);
    const updatedAt = r.rows[0][1] != null ? String(r.rows[0][1]) : null;
    let ageMs: number | null = null;
    if (updatedAt) {
      // Turso datetime is UTC-ish "YYYY-MM-DD HH:MM:SS"
      const t = Date.parse(updatedAt.includes("T") ? updatedAt : updatedAt.replace(" ", "T") + "Z");
      if (Number.isFinite(t)) ageMs = Date.now() - t;
    }
    return { users, updatedAt, ageMs };
  } catch {
    return null;
  }
}

async function writeCache(users: number) {
  await ensureCache();
  await tursoExecute(
    `INSERT INTO app_stats (key, value_num, updated_at)
     VALUES ('privy_users', ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET
       value_num = excluded.value_num,
       updated_at = datetime('now')`,
    [users]
  );
}

/**
 * Cached Privy account count. force=true bypasses TTL.
 */
export async function getPrivyUserCount(opts?: {
  force?: boolean;
}): Promise<{
  users: number;
  source: "privy" | "cache" | "fallback";
  cached: boolean;
  updatedAt?: string | null;
  error?: string;
}> {
  const cached = await readCache();
  const freshEnough =
    cached &&
    cached.ageMs != null &&
    cached.ageMs >= 0 &&
    cached.ageMs < CACHE_TTL_MS &&
    !opts?.force;

  if (freshEnough && cached) {
    return {
      users: cached.users,
      source: "cache",
      cached: true,
      updatedAt: cached.updatedAt,
    };
  }

  try {
    const users = await fetchPrivyUserCountFresh();
    await writeCache(users).catch(() => {});
    return {
      users,
      source: "privy",
      cached: false,
      updatedAt: new Date().toISOString(),
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (cached && cached.users > 0) {
      return {
        users: cached.users,
        source: "fallback",
        cached: true,
        updatedAt: cached.updatedAt,
        error: msg,
      };
    }
    return {
      users: 0,
      source: "fallback",
      cached: false,
      error: msg,
    };
  }
}
