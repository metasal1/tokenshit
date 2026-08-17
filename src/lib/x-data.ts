/**
 * X/Twitter public data for claims.
 * Cost order: memory → Turso → free fxtwitter → twitterapi.io → TweetAPI → official X (last).
 * Never dump raw API JSON to UI.
 */
import { tursoExecute } from "@/lib/turso";

const TWEETAPI_BASE = "https://api.tweetapi.com/tw-v2";
/** twitterapi.io — primary paid source (X-API-Key header) */
const TWITTERAPI_IO_BASE = "https://api.twitterapi.io";
const TOKENSHIT_ID = process.env.X_TOKENSHIT_USER_ID || "2037761105359986688";
const TOKENSHIT_USER = "tokenshit_";

/** Skip burning official X credits when recently 402/depleted */
let officialXCooldownUntil = 0;

const PROFILE_CACHE_MS = 30 * 60 * 1000; // in-memory per isolate
const TURSO_OK_TTL_MS = 6 * 60 * 60 * 1000; // durable success
const TURSO_FAIL_TTL_MS = 20 * 60 * 1000; // durable soft-fail
const OFFICIAL_COOLDOWN_MS = 2 * 60 * 60 * 1000;

function xBearer(): string {
  return (
    process.env.X_BEARER_TOKEN ||
    process.env.TWITTER_BEARER_TOKEN ||
    process.env.X_USER_BEARER ||
    ""
  ).trim();
}

function tweetApiKey(): string {
  return (
    process.env.TWEETAPI_KEY ||
    process.env.TWEET_API_KEY ||
    process.env.TWEETAPI_API_KEY ||
    ""
  ).trim();
}

function twitterApiIoKey(): string {
  return (
    process.env.TWITTERAPI_IO_KEY ||
    process.env.TWITTERAPI_IO ||
    process.env.TWITTER_API_IO_KEY ||
    ""
  ).trim();
}

/** Hard cap external lookups so claim UI never spins forever. */
async function fetchTimeout(
  url: string,
  init: RequestInit = {},
  ms = 8_000
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal, cache: "no-store" });
  } finally {
    clearTimeout(t);
  }
}

export function formatXApiError(status: number, body: string): string {
  const lower = body.toLowerCase();
  if (
    status === 402 ||
    lower.includes("credits depleted") ||
    lower.includes("credits-depleted") ||
    lower.includes("payment required")
  ) {
    return "X developer credits depleted on this app. Using backup data source when available — paste a tweet link for tweet claims.";
  }
  if (status === 429 || lower.includes("rate limit")) {
    return "X rate limit — wait a minute and try again.";
  }
  if (status === 401 || status === 403) {
    return "X API auth failed — check Tokenshit_ bearer / TweetAPI key.";
  }
  let detail = "";
  try {
    const j = JSON.parse(body);
    detail = j.title || j.detail || j.message || j.error || "";
  } catch {
    detail = body.replace(/\s+/g, " ").slice(0, 80);
  }
  return detail ? `X lookup error (${status}): ${detail}` : `X lookup error (${status})`;
}

export function parseTweetId(input: string): string | null {
  const s = (input || "").trim();
  if (!s) return null;
  if (/^\d{5,25}$/.test(s)) return s;
  const m = s.match(
    /(?:twitter\.com|x\.com)\/(?:i\/web\/status|i\/status|[^/]+\/status(?:es)?)\/(\d{5,25})/i
  );
  return m?.[1] || null;
}

/** Modern X snowflakes are usually 19 digits; shorter ids are often a cut paste. */
export function tweetIdLooksTruncated(id: string): boolean {
  return /^\d+$/.test(id) && id.length > 0 && id.length < 19;
}

export type XUserPublic = {
  ok: boolean;
  username?: string;
  id?: string;
  name?: string;
  followers: number;
  following: number;
  tweets: number;
  verified: boolean;
  /** X Premium / blue */
  premium: boolean;
  verifiedType: string;
  profileImageUrl?: string;
  hasPfp: boolean;
  error?: string;
  source?: string;
};


function withProfileFlags(u: {
  ok: boolean;
  username?: string;
  id?: string;
  name?: string;
  followers: number;
  following: number;
  tweets: number;
  verified: boolean;
  verifiedType?: string;
  premium?: boolean;
  /** twitterapi.io / tweetapi often set this without verified_type */
  isBlueVerified?: boolean;
  profileImageUrl?: string;
  error?: string;
  source?: string;
}): XUserPublic {
  let verifiedType = String(u.verifiedType || "none").toLowerCase().trim();
  if (!verifiedType || verifiedType === "null" || verifiedType === "undefined") {
    verifiedType = "none";
  }
  // "none" is truthy — never use `vt || "blue"`; that left blue users as non-premium
  const isBlue =
    Boolean(u.premium) ||
    Boolean(u.isBlueVerified) ||
    verifiedType === "blue" ||
    verifiedType === "business";
  const premium = isBlue;
  const verified =
    premium ||
    Boolean(u.verified) ||
    ["blue", "business", "government"].includes(verifiedType);
  if (premium && (verifiedType === "none" || !verifiedType)) {
    verifiedType = "blue";
  }
  const profileImageUrl = u.profileImageUrl;
  const hasPfp = Boolean(
    profileImageUrl &&
      !/default_profile_images|default_profile|abs\.twimg\.com\/sticky\/default/i.test(
        profileImageUrl
      )
  );
  return {
    ok: u.ok,
    username: u.username,
    id: u.id,
    name: u.name,
    followers: u.followers || 0,
    following: u.following || 0,
    tweets: u.tweets || 0,
    verified,
    premium,
    verifiedType: verifiedType || "none",
    profileImageUrl,
    hasPfp,
    error: u.error,
    source: u.source,
  };
}

async function fromOfficialX(username: string): Promise<any> {
  if (Date.now() < officialXCooldownUntil) {
    return {
      ok: false,
      followers: 0,
      following: 0,
      tweets: 0,
      verified: false,
      verifiedType: "none",
      error: "official X on cooldown (credits/rate)",
      source: "x-official",
    };
  }
  const bearer = xBearer();
  if (!bearer) return null;
  const clean = username.replace(/^@/, "").trim();
  const url = `https://api.x.com/2/users/by/username/${encodeURIComponent(
    clean
  )}?user.fields=public_metrics,verified,verified_type,name,username,profile_image_url`;
  const res = await fetchTimeout(url, {
    headers: {
      Authorization: `Bearer ${bearer}`,
      "User-Agent": "TokenShit/1.0",
    },
  });
  if (!res.ok) {
    const t = await res.text();
    // 402 etc — signal caller to try backup
    if (res.status === 402 || res.status === 429 || res.status === 401) {
      officialXCooldownUntil = Date.now() + OFFICIAL_COOLDOWN_MS;
      return { ok: false, followers: 0, following: 0, tweets: 0, verified: false, verifiedType: "none", error: formatXApiError(res.status, t), source: "x-official" };
    }
    return {
      ok: false,
      followers: 0,
      following: 0,
      tweets: 0,
      verified: false,
      verifiedType: "none",
      error: formatXApiError(res.status, t),
      source: "x-official",
    };
  }
  const json = await res.json();
  const d = json.data || {};
  const pm = d.public_metrics || {};
  const verifiedType = String(d.verified_type || "none").toLowerCase();
  const verified =
    Boolean(d.verified) ||
    ["blue", "business", "government"].includes(verifiedType);
  return {
    ok: true,
    username: String(d.username || clean),
    id: d.id ? String(d.id) : undefined,
    name: d.name ? String(d.name) : undefined,
    followers: Number(pm.followers_count || 0),
    following: Number(pm.following_count || 0),
    tweets: Number(pm.tweet_count || 0),
    verified,
    verifiedType,
    profileImageUrl: d.profile_image_url
      ? String(d.profile_image_url).replace("_normal", "_bigger")
      : undefined,
    source: "x-official",
  };
}

async function fromTwitterApiIoUser(username: string): Promise<any> {
  const key = twitterApiIoKey();
  if (!key) return null;
  const clean = username.replace(/^@/, "").trim();
  try {
    const res = await fetchTimeout(
      `${TWITTERAPI_IO_BASE}/twitter/user/info?userName=${encodeURIComponent(clean)}`,
      { headers: { "X-API-Key": key } },
      10_000
    );
    if (!res.ok) {
      const t = await res.text();
      return {
        ok: false,
        followers: 0,
        following: 0,
        tweets: 0,
        verified: false,
        verifiedType: "none",
        error: `twitterapi.io ${res.status}: ${t.slice(0, 100)}`,
        source: "twitterapi.io",
      };
    }
    const json = await res.json();
    const d = json.data || json;
    if (!d || json.status === "error") {
      return {
        ok: false,
        followers: 0,
        following: 0,
        tweets: 0,
        verified: false,
        verifiedType: "none",
        error: json.msg || "user not found",
        source: "twitterapi.io",
      };
    }
    const rawVt = String(d.verifiedType || d.verified_type || "").toLowerCase();
    const isBlueVerified = Boolean(d.isBlueVerified);
    const verified =
      isBlueVerified ||
      Boolean(d.isVerified) ||
      Boolean(d.verified) ||
      /blue|business|government/i.test(rawVt);
    const verifiedType = isBlueVerified
      ? "blue"
      : rawVt && rawVt !== "none"
        ? rawVt
        : verified
          ? "blue"
          : "none";
    return {
      ok: true,
      username: String(d.userName || d.username || clean),
      id: d.id ? String(d.id) : undefined,
      name: d.name ? String(d.name) : undefined,
      followers: Number(d.followers ?? d.followersCount ?? 0),
      following: Number(d.following ?? d.followingCount ?? 0),
      tweets: Number(d.statusesCount ?? d.statuses_count ?? d.tweets ?? 0),
      verified,
      premium: isBlueVerified || verifiedType === "blue",
      isBlueVerified,
      verifiedType,
      profileImageUrl: d.profilePicture
        ? String(d.profilePicture).replace("_normal", "_bigger")
        : d.profile_image_url
          ? String(d.profile_image_url).replace("_normal", "_bigger")
          : undefined,
      source: "twitterapi.io",
    };
  } catch (e) {
    return {
      ok: false,
      followers: 0,
      following: 0,
      tweets: 0,
      verified: false,
      verifiedType: "none",
      error: e instanceof Error ? e.message : "twitterapi.io user failed",
      source: "twitterapi.io",
    };
  }
}

async function fromTweetApiUser(username: string): Promise<any> {
  const key = tweetApiKey();
  if (!key) return null;
  const clean = username.replace(/^@/, "").trim();
  const res = await fetchTimeout(
    `${TWEETAPI_BASE}/user/by-username?username=${encodeURIComponent(clean)}`,
    {
      headers: { "X-API-Key": key, "User-Agent": "TokenShit/1.0" },
    }
  );
  if (!res.ok) {
    const t = await res.text();
    return {
      ok: false,
      followers: 0,
      following: 0,
      tweets: 0,
      verified: false,
      verifiedType: "none",
      error: `TweetAPI ${res.status}: ${t.slice(0, 120)}`,
      source: "tweetapi",
    };
  }
  const json = await res.json();
  const d = json.data || json;
  const rawVt = String(d.verifiedType || d.verified_type || "").toLowerCase();
  const isBlueVerified = Boolean(d.isBlueVerified);
  const verified =
    isBlueVerified || // premium blue
    Boolean(d.verified) ||
    Boolean(d.isIdentityVerified) ||
    /blue|business|government/i.test(rawVt);
  const verifiedType = isBlueVerified
    ? "blue"
    : rawVt && rawVt !== "none"
      ? rawVt
      : verified
        ? "blue"
        : "none";
  return {
    ok: true,
    username: String(d.username || clean),
    id: d.id ? String(d.id) : undefined,
    name: d.name ? String(d.name) : undefined,
    followers: Number(d.followerCount ?? d.followersCount ?? d.followers ?? 0),
    following: Number(d.followingCount ?? d.following ?? 0),
    tweets: Number(d.tweetCount ?? d.statusesCount ?? d.tweets ?? 0),
    verified,
    premium: isBlueVerified || verifiedType === "blue",
    isBlueVerified,
    verifiedType,
    profileImageUrl: d.avatar
      ? String(d.avatar).replace("_normal", "_bigger")
      : undefined,
    source: "tweetapi",
  };
}

async function fromFxTwitter(username: string): Promise<any> {
  const clean = username.replace(/^@/, "").trim();
  try {
    const res = await fetchTimeout(
      `https://api.fxtwitter.com/${encodeURIComponent(clean)}`,
      {
        headers: { "User-Agent": "TokenShit/1.0" },
      },
      6_000
    );
    if (!res.ok) return null;
    const json = await res.json();
    const u = json.user || {};
    if (!u.screen_name && !u.id) return null;
    return {
      ok: true,
      username: String(u.screen_name || clean),
      id: u.id ? String(u.id) : undefined,
      name: u.name ? String(u.name) : undefined,
      followers: Number(u.followers || 0),
      following: Number(u.following || 0),
      tweets: Number(u.tweets || 0),
      verified: Boolean(u.verified || u.is_blue_verified),
      verifiedType: u.verified || u.is_blue_verified ? "blue" : "none",
      profileImageUrl: u.avatar_url
        ? String(u.avatar_url).replace("_normal", "_bigger")
        : undefined,
      source: "fxtwitter",
    };
  } catch {
    return null;
  }
}

const profileCache = new Map<string, { at: number; val: XUserPublic }>();

let userLookupSchemaReady = false;
async function ensureUserLookupSchema() {
  if (userLookupSchemaReady) return;
  try {
    await tursoExecute(
      `CREATE TABLE IF NOT EXISTS x_user_lookup_cache (
        username TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      []
    );
    userLookupSchemaReady = true;
  } catch {
    /* turso optional at edge cold start */
  }
}

async function readTursoUser(username: string): Promise<XUserPublic | null> {
  try {
    await ensureUserLookupSchema();
    const r = await tursoExecute(
      `SELECT payload, updated_at FROM x_user_lookup_cache WHERE username = ? LIMIT 1`,
      [username.toLowerCase()]
    );
    if (!r.rows.length) return null;
    const payload = String(r.rows[0][0] || "");
    const updatedAt = String(r.rows[0][1] || "");
    const at = Date.parse(updatedAt.includes("T") ? updatedAt : updatedAt.replace(" ", "T") + "Z");
    if (!Number.isFinite(at)) return null;
    const val = JSON.parse(payload) as XUserPublic;
    const ttl = val.ok ? TURSO_OK_TTL_MS : TURSO_FAIL_TTL_MS;
    if (Date.now() - at > ttl) return null;
    return { ...val, source: val.source ? `${val.source}+cache` : "cache" };
  } catch {
    return null;
  }
}

async function writeTursoUser(username: string, val: XUserPublic) {
  try {
    await ensureUserLookupSchema();
    await tursoExecute(
      `INSERT INTO x_user_lookup_cache (username, payload, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(username) DO UPDATE SET
         payload = excluded.payload,
         updated_at = excluded.updated_at`,
      [username.toLowerCase(), JSON.stringify(val), new Date().toISOString()]
    );
  } catch {
    /* ignore */
  }
}

function remember(username: string, val: XUserPublic): XUserPublic {
  const key = username.toLowerCase();
  profileCache.set(key, { at: Date.now(), val });
  void writeTursoUser(key, val);
  return val;
}

export async function fetchXUserPublic(username: string): Promise<XUserPublic> {
  const clean = username.replace(/^@/, "").trim();
  if (!clean) {
    return withProfileFlags({
      ok: false,
      followers: 0,
      following: 0,
      tweets: 0,
      verified: false,
      verifiedType: "none",
      error: "no username",
    });
  }

  const key = clean.toLowerCase();
  const hit = profileCache.get(key);
  if (hit && Date.now() - hit.at < PROFILE_CACHE_MS) {
    return hit.val;
  }

  const cached = await readTursoUser(key);
  if (cached) {
    profileCache.set(key, { at: Date.now(), val: cached });
    return cached;
  }

  // 1) Free first — covers most ≥100 follower gates
  const fx = await fromFxTwitter(clean);
  if (fx?.ok && Number(fx.followers) > 0) {
    return remember(key, withProfileFlags(fx));
  }

  // 2) twitterapi.io (paid, reliable)
  const io = await fromTwitterApiIoUser(clean);
  if (io?.ok) {
    return remember(key, withProfileFlags(io));
  }

  // 3) TweetAPI.com
  const ta = await fromTweetApiUser(clean);
  if (ta?.ok) {
    return remember(key, withProfileFlags(ta));
  }

  // 4) Official X last (credits often depleted) — cooldown after 402/429
  const official = await fromOfficialX(clean);
  if (official?.ok) {
    return remember(key, withProfileFlags(official));
  }

  // Prefer free zero-follower success over hard fail when user exists
  if (fx?.ok) {
    return remember(key, withProfileFlags(fx));
  }

  const fail = io || ta || official || fx;
  if (fail) {
    const v = withProfileFlags(fail);
    // cache failures briefly to stop claim spam hammering APIs
    return remember(key, v);
  }
  return withProfileFlags({
    ok: false,
    followers: 0,
    following: 0,
    tweets: 0,
    verified: false,
    verifiedType: "none",
    error: "Could not load X profile (cache + free + paid sources failed)",
  });
}

export async function checkXVerified(username: string): Promise<{
  ok: boolean;
  verified: boolean;
  premium: boolean;
  verifiedType: string;
  followers?: number;
  hasPfp?: boolean;
  profileImageUrl?: string;
  error?: string;
}> {
  const m = await fetchXUserPublic(username);
  return {
    ok: m.ok,
    verified: m.verified,
    premium: Boolean(m.premium),
    verifiedType: m.verifiedType,
    followers: m.followers,
    hasPfp: m.hasPfp,
    profileImageUrl: m.profileImageUrl,
    error: m.error,
  };
}

/** Does sourceUser follow @Tokenshit_? */
const followCache = new Map<
  string,
  { at: number; val: { ok: boolean; following: boolean; error?: string; source?: string } }
>();
const FOLLOW_CACHE_MS = 30 * 60 * 1000;

export async function checkXFollowsTokenshit(username: string): Promise<{
  ok: boolean;
  following: boolean;
  error?: string;
  source?: string;
}> {
  const user = username.replace(/^@/, "").trim();
  if (!user) return { ok: false, following: false, error: "no username" };

  const fk = user.toLowerCase();
  const fc = followCache.get(fk);
  if (fc && Date.now() - fc.at < FOLLOW_CACHE_MS) {
    return { ...fc.val, source: (fc.val.source || "cache") + "+mem" };
  }

  const rememberFollow = (val: {
    ok: boolean;
    following: boolean;
    error?: string;
    source?: string;
  }) => {
    followCache.set(fk, { at: Date.now(), val });
    return val;
  };

  // 1) twitterapi.io relationship (cheap + works with new key)
  const ioKey = twitterApiIoKey();
  if (ioKey) {
    try {
      const url = new URL(
        `${TWITTERAPI_IO_BASE}/twitter/user/check_follow_relationship`
      );
      url.searchParams.set("source_user_name", user);
      url.searchParams.set("target_user_name", "Tokenshit_");
      const res = await fetchTimeout(
        url.toString(),
        { headers: { "X-API-Key": ioKey } },
        10_000
      );
      if (res.ok) {
        const json = (await res.json()) as {
          status?: string;
          data?: { following?: boolean; followed_by?: boolean };
          msg?: string;
        };
        if (json.status === "success" && json.data) {
          return rememberFollow({
            ok: true,
            following: Boolean(json.data.following),
            source: "twitterapi.io",
          });
        }
      }
    } catch {
      /* fall through */
    }

    // 2) followings page scan (first page usually enough for recent follows)
    try {
      const url = `${TWITTERAPI_IO_BASE}/twitter/user/followings?userName=${encodeURIComponent(user)}`;
      const res = await fetchTimeout(
        url,
        { headers: { "X-API-Key": ioKey } },
        12_000
      );
      if (res.ok) {
        const json = (await res.json()) as {
          followings?: { id?: string; userName?: string; screen_name?: string }[];
        };
        const list = json.followings || [];
        const following = list.some((u) => {
          const h = normalizeXHandle(u.userName || u.screen_name || "");
          return h === TOKENSHIT_USER || String(u.id || "") === TOKENSHIT_ID;
        });
        if (following) {
          return rememberFollow({
            ok: true,
            following: true,
            source: "twitterapi.io-followings",
          });
        }
        // If we got a list and Tokenshit_ not in first page, still could be further —
        // but check_follow_relationship is authoritative when it works.
        if (list.length > 0) {
          return rememberFollow({
            ok: true,
            following: false,
            source: "twitterapi.io-followings",
          });
        }
      }
    } catch {
      /* fall through */
    }
  }

  // Resolve source id for legacy providers
  const profile = await fetchXUserPublic(user);
  if (!profile.ok || !profile.id) {
    return rememberFollow({
      ok: false,
      following: false,
      error: profile.error || "user not found",
    });
  }

  // TweetAPI friendship (legacy)
  const key = tweetApiKey();
  if (key) {
    try {
      const url = `${TWEETAPI_BASE}/user/friendship?subjectId=${encodeURIComponent(
        profile.id
      )}&targetId=${encodeURIComponent(TOKENSHIT_ID)}`;
      const res = await fetch(url, {
        headers: { "X-API-Key": key },
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        const d = json.data || json;
        return rememberFollow({
          ok: true,
          following: Boolean(d.following),
          source: "tweetapi",
        });
      }
    } catch {
      /* fall through */
    }
  }

  // Official following pages are expensive (up to 3k follows) — skip if cooldown
  const bearer = xBearer();
  if (bearer && Date.now() >= officialXCooldownUntil) {
    let next: string | null = null;
    for (let page = 0; page < 1; page++) {
      // single page max — was 3 pages and burned credits
      const url = new URL(
        `https://api.x.com/2/users/${profile.id}/following`
      );
      url.searchParams.set("max_results", "1000");
      url.searchParams.set("user.fields", "username");
      if (next) url.searchParams.set("pagination_token", next);
      const fRes = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${bearer}` },
        cache: "no-store",
      });
      if (!fRes.ok) {
        if (fRes.status === 402 || fRes.status === 429 || fRes.status === 401) {
          officialXCooldownUntil = Date.now() + OFFICIAL_COOLDOWN_MS;
        }
        break;
      }
      const fJson = await fRes.json();
      const list = (fJson.data || []) as { id: string; username?: string }[];
      const following = list.some(
        (u) =>
          u.id === TOKENSHIT_ID ||
          (u.username || "").toLowerCase() === TOKENSHIT_USER
      );
      if (following)
        return rememberFollow({ ok: true, following: true, source: "x-official" });
      break;
    }
  }

  return rememberFollow({
    ok: false,
    following: false,
    error:
      "Could not verify follow. Try again in a few seconds, or ensure you follow @Tokenshit_.",
  });
}

function normalizeXHandle(raw: string | undefined | null): string {
  if (!raw) return "";
  return String(raw)
    .replace(/^@/, "")
    .trim()
    .toLowerCase()
    // Display names like "Seeker Tracker" → seeker_tracker
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

/** Prefer @handle fields over display name (vx/TweetAPI often put name first). */
function pickAuthorHandle(obj: Record<string, unknown>): string {
  const nested = (obj.author || obj.user || {}) as Record<string, unknown>;
  const candidates = [
    obj.user_screen_name,
    obj.screen_name,
    obj.username,
    obj.userName,
    obj.userScreenName,
    nested.username,
    nested.userName,
    nested.screen_name,
    nested.user_screen_name,
    // last: display name (spaces → _)
    obj.user_name,
    obj.name,
    nested.name,
    nested.user_name,
  ];
  for (const c of candidates) {
    const n = normalizeXHandle(c == null ? "" : String(c));
    if (n) return n;
  }
  return "";
}

async function tweetFromTwitterApiIo(tweetId: string): Promise<{
  ok: boolean;
  text?: string;
  authorUsername?: string;
  authorId?: string;
  createdAt?: string;
  error?: string;
}> {
  const key = twitterApiIoKey();
  if (!key) return { ok: false, error: "no twitterapi.io key" };
  try {
    const res = await fetchTimeout(
      `${TWITTERAPI_IO_BASE}/twitter/tweets?tweet_ids=${encodeURIComponent(tweetId)}`,
      { headers: { "X-API-Key": key } },
      10_000
    );
    if (!res.ok) {
      const t = await res.text();
      return {
        ok: false,
        error: `twitterapi.io ${res.status}: ${t.slice(0, 100)}`,
      };
    }
    const json = (await res.json()) as {
      tweets?: Record<string, unknown>[];
      status?: string;
      msg?: string;
    };
    const tw = (json.tweets || [])[0];
    if (!tw) {
      return {
        ok: false,
        error: tweetIdLooksTruncated(tweetId)
          ? "Tweet not found — ID looks truncated. Paste the full status URL from X (Share → Copy link)."
          : "Tweet not found on twitterapi.io",
      };
    }
    const author = (tw.author || tw.user || {}) as Record<string, unknown>;
    const handle =
      pickAuthorHandle(tw) ||
      pickAuthorHandle(author) ||
      normalizeXHandle(
        String(author.userName || author.username || "")
      );
    return {
      ok: true,
      text: String(tw.text || tw.fullText || ""),
      authorUsername: handle || undefined,
      authorId: author.id ? String(author.id) : undefined,
      createdAt: String(tw.createdAt || tw.created_at || "") || undefined,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "twitterapi.io failed",
    };
  }
}

async function tweetFromTweetApi(tweetId: string): Promise<{
  ok: boolean;
  text?: string;
  authorUsername?: string;
  authorId?: string;
  createdAt?: string;
  error?: string;
}> {
  const key = tweetApiKey();
  if (!key) return { ok: false, error: "no tweetapi key" };
  const res = await fetch(
    `${TWEETAPI_BASE}/tweet/details?tweetId=${encodeURIComponent(tweetId)}`,
    {
      headers: { "X-API-Key": key },
      cache: "no-store",
    }
  );
  if (!res.ok) {
    const t = await res.text();
    return { ok: false, error: `TweetAPI ${res.status}: ${t.slice(0, 120)}` };
  }
  const json = await res.json();
  const tw = (json.data?.tweet || json.data || json.tweet || json) as Record<
    string,
    unknown
  >;
  const author = (tw.author || {}) as Record<string, unknown>;
  const createdAt = String(
    tw.createdAt || tw.created_at || tw.date || tw.timestamp || ""
  );
  const handle =
    pickAuthorHandle(tw) ||
    pickAuthorHandle(author) ||
    normalizeXHandle(
      author.username != null ? String(author.username) : ""
    );
  return {
    ok: true,
    text: String(tw.text || tw.fullText || ""),
    authorUsername: handle || undefined,
    authorId: author.id ? String(author.id) : undefined,
    createdAt: createdAt || undefined,
  };
}

async function tweetFromVx(
  tweetId: string,
  hintUser?: string
): Promise<{
  ok: boolean;
  text?: string;
  authorUsername?: string;
  createdAt?: string;
  error?: string;
}> {
  const paths = [
    hintUser
      ? `https://api.vxtwitter.com/${encodeURIComponent(hintUser)}/status/${tweetId}`
      : null,
    `https://api.vxtwitter.com/i/status/${tweetId}`,
  ].filter(Boolean) as string[];
  for (const url of paths) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "TokenShit/1.0" },
        cache: "no-store",
      });
      if (!res.ok) continue;
      const d = (await res.json()) as Record<string, unknown>;
      const text = String(d.text || d.full_text || "");
      // NEVER prefer user_name (display) over user_screen_name
      const authorUsername = pickAuthorHandle(d);
      const createdAt = String(
        d.date || d.created_at || d.createdAt || d.time || ""
      );
      if (text || authorUsername) {
        return {
          ok: true,
          text,
          authorUsername: authorUsername || undefined,
          createdAt: createdAt || undefined,
        };
      }
    } catch {
      /* try next */
    }
  }
  return { ok: false, error: "public tweet lookup failed" };
}

async function tweetFromOfficial(tweetId: string): Promise<{
  ok: boolean;
  text?: string;
  authorUsername?: string;
  authorId?: string;
  createdAt?: string;
  error?: string;
}> {
  const bearer = xBearer();
  if (!bearer) return { ok: false, error: "no bearer" };
  const url = new URL(`https://api.x.com/2/tweets/${tweetId}`);
  url.searchParams.set("tweet.fields", "author_id,text,entities,created_at");
  url.searchParams.set("expansions", "author_id");
  url.searchParams.set("user.fields", "username");
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${bearer}` },
  });
  if (!res.ok) {
    const t = await res.text();
    return { ok: false, error: formatXApiError(res.status, t) };
  }
  const json = await res.json();
  const text = String(json.data?.text || "");
  const authorId = json.data?.author_id as string | undefined;
  const createdAt = json.data?.created_at
    ? String(json.data.created_at)
    : undefined;
  const users = (json.includes?.users || []) as {
    id: string;
    username?: string;
  }[];
  const author = users.find((u) => u.id === authorId);
  return {
    ok: true,
    text,
    authorUsername: normalizeXHandle(author?.username) || undefined,
    authorId,
    createdAt,
  };
}

function tagsOk(text: string): boolean {
  return (
    /@tokenshit_/i.test(text) ||
    /tokenshit\.com/i.test(text) ||
    /\$?TOKENSHIT/i.test(text)
  );
}

export async function checkXTweetByUrl(
  username: string,
  tweetUrlOrId: string
): Promise<{
  ok: boolean;
  found: boolean;
  tweetId?: string;
  text?: string;
  createdAt?: string;
  error?: string;
}> {
  const user = normalizeXHandle(username);
  const tweetId = parseTweetId(tweetUrlOrId);
  if (!user) return { ok: false, found: false, error: "no username" };
  if (!tweetId) {
    return {
      ok: false,
      found: false,
      error: "Paste a full X/Twitter status link (or tweet id).",
    };
  }
  if (tweetIdLooksTruncated(tweetId)) {
    return {
      ok: false,
      found: false,
      error:
        "Tweet id looks cut off. On X: Share → Copy link, then paste the full URL (status id is usually 19 digits).",
    };
  }

  // Prefer twitterapi.io (stable credits) → official → TweetAPI.com → vx
  let got =
    (await tweetFromTwitterApiIo(tweetId).catch(() => null)) || null;
  if (!got?.ok) {
    got = (await tweetFromOfficial(tweetId).catch(() => null)) || got;
  }
  if (!got?.ok) {
    got = await tweetFromTweetApi(tweetId);
  }
  if (!got.ok) {
    got = await tweetFromVx(tweetId, user);
  }
  if (!got.ok) {
    return {
      ok: false,
      found: false,
      error: got.error || "Could not load tweet",
    };
  }

  const authorUser = normalizeXHandle(got.authorUsername);
  if (authorUser && authorUser !== user) {
    return {
      ok: false,
      found: false,
      error: `That tweet is from @${authorUser}, not @${user}.`,
    };
  }
  const text = got.text || "";
  if (!tagsOk(text)) {
    return {
      ok: false,
      found: false,
      error: "Tweet must tag @Tokenshit_ (or link tokenshit.com).",
    };
  }

  // Tweet must be less than 24 hours old
  const createdRaw = got.createdAt;
  let createdMs: number | null = null;
  if (createdRaw) {
    createdMs = Date.parse(createdRaw);
    if (!Number.isFinite(createdMs)) {
      const n = Number(createdRaw);
      if (Number.isFinite(n)) {
        createdMs = n < 1e12 ? n * 1000 : n;
      } else {
        createdMs = null;
      }
    }
  }
  // Fallback: Twitter snowflake timestamp from tweet id
  if (createdMs == null && /^\d{5,}$/.test(tweetId)) {
    try {
      // snowflake: (id / 2^22) + twitter epoch
      const idNum = Number(tweetId);
      if (Number.isFinite(idNum)) {
        createdMs = Math.floor(idNum / 2 ** 22) + 1288834974657;
      }
    } catch {
      createdMs = null;
    }
  }
  if (createdMs != null && Number.isFinite(createdMs)) {
    const age = Date.now() - createdMs;
    if (age > 24 * 60 * 60 * 1000) {
      return {
        ok: false,
        found: false,
        tweetId,
        error:
          "Tweet is older than 24 hours. Post a fresh tag and claim again.",
      };
    }
  } else {
    return {
      ok: false,
      found: false,
      tweetId,
      error: "Could not verify tweet age. Paste a fresh status link.",
    };
  }

  return {
    ok: true,
    found: true,
    tweetId,
    text: text.slice(0, 280),
    createdAt: createdRaw || new Date(createdMs).toISOString(),
  };
}

export async function checkXTweetTag(
  username: string,
  tweetUrl?: string | null
): Promise<{
  ok: boolean;
  found: boolean;
  tweetId?: string;
  text?: string;
  error?: string;
}> {
  const user = username.replace(/^@/, "").trim();
  if (!user) return { ok: false, found: false, error: "no username" };

  if (tweetUrl && String(tweetUrl).trim()) {
    return checkXTweetByUrl(user, String(tweetUrl));
  }

  // Prefer user timeline via TweetAPI (no official recent-search credits)
  const profile = await fetchXUserPublic(user);
  const key = tweetApiKey();
  if (key && profile.id) {
    try {
      const res = await fetch(
        `${TWEETAPI_BASE}/user/tweets?userId=${encodeURIComponent(profile.id)}`,
        { headers: { "X-API-Key": key }, cache: "no-store" }
      );
      if (res.ok) {
        const json = await res.json();
        const tweets = (json.data?.tweets ||
          json.data ||
          json.tweets ||
          []) as Array<{ id?: string; text?: string; fullText?: string }>;
        const list = Array.isArray(tweets) ? tweets : [];
        for (const t of list) {
          const text = String(t.text || t.fullText || "");
          if (tagsOk(text)) {
            return {
              ok: true,
              found: true,
              tweetId: t.id ? String(t.id) : undefined,
              text: text.slice(0, 280),
            };
          }
        }
        return {
          ok: true,
          found: false,
          error:
            "No recent tweet tagging @Tokenshit_ found. Paste your tweet URL.",
        };
      }
    } catch {
      /* fall through */
    }
  }

  // Official recent search last
  const bearer = xBearer();
  if (bearer) {
    const query = `from:${user} (@Tokenshit_ OR @tokenshit_ OR tokenshit.com OR TOKENSHIT) -is:retweet -is:reply`;
    const url = new URL("https://api.x.com/2/tweets/search/recent");
    url.searchParams.set("query", query);
    url.searchParams.set("max_results", "10");
    url.searchParams.set("tweet.fields", "author_id,created_at,text,entities");
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${bearer}` },
    });
    if (res.ok) {
      const json = await res.json();
      const tweets = (json.data || []) as { id: string; text: string }[];
      if (!tweets.length) return { ok: true, found: false };
      const tagged =
        tweets.find((t) => /@tokenshit_/i.test(t.text || "")) || tweets[0];
      return {
        ok: true,
        found: true,
        tweetId: tagged.id,
        text: (tagged.text || "").slice(0, 280),
      };
    }
    const t = await res.text();
    return {
      ok: false,
      found: false,
      error:
        formatXApiError(res.status, t) +
        " Paste your tweet URL to verify without search.",
    };
  }

  return {
    ok: false,
    found: false,
    error: "Paste your tweet URL (X search unavailable).",
  };
}
