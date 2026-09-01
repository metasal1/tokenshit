/**
 * X/Twitter public data for claims.
 * Cost order: memory → Turso → free fxtwitter → ApiTwitter (primary paid) →
 * twitterapi.io → TweetAPI → official X (last).
 * Never dump raw API JSON to UI.
 */
import { tursoExecute } from "@/lib/turso";

const TWEETAPI_BASE = "https://api.tweetapi.com/tw-v2";
/** twitterapi.io — backup paid source */
const TWITTERAPI_IO_BASE = "https://api.twitterapi.io";
/** ApiTwitter (apitwitter.com) — primary paid source */
const APITWITTER_BASE = (
  process.env.APITWITTER_BASE || "https://api.apitwitter.com"
).replace(/\/$/, "");
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

function apiTwitterKey(): string {
  return (
    process.env.APITWITTER_API_KEY ||
    process.env.APITWITTER_KEY ||
    process.env.API_TWITTER_KEY ||
    ""
  ).trim();
}

/** Optional cookie for ApiTwitter POST (auth_token=…; ct0=…) */
function apiTwitterCookie(): string {
  const raw = (
    process.env.APITWITTER_COOKIE ||
    process.env.APITWITTER_COOKIES ||
    ""
  ).trim();
  if (raw) return raw;
  const auth = (
    process.env.APITWITTER_AUTH_TOKEN ||
    process.env.X_AUTH_TOKEN_APITWITTER ||
    ""
  ).trim();
  const ct0 = (
    process.env.APITWITTER_CT0 ||
    process.env.X_CT0_APITWITTER ||
    ""
  ).trim();
  if (auth && ct0) return `auth_token=${auth}; ct0=${ct0}`;
  if (auth) return `auth_token=${auth}`;
  return "";
}

function apiTwitterProxy(): string {
  return (
    process.env.APITWITTER_PROXY ||
    process.env.APITWITTER_PROXY_URL ||
    ""
  ).trim();
}

function apiTwitterHeaders(): Record<string, string> {
  const key = apiTwitterKey();
  const h: Record<string, string> = {
    "X-API-Key": key,
    Accept: "application/json",
  };
  const ct0 = (
    process.env.APITWITTER_CT0 ||
    process.env.X_CT0_APITWITTER ||
    ""
  ).trim();
  if (ct0) h["x-csrf-token"] = ct0;
  return h;
}

/** GET first (server pool). If empty and cookie+proxy set, POST with session. */
async function apiTwitterGetJson(
  pathAndQuery: string,
  ms = 12_000
): Promise<{ ok: boolean; status: number; json: any; error?: string }> {
  const key = apiTwitterKey();
  if (!key) return { ok: false, status: 0, json: null, error: "no apitwitter key" };
  const url = pathAndQuery.startsWith("http")
    ? pathAndQuery
    : `${APITWITTER_BASE}${pathAndQuery.startsWith("/") ? "" : "/"}${pathAndQuery}`;
  try {
    const res = await fetchTimeout(url, { headers: apiTwitterHeaders() }, ms);
    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = { raw: text.slice(0, 200) };
    }
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        json,
        error: `apitwitter ${res.status}: ${text.slice(0, 120)}`,
      };
    }
    return { ok: true, status: res.status, json };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      json: null,
      error: e instanceof Error ? e.message : "apitwitter fetch failed",
    };
  }
}

async function apiTwitterPostJson(
  path: string,
  body: Record<string, unknown>,
  ms = 25_000
): Promise<{ ok: boolean; status: number; json: any; error?: string }> {
  const key = apiTwitterKey();
  if (!key) return { ok: false, status: 0, json: null, error: "no apitwitter key" };
  const cookie = apiTwitterCookie();
  const proxy = apiTwitterProxy();
  if (!cookie || !proxy) {
    return {
      ok: false,
      status: 0,
      json: null,
      error: "apitwitter POST needs cookie + proxy",
    };
  }
  const url = `${APITWITTER_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  const payload = { ...body, cookie, proxy };
  try {
    const res = await fetchTimeout(
      url,
      {
        method: "POST",
        headers: {
          ...apiTwitterHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
      ms
    );
    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = { raw: text.slice(0, 200) };
    }
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        json,
        error: `apitwitter POST ${res.status}: ${text.slice(0, 120)}`,
      };
    }
    return { ok: true, status: res.status, json };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      json: null,
      error: e instanceof Error ? e.message : "apitwitter post failed",
    };
  }
}

function apiTwitterDataUseful(data: any): boolean {
  if (!data || typeof data !== "object") return false;
  if (Array.isArray(data)) return data.length > 0;
  const id = data.id ?? data.user_id ?? data.userId;
  const un =
    data.userName || data.username || data.screen_name || data.screenName;
  const fol = data.followers ?? data.followers_count ?? data.followersCount;
  if (id && String(id).length > 0) return true;
  if (un && String(un).length > 0) return true;
  if (fol != null && Number(fol) > 0) return true;
  if (data.following === true || data.following === false) return true;
  if (data.isFollowing === true || data.isFollowing === false) return true;
  if (data.source_follows_target != null) return true;
  if (Array.isArray(data.following) && data.following.length) return true;
  if (Array.isArray(data.followers) && data.followers.length) return true;
  if (Array.isArray(data.followings) && data.followings.length) return true;
  if (Array.isArray(data.users) && data.users.length) return true;
  if (Array.isArray(data.retweeters) && data.retweeters.length) return true;
  return false;
}

async function apiTwitterResolve(
  getPath: string,
  postPath: string,
  postBody: Record<string, unknown>
): Promise<{ ok: boolean; data: any; source: string; error?: string }> {
  const g = await apiTwitterGetJson(getPath);
  if (g.ok) {
    const data = g.json?.data ?? g.json;
    if (apiTwitterDataUseful(data) && g.json?.status !== "error") {
      return { ok: true, data, source: "apitwitter" };
    }
  }
  const p = await apiTwitterPostJson(postPath, postBody);
  if (p.ok) {
    const data = p.json?.data ?? p.json;
    if (apiTwitterDataUseful(data) && p.json?.status !== "error") {
      return { ok: true, data, source: "apitwitter-session" };
    }
  }
  return {
    ok: false,
    data: null,
    source: "apitwitter",
    error: p.error || g.error || "apitwitter empty",
  };
}

async function fromApiTwitterUser(username: string): Promise<any> {
  const key = apiTwitterKey();
  if (!key) return null;
  const clean = username.replace(/^@/, "").trim();
  try {
    const r = await apiTwitterResolve(
      `/twitter/user/${encodeURIComponent(clean)}`,
      `/twitter/user/${encodeURIComponent(clean)}`,
      { userName: clean }
    );
    if (!r.ok || !r.data) {
      return {
        ok: false,
        followers: 0,
        following: 0,
        tweets: 0,
        verified: false,
        verifiedType: "none",
        error: r.error || "user not found",
        source: "apitwitter",
      };
    }
    const d = r.data as Record<string, unknown>;
    const rawVt = String(d.verifiedType || d.verified_type || "").toLowerCase();
    const isBlueVerified = Boolean(
      d.is_blue_verified || d.isBlueVerified || d.isBlue
    );
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
    const unRaw = String(
      d.userName || d.username || d.screen_name || d.screenName || ""
    ).trim();
    const un = unRaw || clean;
    const id = d.id != null && String(d.id) ? String(d.id) : undefined;
    const followers = Number(
      d.followers ?? d.followersCount ?? d.followers_count ?? 0
    );
    // Empty shell responses from ApiTwitter pool (200 + blank fields)
    if (!id && !unRaw && followers <= 0) {
      return {
        ok: false,
        followers: 0,
        following: 0,
        tweets: 0,
        verified: false,
        verifiedType: "none",
        error: "apitwitter empty profile",
        source: "apitwitter",
      };
    }
    return {
      ok: true,
      username: un,
      id,
      name: d.name ? String(d.name) : undefined,
      followers,
      following: Number(
        d.following ?? d.followingCount ?? d.friends_count ?? 0
      ),
      tweets: Number(
        d.statuses_count ?? d.statusesCount ?? d.tweets ?? d.statuses ?? 0
      ),
      verified,
      premium: isBlueVerified || verifiedType === "blue",
      isBlueVerified,
      verifiedType,
      profileImageUrl: d.profile_image_url
        ? String(d.profile_image_url).replace("_normal", "_bigger")
        : d.profilePicture
          ? String(d.profilePicture).replace("_normal", "_bigger")
          : d.profile_image_url_https
            ? String(d.profile_image_url_https).replace("_normal", "_bigger")
            : undefined,
      source: r.source,
    };
  } catch (e) {
    return {
      ok: false,
      followers: 0,
      following: 0,
      tweets: 0,
      verified: false,
      verifiedType: "none",
      error: e instanceof Error ? e.message : "apitwitter user failed",
      source: "apitwitter",
    };
  }
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
    lower.includes("payment required") ||
    lower.includes("credits is not enough")
  ) {
    return "X data credits depleted. Top up ApiTwitter / twitterapi.io — or paste a tweet URL for tweet claims.";
  }
  if (status === 429 || lower.includes("rate limit")) {
    return "X rate limit — wait a minute and try again.";
  }
  if (status === 401 || status === 403) {
    return "X API auth failed — check ApiTwitter / TweetAPI key.";
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
    // fxtwitter puts badge under verification: { verified, type: individual|business|... }
    const ver =
      u.verification && typeof u.verification === "object"
        ? (u.verification as {
            verified?: boolean;
            type?: string;
          })
        : {};
    const vType = String(ver.type || "").toLowerCase();
    const isBlue = Boolean(
      u.is_blue_verified ||
        u.isBlueVerified ||
        ver.verified ||
        ["individual", "blue", "business", "organization", "government"].includes(
          vType
        )
    );
    return {
      ok: true,
      username: String(u.screen_name || clean),
      id: u.id ? String(u.id) : undefined,
      name: u.name ? String(u.name) : undefined,
      followers: Number(u.followers || 0),
      following: Number(u.following || 0),
      tweets: Number(u.tweets || 0),
      verified: isBlue || Boolean(u.verified),
      premium: isBlue,
      isBlueVerified: isBlue,
      verifiedType: isBlue
        ? vType === "business" || vType === "organization"
          ? "business"
          : vType === "government"
            ? "government"
            : "blue"
        : "none",
      profileImageUrl: u.avatar_url
        ? String(u.avatar_url).replace("_normal", "_bigger")
        : undefined,
      source: "fxtwitter",
    };
  } catch {
    return null;
  }
}

/** Merge free + paid profile hits — paid wins on badge flags. */
function mergeXProfiles(
  a: XUserPublic | null,
  b: XUserPublic | null
): XUserPublic | null {
  if (!a) return b;
  if (!b) return a;
  const premium = Boolean(a.premium || b.premium);
  const verified = Boolean(a.verified || b.verified || premium);
  const verifiedType =
    a.verifiedType && a.verifiedType !== "none"
      ? a.verifiedType
      : b.verifiedType && b.verifiedType !== "none"
        ? b.verifiedType
        : premium
          ? "blue"
          : "none";
  return {
    ok: a.ok || b.ok,
    username: a.username || b.username,
    id: a.id || b.id,
    name: a.name || b.name,
    followers: Math.max(Number(a.followers || 0), Number(b.followers || 0)),
    following: Math.max(Number(a.following || 0), Number(b.following || 0)),
    tweets: Math.max(Number(a.tweets || 0), Number(b.tweets || 0)),
    verified,
    premium,
    verifiedType,
    profileImageUrl: a.profileImageUrl || b.profileImageUrl,
    hasPfp: Boolean(a.hasPfp || b.hasPfp),
    error: a.ok ? a.error : b.error || a.error,
    source: [a.source, b.source].filter(Boolean).join("+") || undefined,
  };
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
    // ok + 0 followers is often a free-API miss, not a real micro account — short TTL
    // also short TTL when high followers but no badge (stale free cache missing blue)
    const zeroFollowers = val.ok && Number(val.followers || 0) <= 0;
    const badgeMiss =
      val.ok &&
      Number(val.followers || 0) >= 100 &&
      !val.premium &&
      !val.verified;
    const ttl =
      !val.ok || zeroFollowers || badgeMiss
        ? TURSO_FAIL_TTL_MS
        : TURSO_OK_TTL_MS;
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
  // Skip memory cache when badge missing (force re-enrich for claims)
  if (
    hit &&
    Date.now() - hit.at < PROFILE_CACHE_MS &&
    (hit.val.premium || hit.val.verified || Number(hit.val.followers || 0) < 100)
  ) {
    return hit.val;
  }

  const cached = await readTursoUser(key);
  if (
    cached &&
    (cached.premium ||
      cached.verified ||
      Number(cached.followers || 0) < 100)
  ) {
    profileCache.set(key, { at: Date.now(), val: cached });
    return cached;
  }

  // 1) Free first — followers/PFP; may miss blue unless verification{} present
  const fx = await fromFxTwitter(clean);
  let best: XUserPublic | null = fx?.ok ? withProfileFlags(fx) : null;

  // 2) ApiTwitter primary paid (is_blue_verified reliable when pool works)
  if (!best?.premium) {
    const at = await fromApiTwitterUser(clean);
    if (at?.ok) {
      best = mergeXProfiles(best, withProfileFlags(at));
    }
  }

  // 3) twitterapi.io backup
  if (!best?.premium) {
    const io = await fromTwitterApiIoUser(clean);
    if (io?.ok) {
      best = mergeXProfiles(best, withProfileFlags(io));
    }
  }

  // 4) TweetAPI if still no badge
  if (!best?.premium && !best?.verified) {
    const ta = await fromTweetApiUser(clean);
    if (ta?.ok) {
      best = mergeXProfiles(best, withProfileFlags(ta));
    }
  }

  // 5) Official X last
  if (!best?.premium && !best?.verified) {
    const official = await fromOfficialX(clean);
    if (official?.ok) {
      best = mergeXProfiles(best, withProfileFlags(official));
    }
  }

  if (best?.ok) {
    return remember(key, best);
  }

  // Prefer free zero-follower success over hard fail when user exists
  if (fx?.ok) {
    return remember(key, withProfileFlags(fx));
  }

  if (best) {
    return remember(key, best);
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
/** Positive follow hits stay longer; negatives / errors expire fast (just-followed UX). */
const FOLLOW_CACHE_POS_MS = 30 * 60 * 1000;
const FOLLOW_CACHE_NEG_MS = 15 * 1000;

function isTokenshitFollowTarget(u: {
  id?: string | number | null;
  userName?: string | null;
  screen_name?: string | null;
  username?: string | null;
}): boolean {
  if (String(u.id ?? "") === TOKENSHIT_ID) return true;
  const h = normalizeXHandle(u.userName || u.screen_name || u.username || "");
  return h === TOKENSHIT_USER;
}

function relationshipFollowingFlag(data: Record<string, unknown> | null | undefined): boolean | null {
  if (!data || typeof data !== "object") return null;
  // twitterapi.io: data.following = source follows target
  const keys = [
    "following",
    "isFollowing",
    "is_following",
    "source_follows_target",
    "followingTarget",
  ];
  for (const k of keys) {
    if (k in data) return Boolean(data[k]);
  }
  return null;
}

function listFromFollowJson(json: any): any[] {
  const blob = json?.data ?? json;
  if (Array.isArray(blob)) return blob;
  const list =
    blob?.followers ||
    blob?.following ||
    blob?.users ||
    blob?.data ||
    [];
  return Array.isArray(list) ? list : [];
}

function handleOf(u: any): string {
  return String(u?.userName || u?.username || u?.screen_name || "")
    .replace(/^@/, "")
    .toLowerCase();
}

function nextFollowCursor(json: any): string {
  const blob = json?.data ?? json;
  const c =
    blob?.next_cursor ||
    blob?.nextCursor ||
    json?.next_cursor ||
    json?.nextCursor ||
    "";
  return c && c !== "0" ? String(c) : "";
}

let followSeenReady = false;
async function ensureFollowSeen() {
  if (followSeenReady) return;
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS x_follow_seen (
       twitter TEXT PRIMARY KEY,
       source TEXT,
       seen_at TEXT NOT NULL
     )`
  );
  followSeenReady = true;
}

async function recallFollowSeen(user: string): Promise<boolean> {
  try {
    await ensureFollowSeen();
    const r = await tursoExecute(
      `SELECT 1 FROM x_follow_seen WHERE lower(twitter) = lower(?) LIMIT 1`,
      [user]
    );
    return r.rows.length > 0;
  } catch {
    return false;
  }
}

async function rememberFollowSeen(user: string, source: string) {
  try {
    await ensureFollowSeen();
    await tursoExecute(
      `INSERT INTO x_follow_seen (twitter, source, seen_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(twitter) DO UPDATE SET source = excluded.source, seen_at = excluded.seen_at`,
      [user.toLowerCase(), source]
    );
  } catch {
    /* ignore */
  }
}

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
  if (fc) {
    const ttl =
      fc.val.ok && fc.val.following ? FOLLOW_CACHE_POS_MS : FOLLOW_CACHE_NEG_MS;
    if (Date.now() - fc.at < ttl) {
      return { ...fc.val, source: (fc.val.source || "cache") + "+mem" };
    }
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

  if (await recallFollowSeen(user)) {
    return rememberFollow({
      ok: true,
      following: true,
      source: "turso-follow-seen",
    });
  }

  if (!apiTwitterKey()) {
    return rememberFollow({
      ok: false,
      following: false,
      error:
        "Could not verify follow. Follow @Tokenshit_, wait a few seconds, then claim.",
    });
  }

  const me = user.toLowerCase();
  const hitMe = (list: any[]) =>
    list.some((u) => handleOf(u) === me || String(u?.id || "") === me);
  const hitTokenshit = (list: any[]) =>
    list.some(
      (u) =>
        isTokenshitFollowTarget(u) ||
        handleOf(u) === TOKENSHIT_USER ||
        String(u?.id || "") === TOKENSHIT_ID
    );

  try {
    const [fol, ing] = await Promise.all([
      apiTwitterGetJson(`/twitter/user/Tokenshit_/followers?count=50`, 8_000),
      apiTwitterGetJson(
        `/twitter/user/${encodeURIComponent(user)}/following?count=50`,
        8_000
      ),
    ]);
    if (fol.ok && hitMe(listFromFollowJson(fol.json))) {
      await rememberFollowSeen(user, "apitwitter-followers");
      return rememberFollow({
        ok: true,
        following: true,
        source: "apitwitter-followers",
      });
    }
    if (ing.ok && hitTokenshit(listFromFollowJson(ing.json))) {
      await rememberFollowSeen(user, "apitwitter-following");
      return rememberFollow({
        ok: true,
        following: true,
        source: "apitwitter-following",
      });
    }
    const cur = ing.ok ? nextFollowCursor(ing.json) : "";
    if (cur) {
      const ing2 = await apiTwitterGetJson(
        `/twitter/user/${encodeURIComponent(user)}/following?count=50&cursor=${encodeURIComponent(cur)}`,
        6_000
      );
      if (ing2.ok && hitTokenshit(listFromFollowJson(ing2.json))) {
        await rememberFollowSeen(user, "apitwitter-following-p2");
        return rememberFollow({
          ok: true,
          following: true,
          source: "apitwitter-following-p2",
        });
      }
    }
  } catch {
    /* fail closed */
  }

  return rememberFollow({
    ok: false,
    following: false,
    error:
      "Follow @Tokenshit_ on X, wait a few seconds, then claim. If you followed earlier, unfollow + follow again.",
    source: "apitwitter-follow-miss",
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

/** 24h tweet claim: must tag @Tokenshit_ (or tokenshit.com) AND include mint CA */
function tagsOk(text: string): boolean {
  const t = text || "";
  const hasTag =
    /@tokenshit_/i.test(t) ||
    /tokenshit\.com/i.test(t) ||
    /\$?TOKENSHIT/i.test(t);
  // prefer solana:<mint>; bare mint still OK
  const hasCa =
    /solana:fEbiuDdZZ1QaWYpJFPqk23ZkaRnAyHg4aivhrCTshit/i.test(t) ||
    /fEbiuDdZZ1QaWYpJFPqk23ZkaRnAyHg4aivhrCTshit/i.test(t);
  return hasTag && hasCa;
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
      error: "Tweet must tag @Tokenshit_ and include solana:fEbiu…CTshit (mint CA).",
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
            "No recent tweet with @Tokenshit_ + mint CA found. Paste your tweet URL.",
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


/**
 * Verify user retweeted (or quote-RTed) a specific Tokenshit_ status.
 * 1) retweeters APIs (when credits allow)
 * 2) optional quote/status URL paste — free fxtwitter/vx must show quote of target by user
 */
export async function checkXRetweeted(
  username: string,
  targetTweetId: string,
  quoteOrRtUrl?: string | null
): Promise<{
  ok: boolean;
  retweeted: boolean;
  error?: string;
  source?: string;
  evidenceTweetId?: string;
}> {
  const user = normalizeXHandle(username);
  const target = String(targetTweetId || "").replace(/\D/g, "");
  if (!user) return { ok: false, retweeted: false, error: "no username" };
  if (!target) return { ok: false, retweeted: false, error: "no target tweet" };

  // --- A) pasted quote / RT status (works when retweeter APIs are dry) ---
  const paste = (quoteOrRtUrl || "").trim();
  if (paste) {
    const id = parseTweetId(paste);
    if (!id) {
      return {
        ok: false,
        retweeted: false,
        error: "Paste your quote-tweet status URL (Share → Copy link).",
      };
    }
    if (id === target) {
      return {
        ok: false,
        retweeted: false,
        error: "Paste YOUR quote/retweet link, not the original Tokenshit_ post.",
      };
    }
    const q = await loadTweetForRetweetProof(id, user);
    if (!q.ok) {
      return {
        ok: false,
        retweeted: false,
        error: q.error || "Could not load your tweet",
      };
    }
    const author = normalizeXHandle(q.authorUsername || "");
    if (author && author !== user) {
      return {
        ok: false,
        retweeted: false,
        error: `That post is from @${author}, not @${user}.`,
      };
    }
    const refs = q.refIds || [];
    const text = (q.text || "").toLowerCase();
    const hitsTarget =
      refs.includes(target) ||
      text.includes(target) ||
      text.includes(`status/${target}`) ||
      text.includes(`tokenshit_/status/${target}`);
    if (!hitsTarget) {
      return {
        ok: false,
        retweeted: false,
        error: `Quote or RT the promo post first (status ${target}).`,
      };
    }
    return {
      ok: true,
      retweeted: true,
      source: q.source || "quote-url",
      evidenceTweetId: id,
    };
  }

  // --- B) retweeters list (paid APIs) ---
  const onList = await userInRetweeters(user, target);
  if (onList.ok && onList.found) {
    return {
      ok: true,
      retweeted: true,
      source: onList.source,
    };
  }
  if (onList.ok === false && onList.hardError) {
    return {
      ok: false,
      retweeted: false,
      error:
        onList.error ||
        "Could not verify RT (X API). Quote the post and paste your status URL.",
      source: onList.source,
    };
  }

  return {
    ok: true,
    retweeted: false,
    error:
      "RT not found yet. Retweet the post, wait a few seconds, and try again — or Quote it and paste your status URL.",
    source: onList.source,
  };
}

async function loadTweetForRetweetProof(
  tweetId: string,
  hintUser?: string
): Promise<{
  ok: boolean;
  text?: string;
  authorUsername?: string;
  refIds?: string[];
  source?: string;
  error?: string;
}> {
  // fxtwitter free
  try {
    const res = await fetchTimeout(
      `https://api.fxtwitter.com/status/${tweetId}`,
      { headers: { "User-Agent": "TokenShit/1.0" }, cache: "no-store" },
      12_000
    );
    if (res.ok) {
      const j = (await res.json()) as {
        tweet?: Record<string, unknown>;
        code?: number;
      };
      const tw = (j.tweet || j) as Record<string, unknown>;
      const author = (tw.author || {}) as Record<string, unknown>;
      const handle =
        normalizeXHandle(
          String(author.screen_name || author.username || tw.author_screen_name || "")
        ) || pickAuthorHandle(tw);
      const text = String(tw.text || tw.raw_text || "");
      const refIds: string[] = [];
      const q = tw.quote as Record<string, unknown> | undefined;
      const rt = (tw.retweet || tw.reweet) as Record<string, unknown> | undefined;
      const rep = tw.replying_to_status as string | undefined;
      for (const block of [q, rt]) {
        if (!block) continue;
        const id = String(block.id || block.id_str || "").replace(/\D/g, "");
        if (id) refIds.push(id);
      }
      if (rep) refIds.push(String(rep).replace(/\D/g, ""));
      // nested url entities
      const raw = JSON.stringify(tw);
      for (const m of raw.matchAll(/status\/(\d{10,})/g)) {
        refIds.push(m[1]!);
      }
      return {
        ok: true,
        text,
        authorUsername: handle || hintUser,
        refIds: [...new Set(refIds.filter(Boolean))],
        source: "fxtwitter",
      };
    }
  } catch {
    /* fall through */
  }

  const vx = await tweetFromVx(tweetId, hintUser);
  if (vx.ok) {
    const refIds: string[] = [];
    const raw = `${vx.text || ""}`;
    for (const m of raw.matchAll(/status\/(\d{10,})/g)) refIds.push(m[1]!);
    return {
      ok: true,
      text: vx.text,
      authorUsername: vx.authorUsername,
      refIds,
      source: "vx",
    };
  }

  const io = await tweetFromTwitterApiIo(tweetId).catch(() => null);
  if (io?.ok) {
    return {
      ok: true,
      text: io.text,
      authorUsername: io.authorUsername,
      refIds: [],
      source: "twitterapi.io",
    };
  }

  return { ok: false, error: vx.error || io?.error || "tweet load failed" };
}

async function userInRetweeters(
  username: string,
  tweetId: string
): Promise<{
  ok: boolean;
  found: boolean;
  hardError?: boolean;
  error?: string;
  source?: string;
}> {
  const user = username.toLowerCase();
  const bearer = process.env.X_BEARER_TOKEN || process.env.TWITTER_BEARER_TOKEN || "";
  if (bearer) {
    try {
      let url: string | null =
        `https://api.twitter.com/2/tweets/${tweetId}/retweeted_by?max_results=100&user.fields=username`;
      let pages = 0;
      while (url && pages < 5) {
        pages++;
        const res = await fetchTimeout(
          url,
          { headers: { Authorization: `Bearer ${bearer}` } },
          12_000
        );
        if (res.status === 402 || res.status === 429) {
          break;
        }
        if (!res.ok) break;
        const j = (await res.json()) as {
          data?: { username?: string }[];
          meta?: { next_token?: string };
        };
        if ((j.data || []).some((u) => (u.username || "").toLowerCase() === user)) {
          return { ok: true, found: true, source: "x-api-retweeted_by" };
        }
        const nt = j.meta?.next_token;
        url = nt
          ? `https://api.twitter.com/2/tweets/${tweetId}/retweeted_by?max_results=100&user.fields=username&pagination_token=${encodeURIComponent(nt)}`
          : null;
      }
    } catch {
      /* fall through */
    }
  }

  // ApiTwitter retweeters (primary paid)
  if (apiTwitterKey()) {
    try {
      const r = await apiTwitterResolve(
        `/twitter/tweet/retweeters?tweetId=${encodeURIComponent(tweetId)}`,
        "/twitter/tweet/retweeters",
        { tweetId, tweet_id: tweetId }
      );
      if (r.ok && r.data) {
        const blob = JSON.stringify(r.data).toLowerCase();
        if (
          blob.includes(`"username":"${user}"`) ||
          blob.includes(`"screen_name":"${user}"`) ||
          blob.includes(`"username":"${user}"`)
        ) {
          return {
            ok: true,
            found: true,
            source: (r.source || "apitwitter") + "-retweeters",
          };
        }
        const lists = [
          Array.isArray(r.data) ? r.data : null,
          (r.data as any).retweeters,
          (r.data as any).users,
          (r.data as any).data,
        ].filter(Boolean) as unknown[];
        for (const list of lists) {
          if (!Array.isArray(list)) continue;
          for (const row of list) {
            const rowObj = row as Record<string, unknown>;
            const h = normalizeXHandle(
              String(
                rowObj.userName ||
                  rowObj.username ||
                  rowObj.screen_name ||
                  ""
              )
            );
            if (h === user) {
              return {
                ok: true,
                found: true,
                source: (r.source || "apitwitter") + "-retweeters",
              };
            }
          }
        }
      }
    } catch {
      /* fall through */
    }
  }

  const ioKey = twitterApiIoKey();
  if (ioKey) {
    for (const path of [
      `${TWITTERAPI_IO_BASE}/twitter/tweet/retweeters?tweetId=${tweetId}`,
      `${TWITTERAPI_IO_BASE}/twitter/tweet/retweeters?tweet_id=${tweetId}`,
    ]) {
      try {
        const res = await fetchTimeout(
          path,
          { headers: { "X-API-Key": ioKey } },
          12_000
        );
        if (res.status === 402) break;
        if (!res.ok) continue;
        const j = (await res.json()) as Record<string, unknown>;
        const blob = JSON.stringify(j).toLowerCase();
        if (
          blob.includes(`"username":"${user}"`) ||
          blob.includes(`"screen_name":"${user}"`) ||
          blob.includes(`"userName":"${user}"`)
        ) {
          return { ok: true, found: true, source: "twitterapi.io-retweeters" };
        }
        // parsed lists
        const lists = [
          j.retweeters,
          j.users,
          (j.data as Record<string, unknown> | undefined)?.retweeters,
          (j.data as Record<string, unknown> | undefined)?.users,
        ].filter(Boolean) as unknown[];
        for (const list of lists) {
          if (!Array.isArray(list)) continue;
          for (const row of list) {
            const r = row as Record<string, unknown>;
            const h = normalizeXHandle(
              String(r.userName || r.username || r.screen_name || "")
            );
            if (h === user) {
              return { ok: true, found: true, source: "twitterapi.io-retweeters" };
            }
          }
        }
      } catch {
        /* try next */
      }
    }
  }

  return { ok: true, found: false, source: "retweeters-miss" };
}

/**
 * Verify user liked the promo tweet. ApiTwitter / official likers, then Jupiter VRFD like.
 */
export async function checkXLiked(
  username: string,
  targetTweetId: string
): Promise<{
  ok: boolean;
  liked: boolean;
  error?: string;
  source?: string;
}> {
  const user = normalizeXHandle(username);
  const target = String(targetTweetId || "").replace(/\D/g, "");
  if (!user) return { ok: false, liked: false, error: "no username" };
  if (!target) return { ok: false, liked: false, error: "no target tweet" };

  const onList = await userInLikers(user, target);
  if (onList.ok && onList.found) {
    return { ok: true, liked: true, source: onList.source };
  }

  if (apiTwitterKey()) {
    try {
      const r = await apiTwitterResolve(
        `/twitter/user/${encodeURIComponent(user)}/likes?count=80`,
        "/twitter/user/likes",
        { userName: user, count: 80 }
      );
      if (r.ok && r.data && JSON.stringify(r.data).includes(target)) {
        return { ok: true, liked: true, source: "apitwitter-user-likes" };
      }
    } catch {
      /* miss */
    }
  }

  try {
    const { userLikedTokenOnVrfd } = await import("@/lib/jup-vrfd");
    const jup = await userLikedTokenOnVrfd({ twitter: user });
    if (jup.liked) {
      return { ok: true, liked: true, source: "jup-vrfd" };
    }
  } catch {
    /* ignore */
  }

  if (onList.ok === false && onList.hardError) {
    return {
      ok: false,
      liked: false,
      error:
        onList.error ||
        "Could not verify like. Like the promo post (and/or like TOKENSHIT on Jupiter VRFD), then claim.",
      source: onList.source,
    };
  }

  return {
    ok: true,
    liked: false,
    error: "Like the promo post (heart), then claim.",
    source: onList.source,
  };
}

async function userInLikers(
  username: string,
  tweetId: string
): Promise<{
  ok: boolean;
  found: boolean;
  hardError?: boolean;
  error?: string;
  source?: string;
}> {
  const user = username.toLowerCase();
  const bearer = process.env.X_BEARER_TOKEN || process.env.TWITTER_BEARER_TOKEN || "";
  if (bearer) {
    try {
      let url: string | null =
        `https://api.twitter.com/2/tweets/${tweetId}/liking_users?max_results=100&user.fields=username`;
      let pages = 0;
      while (url && pages < 5) {
        pages++;
        const res = await fetchTimeout(
          url,
          { headers: { Authorization: `Bearer ${bearer}` } },
          12_000
        );
        if (res.status === 402 || res.status === 429) break;
        if (!res.ok) break;
        const j = (await res.json()) as {
          data?: { username?: string }[];
          meta?: { next_token?: string };
        };
        if ((j.data || []).some((u) => (u.username || "").toLowerCase() === user)) {
          return { ok: true, found: true, source: "x-api-liking_users" };
        }
        const nt = j.meta?.next_token;
        url = nt
          ? `https://api.twitter.com/2/tweets/${tweetId}/liking_users?max_results=100&user.fields=username&pagination_token=${encodeURIComponent(nt)}`
          : null;
      }
    } catch {
      /* fall through */
    }
  }

  if (apiTwitterKey()) {
    try {
      const r = await apiTwitterResolve(
        `/twitter/tweet/likers?tweetId=${encodeURIComponent(tweetId)}`,
        "/twitter/tweet/likers",
        { tweetId, tweet_id: tweetId }
      );
      if (r.ok && r.data) {
        const blob = JSON.stringify(r.data).toLowerCase();
        if (
          blob.includes(`"username":"${user}"`) ||
          blob.includes(`"screen_name":"${user}"`) ||
          blob.includes(`"userName":"${user}"`.toLowerCase())
        ) {
          return { ok: true, found: true, source: "apitwitter-likers" };
        }
      }
    } catch {
      /* miss */
    }
  }

  return { ok: true, found: false, source: "likers-miss" };
}

