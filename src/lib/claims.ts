import { tursoExecute } from "@/lib/turso";

export type ClaimKind = "x_verified" | "gh_fork" | "x_tweet" | "x_follow";

export async function ensureClaimSchema() {
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS shit_claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      claim_kind TEXT NOT NULL,
      twitter TEXT,
      github TEXT,
      wallet TEXT NOT NULL,
      amount REAL NOT NULL,
      signature TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(claim_kind, twitter),
      UNIQUE(claim_kind, github),
      UNIQUE(claim_kind, wallet)
    )`,
    []
  );
}

export async function hasClaimed(
  kind: ClaimKind,
  opts: { twitter?: string | null; github?: string | null; wallet?: string | null }
): Promise<boolean> {
  await ensureClaimSchema();
  if (opts.twitter) {
    const r = await tursoExecute(
      `SELECT 1 FROM shit_claims WHERE claim_kind = ? AND lower(twitter) = lower(?) LIMIT 1`,
      [kind, opts.twitter]
    );
    if (r.rows.length) return true;
  }
  if (opts.github) {
    const r = await tursoExecute(
      `SELECT 1 FROM shit_claims WHERE claim_kind = ? AND lower(github) = lower(?) LIMIT 1`,
      [kind, opts.github]
    );
    if (r.rows.length) return true;
  }
  if (opts.wallet) {
    const r = await tursoExecute(
      `SELECT 1 FROM shit_claims WHERE claim_kind = ? AND wallet = ? LIMIT 1`,
      [kind, opts.wallet]
    );
    if (r.rows.length) return true;
  }
  return false;
}

export async function recordClaim(opts: {
  kind: ClaimKind;
  twitter?: string | null;
  github?: string | null;
  wallet: string;
  amount: number;
  signature: string;
}) {
  await ensureClaimSchema();
  await tursoExecute(
    `INSERT INTO shit_claims (claim_kind, twitter, github, wallet, amount, signature)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      opts.kind,
      opts.twitter || null,
      opts.github || null,
      opts.wallet,
      opts.amount,
      opts.signature,
    ]
  );
}

/** X API: public profile snapshot for a username (followers + verified). */
export async function fetchXUserPublic(username: string): Promise<{
  ok: boolean;
  username?: string;
  id?: string;
  name?: string;
  followers: number;
  following: number;
  tweets: number;
  verified: boolean;
  verifiedType: string;
  profileImageUrl?: string;
  error?: string;
}> {
  const bearer =
    process.env.X_BEARER_TOKEN ||
    process.env.TWITTER_BEARER_TOKEN ||
    process.env.X_USER_BEARER ||
    "";
  const clean = username.replace(/^@/, "").trim();
  if (!clean) {
    return {
      ok: false,
      followers: 0,
      following: 0,
      tweets: 0,
      verified: false,
      verifiedType: "none",
      error: "no username",
    };
  }
  if (!bearer) {
    return {
      ok: false,
      followers: 0,
      following: 0,
      tweets: 0,
      verified: false,
      verifiedType: "none",
      error: "X_BEARER_TOKEN not configured",
    };
  }

  const url = `https://api.x.com/2/users/by/username/${encodeURIComponent(
    clean
  )}?user.fields=public_metrics,verified,verified_type,name,username,profile_image_url`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${bearer}`,
      "User-Agent": "TokenShit/1.0",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text();
    return {
      ok: false,
      followers: 0,
      following: 0,
      tweets: 0,
      verified: false,
      verifiedType: "none",
      error: `X API ${res.status}: ${t.slice(0, 200)}`,
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
  };
}

/** X API: is this username verified (blue/business/gov)? */
export async function checkXVerified(
  username: string
): Promise<{
  ok: boolean;
  verified: boolean;
  verifiedType: string;
  followers?: number;
  error?: string;
}> {
  const m = await fetchXUserPublic(username);
  return {
    ok: m.ok,
    verified: m.verified,
    verifiedType: m.verifiedType,
    followers: m.followers,
    error: m.error,
  };
}

/** GitHub: does user have a fork of solana-foundation/tokens? */
export async function checkGhFork(
  githubUsername: string
): Promise<{ ok: boolean; forked: boolean; repo?: string; error?: string }> {
  const user = githubUsername.replace(/^@/, "").trim();
  if (!user) return { ok: false, forked: false, error: "no github" };

  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "TokenShit-Claim/1.0",
  };
  const token = (process.env.GITHUB_TOKEN || "").trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  async function getJson(url: string) {
    let res = await fetch(url, { headers });
    // Bad/expired token → retry unauthenticated (public repos)
    if (res.status === 401 && token) {
      const h2 = { ...headers } as Record<string, string>;
      delete h2.Authorization;
      res = await fetch(url, { headers: h2 });
    }
    return res;
  }

  // Fast path: same-name fork
  const direct = await getJson(
    `https://api.github.com/repos/${encodeURIComponent(user)}/tokens`
  );
  if (direct.status === 200) {
    const repo = await direct.json();
    const parent = repo.parent?.full_name || repo.source?.full_name || "";
    if (repo.fork && parent === "solana-foundation/tokens") {
      return { ok: true, forked: true, repo: repo.full_name };
    }
  }

  // Scan owned repos for any fork of upstream
  const list = await getJson(
    `https://api.github.com/users/${encodeURIComponent(user)}/repos?type=owner&per_page=100&sort=updated`
  );
  if (!list.ok) {
    return {
      ok: false,
      forked: false,
      error: `GitHub ${list.status}`,
    };
  }
  const repos = (await list.json()) as {
    name: string;
    fork: boolean;
    full_name: string;
  }[];
  for (const r of repos || []) {
    if (!r.fork) continue;
    const detail = await getJson(
      `https://api.github.com/repos/${encodeURIComponent(r.full_name)}`
    );
    if (!detail.ok) continue;
    const d = await detail.json();
    const parent = d.parent?.full_name || d.source?.full_name || "";
    if (parent === "solana-foundation/tokens") {
      return { ok: true, forked: true, repo: d.full_name };
    }
  }
  return { ok: true, forked: false };
}

function xBearer(): string {
  return (
    process.env.X_BEARER_TOKEN ||
    process.env.TWITTER_BEARER_TOKEN ||
    process.env.X_USER_BEARER ||
    ""
  );
}

/** Human X API failures (never dump raw JSON to the UI). */
export function formatXApiError(status: number, body: string): string {
  const lower = body.toLowerCase();
  if (
    status === 402 ||
    lower.includes("credits depleted") ||
    lower.includes("credits-depleted") ||
    lower.includes("payment required")
  ) {
    return "X API credits are depleted — tweet search is offline. Paste your tweet link and try again, or top up the X developer app.";
  }
  if (status === 429 || lower.includes("rate limit")) {
    return "X API rate limit — wait a minute and try again.";
  }
  if (status === 401 || status === 403) {
    return "X API auth failed — check X_BEARER_TOKEN on the server.";
  }
  // keep short, no full JSON dump
  let detail = "";
  try {
    const j = JSON.parse(body);
    detail = j.title || j.detail || j.error || "";
  } catch {
    detail = body.replace(/\s+/g, " ").slice(0, 80);
  }
  return detail
    ? `X API error (${status}): ${detail}`
    : `X API error (${status})`;
}

function parseTweetId(input: string): string | null {
  const s = (input || "").trim();
  if (!s) return null;
  if (/^\d{5,25}$/.test(s)) return s;
  const m = s.match(
    /(?:twitter\.com|x\.com)\/[^/]+\/status(?:es)?\/(\d{5,25})/i
  );
  return m?.[1] || null;
}

/**
 * Verify a specific tweet by URL/id (GET /2/tweets/:id).
 * Prefer this when recent search is out of credits.
 */
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
  const bearer = xBearer();
  const user = username.replace(/^@/, "").trim().toLowerCase();
  const tweetId = parseTweetId(tweetUrlOrId);
  if (!user) return { ok: false, found: false, error: "no username" };
  if (!tweetId)
    return {
      ok: false,
      found: false,
      error: "Paste a full X/Twitter status link (or tweet id).",
    };
  if (!bearer)
    return { ok: false, found: false, error: "X_BEARER_TOKEN not configured" };

  const url = new URL(`https://api.x.com/2/tweets/${tweetId}`);
  url.searchParams.set("tweet.fields", "author_id,text,entities,created_at");
  url.searchParams.set("expansions", "author_id");
  url.searchParams.set("user.fields", "username");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${bearer}` },
  });
  if (!res.ok) {
    const t = await res.text();
    return {
      ok: false,
      found: false,
      error: formatXApiError(res.status, t),
    };
  }
  const json = await res.json();
  const text = String(json.data?.text || "");
  const authorId = json.data?.author_id as string | undefined;
  const users = (json.includes?.users || []) as {
    id: string;
    username?: string;
  }[];
  const author = users.find((u) => u.id === authorId);
  const authorUser = (author?.username || "").toLowerCase();
  if (authorUser && authorUser !== user) {
    return {
      ok: false,
      found: false,
      error: `That tweet is from @${author?.username}, not @${user}.`,
    };
  }
  const tagsOk =
    /@tokenshit_/i.test(text) ||
    /tokenshit\.com/i.test(text) ||
    /\$?TOKENSHIT/i.test(text);
  if (!tagsOk) {
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

/**
 * Recent search: user tweeted tagging @Tokenshit_ (or tokenshit.com).
 * Requires X API recent search access on the bearer.
 * Optional tweetUrl skips search (lookup by id) when credits are low.
 */
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
  const bearer = xBearer();
  const user = username.replace(/^@/, "").trim();
  if (!user) return { ok: false, found: false, error: "no username" };
  if (!bearer)
    return { ok: false, found: false, error: "X_BEARER_TOKEN not configured" };

  if (tweetUrl && String(tweetUrl).trim()) {
    return checkXTweetByUrl(user, String(tweetUrl));
  }

  // from:user mentioning Tokenshit_ or link
  const query = `from:${user} (@Tokenshit_ OR @tokenshit_ OR tokenshit.com OR TOKENSHIT) -is:retweet -is:reply`;
  const url = new URL("https://api.x.com/2/tweets/search/recent");
  url.searchParams.set("query", query);
  url.searchParams.set("max_results", "10");
  url.searchParams.set("tweet.fields", "author_id,created_at,text,entities");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${bearer}` },
  });
  if (!res.ok) {
    const t = await res.text();
    return {
      ok: false,
      found: false,
      error: formatXApiError(res.status, t),
    };
  }
  const json = await res.json();
  const tweets = (json.data || []) as { id: string; text: string }[];
  if (!tweets.length) {
    return { ok: true, found: false };
  }
  // Prefer one that actually tags @Tokenshit_
  const tagged =
    tweets.find((t) => /@tokenshit_/i.test(t.text || "")) || tweets[0];
  return {
    ok: true,
    found: true,
    tweetId: tagged.id,
    text: (tagged.text || "").slice(0, 280),
  };
}

/**
 * Check if sourceUser follows Tokenshit_ via user lookup + following endpoint.
 * Uses Tokenshit_ app user token when available (followers lookup).
 * Fallback: search if user replied/mentioned after follow intent is weak —
 * primary path is GET /2/users/:id/followers is expensive; use
 * GET /2/users/:source/following/:target or friendships/show.
 */
export async function checkXFollowsTokenshit(
  username: string
): Promise<{ ok: boolean; following: boolean; error?: string }> {
  const bearer = xBearer();
  const user = username.replace(/^@/, "").trim();
  if (!user) return { ok: false, following: false, error: "no username" };
  if (!bearer)
    return {
      ok: false,
      following: false,
      error: "X_BEARER_TOKEN not configured",
    };

  // Resolve user id
  const uRes = await fetch(
    `https://api.x.com/2/users/by/username/${encodeURIComponent(user)}`,
    { headers: { Authorization: `Bearer ${bearer}` } }
  );
  if (!uRes.ok) {
    return {
      ok: false,
      following: false,
      error: `user lookup ${uRes.status}`,
    };
  }
  const uJson = await uRes.json();
  const sourceId = uJson.data?.id;
  if (!sourceId)
    return { ok: false, following: false, error: "user not found" };

  const targetId =
    process.env.X_TOKENSHIT_USER_ID || "2037761105359986688";

  // Official relationship endpoint (v1.1) — works with user context
  const rel = await fetch(
    `https://api.x.com/1.1/friendships/show.json?source_id=${encodeURIComponent(
      sourceId
    )}&target_id=${encodeURIComponent(targetId)}`,
    { headers: { Authorization: `Bearer ${bearer}` } }
  );
  if (rel.ok) {
    const r = await rel.json();
    const following = Boolean(
      r.relationship?.source?.following || r.relationship?.target?.followed_by
    );
    return { ok: true, following };
  }

  // v2: GET /2/users/:id/following?max_results=1000 is heavy; try target following me
  // Alternative: following lookup
  const fRes = await fetch(
    `https://api.x.com/2/users/${sourceId}/following?max_results=1000&user.fields=username`,
    { headers: { Authorization: `Bearer ${bearer}` } }
  );
  if (!fRes.ok) {
    const t = await fRes.text();
    return {
      ok: false,
      following: false,
      error: `following ${fRes.status}: ${t.slice(0, 160)}`,
    };
  }
  const fJson = await fRes.json();
  const list = (fJson.data || []) as { id: string; username?: string }[];
  const following = list.some(
    (u) =>
      u.id === targetId ||
      (u.username || "").toLowerCase() === "tokenshit_"
  );
  return { ok: true, following };
}

