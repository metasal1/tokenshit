/**
 * X/Twitter public data for claims.
 * Order: official X API → TweetAPI → free fxtwitter/vxtwitter.
 * Never dump raw API JSON to UI.
 */

const TWEETAPI_BASE = "https://api.tweetapi.com/tw-v2";
const TOKENSHIT_ID = process.env.X_TOKENSHIT_USER_ID || "2037761105359986688";
const TOKENSHIT_USER = "tokenshit_";

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
    /(?:twitter\.com|x\.com)\/[^/]+\/status(?:es)?\/(\d{5,25})/i
  );
  return m?.[1] || null;
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
  profileImageUrl?: string;
  error?: string;
  source?: string;
}): XUserPublic {
  const verifiedType = String(u.verifiedType || "none").toLowerCase();
  const premium = Boolean(
    u.premium ||
      verifiedType === "blue" ||
      (u.verified && verifiedType === "blue")
  );
  const verified =
    premium ||
    u.verified ||
    ["blue", "business", "government"].includes(verifiedType);
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
  const verifiedType = String(d.verifiedType || d.verified_type || "none");
  const verified =
    Boolean(d.isBlueVerified) || // premium blue
    Boolean(d.verified) ||
    Boolean(d.isIdentityVerified) ||
    /blue|business|government/i.test(verifiedType);
  return {
    ok: true,
    username: String(d.username || clean),
    id: d.id ? String(d.id) : undefined,
    name: d.name ? String(d.name) : undefined,
    followers: Number(d.followerCount ?? d.followersCount ?? d.followers ?? 0),
    following: Number(d.followingCount ?? d.following ?? 0),
    tweets: Number(d.tweetCount ?? d.statusesCount ?? d.tweets ?? 0),
    verified,
    verifiedType: verified ? verifiedType || "blue" : "none",
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

  const official = await fromOfficialX(clean);
  if (official?.ok) return withProfileFlags(official);

  const ta = await fromTweetApiUser(clean);
  if (ta?.ok) return withProfileFlags(ta);

  const fx = await fromFxTwitter(clean);
  if (fx?.ok) return withProfileFlags(fx);

  const fail = ta || official;
  if (fail) return withProfileFlags(fail);
  return withProfileFlags({
    ok: false,
    followers: 0,
    following: 0,
    tweets: 0,
    verified: false,
    verifiedType: "none",
    error: "Could not load X profile (X credits + TweetAPI + free fallbacks failed)",
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

/** Does sourceUser/** Does sourceUser follow @Tokenshit_? */
export async function checkXFollowsTokenshit(username: string): Promise<{
  ok: boolean;
  following: boolean;
  error?: string;
  source?: string;
}> {
  const user = username.replace(/^@/, "").trim();
  if (!user) return { ok: false, following: false, error: "no username" };

  // Resolve source id
  const profile = await fetchXUserPublic(user);
  if (!profile.ok || !profile.id) {
    return {
      ok: false,
      following: false,
      error: profile.error || "user not found",
    };
  }

  // TweetAPI friendship (best)
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
        return {
          ok: true,
          following: Boolean(d.following),
          source: "tweetapi",
        };
      }
    } catch {
      /* fall through */
    }
  }

  // Official following pages (expensive / often 402)
  const bearer = xBearer();
  if (bearer) {
    let next: string | null = null;
    for (let page = 0; page < 3; page++) {
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
        if (page === 0) break;
        break;
      }
      const fJson = await fRes.json();
      const list = (fJson.data || []) as { id: string; username?: string }[];
      const following = list.some(
        (u) =>
          u.id === TOKENSHIT_ID ||
          (u.username || "").toLowerCase() === TOKENSHIT_USER
      );
      if (following) return { ok: true, following: true, source: "x-official" };
      next = (fJson.meta?.next_token as string) || null;
      if (!next) break;
    }
  }

  return {
    ok: false,
    following: false,
    error:
      "Could not verify follow (X credits depleted). TweetAPI friendship also failed — check TWEETAPI_KEY.",
  };
}

async function tweetFromTweetApi(tweetId: string): Promise<{
  ok: boolean;
  text?: string;
  authorUsername?: string;
  authorId?: string;
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
  const tw = json.data?.tweet || json.data || json.tweet || json;
  const author = tw.author || {};
  return {
    ok: true,
    text: String(tw.text || tw.fullText || ""),
    authorUsername: author.username
      ? String(author.username).toLowerCase()
      : undefined,
    authorId: author.id ? String(author.id) : undefined,
  };
}

async function tweetFromVx(tweetId: string, hintUser?: string): Promise<{
  ok: boolean;
  text?: string;
  authorUsername?: string;
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
      const d = await res.json();
      const text = String(d.text || d.full_text || "");
      const authorUsername = String(
        d.user_name || d.user_screen_name || d.username || ""
      ).toLowerCase();
      if (text || authorUsername) {
        return { ok: true, text, authorUsername: authorUsername || undefined };
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
  const users = (json.includes?.users || []) as {
    id: string;
    username?: string;
  }[];
  const author = users.find((u) => u.id === authorId);
  return {
    ok: true,
    text,
    authorUsername: (author?.username || "").toLowerCase() || undefined,
    authorId,
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
  error?: string;
}> {
  const user = username.replace(/^@/, "").trim().toLowerCase();
  const tweetId = parseTweetId(tweetUrlOrId);
  if (!user) return { ok: false, found: false, error: "no username" };
  if (!tweetId) {
    return {
      ok: false,
      found: false,
      error: "Paste a full X/Twitter status link (or tweet id).",
    };
  }

  let got =
    (await tweetFromOfficial(tweetId).catch(() => null)) ||
    null;
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

  const authorUser = (got.authorUsername || "").toLowerCase();
  if (authorUser && authorUser !== user) {
    return {
      ok: false,
      found: false,
      error: `That tweet is from @${got.authorUsername}, not @${user}.`,
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
  return {
    ok: true,
    found: true,
    tweetId,
    text: text.slice(0, 280),
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
