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

/** X API: is this username verified (blue/business/gov)? */
export async function checkXVerified(
  username: string
): Promise<{ ok: boolean; verified: boolean; verifiedType: string; error?: string }> {
  const bearer =
    process.env.X_BEARER_TOKEN ||
    process.env.TWITTER_BEARER_TOKEN ||
    process.env.X_USER_BEARER ||
    "";
  const clean = username.replace(/^@/, "").trim();
  if (!clean) return { ok: false, verified: false, verifiedType: "none", error: "no username" };

  // Prefer bearer; fall back to public scrape is not reliable — require bearer
  if (!bearer) {
    // Local/dev: shell out is not available on CF — try unauthenticated fails
    return {
      ok: false,
      verified: false,
      verifiedType: "none",
      error: "X_BEARER_TOKEN not configured",
    };
  }

  const url = `https://api.x.com/2/users/by/username/${encodeURIComponent(clean)}?user.fields=verified,verified_type`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${bearer}` },
  });
  if (!res.ok) {
    const t = await res.text();
    return {
      ok: false,
      verified: false,
      verifiedType: "none",
      error: `X API ${res.status}: ${t.slice(0, 200)}`,
    };
  }
  const json = await res.json();
  const d = json.data || {};
  const verifiedType = String(d.verified_type || "none").toLowerCase();
  const verified =
    Boolean(d.verified) ||
    ["blue", "business", "government"].includes(verifiedType);
  return { ok: true, verified, verifiedType };
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

/**
 * Recent search: user tweeted tagging @Tokenshit_ (or tokenshit.com).
 * Requires X API recent search access on the bearer.
 */
export async function checkXTweetTag(
  username: string
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
      error: `X search ${res.status}: ${t.slice(0, 200)}`,
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

