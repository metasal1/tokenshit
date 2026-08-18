import { tursoExecute } from "@/lib/turso";

export type ClaimKind =
  | "x_verified"
  | "x_premium"
  | "gh_fork"
  | "x_tweet"
  | "x_follow"
  | "email_list"
  | "jup_verified";

/** Tweet claim cooldown + max tweet age */
export const TWEET_CLAIM_COOLDOWN_MS = 24 * 60 * 60 * 1000;
export const TWEET_MAX_AGE_MS = 24 * 60 * 60 * 1000;

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
      tweet_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    []
  );

  // Migrate older installs that still have UNIQUE(claim_kind, twitter/wallet)
  // which blocked repeat tweet claims forever.
  try {
    const info = await tursoExecute(`PRAGMA index_list('shit_claims')`, []);
    const indexes = (info.rows || []).map((r) => String(r[1] || r[0] || ""));
    const hasLegacyUnique = indexes.some(
      (n) =>
        /unique|sqlite_autoindex/i.test(n) ||
        n.includes("claim_kind")
    );
    // Always ensure tweet_id column exists
    await tursoExecute(
      `ALTER TABLE shit_claims ADD COLUMN tweet_id TEXT`,
      []
    ).catch(() => {});

    // If table was created with UNIQUE constraints, rebuild without them.
    // Detect by attempting a dual-insert test is heavy — check sql via sqlite_master.
    const master = await tursoExecute(
      `SELECT sql FROM sqlite_master WHERE type='table' AND name='shit_claims'`,
      []
    );
    const createSql = String(master.rows?.[0]?.[0] || "");
    if (/UNIQUE\s*\(\s*claim_kind/i.test(createSql)) {
      await tursoExecute(
        `CREATE TABLE IF NOT EXISTS shit_claims_v2 (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          claim_kind TEXT NOT NULL,
          twitter TEXT,
          github TEXT,
          wallet TEXT NOT NULL,
          amount REAL NOT NULL,
          signature TEXT NOT NULL,
          tweet_id TEXT,
          created_at TEXT DEFAULT (datetime('now'))
        )`,
        []
      );
      await tursoExecute(
        `INSERT OR IGNORE INTO shit_claims_v2
         (id, claim_kind, twitter, github, wallet, amount, signature, tweet_id, created_at)
         SELECT id, claim_kind, twitter, github, wallet, amount, signature,
                NULL as tweet_id, created_at FROM shit_claims`,
        []
      ).catch(async () => {
        await tursoExecute(
          `INSERT OR IGNORE INTO shit_claims_v2
           (claim_kind, twitter, github, wallet, amount, signature, created_at)
           SELECT claim_kind, twitter, github, wallet, amount, signature, created_at
           FROM shit_claims`,
          []
        );
      });
      await tursoExecute(`DROP TABLE shit_claims`, []);
      await tursoExecute(
        `ALTER TABLE shit_claims_v2 RENAME TO shit_claims`,
        []
      );
    }
  } catch {
    /* best-effort migrate */
  }

  await tursoExecute(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_shit_claims_tweet_id
     ON shit_claims(tweet_id) WHERE tweet_id IS NOT NULL AND tweet_id != ''`,
    []
  ).catch(() => {});
  await tursoExecute(
    `CREATE INDEX IF NOT EXISTS idx_shit_claims_kind_twitter_time
     ON shit_claims(claim_kind, twitter, created_at)`,
    []
  ).catch(() => {});
}

function parseCreatedAt(raw: unknown): number | null {
  if (raw == null) return null;
  const s = String(raw);
  const t = Date.parse(s.includes("T") ? s : s.replace(" ", "T") + "Z");
  return Number.isFinite(t) ? t : null;
}

/** True only if a **successful on-chain** claim exists (real sig). */
export async function hasClaimed(
  kind: ClaimKind,
  opts: {
    twitter?: string | null;
    github?: string | null;
    wallet?: string | null;
  }
): Promise<boolean> {
  if (kind === "x_tweet") {
    const c = await getTweetClaimCooldown(opts);
    return c.onCooldown;
  }

  await ensureClaimSchema();
  const kinds: ClaimKind[] =
    kind === "x_verified" || kind === "x_premium"
      ? ["x_verified", "x_premium"]
      : [kind];

  // Real Solana sigs are base58 ~64–88 chars — never pending/failed/empty
  const okSig = `signature IS NOT NULL
    AND length(signature) >= 40
    AND signature NOT IN ('pending', 'failed', '')`;

  for (const k of kinds) {
    if (opts.twitter) {
      const r = await tursoExecute(
        `SELECT 1 FROM shit_claims
         WHERE claim_kind = ? AND lower(twitter) = lower(?)
           AND ${okSig}
         LIMIT 1`,
        [k, opts.twitter]
      );
      if (r.rows.length) return true;
    }
    if (opts.github) {
      const r = await tursoExecute(
        `SELECT 1 FROM shit_claims
         WHERE claim_kind = ? AND lower(github) = lower(?)
           AND ${okSig}
         LIMIT 1`,
        [k, opts.github]
      );
      if (r.rows.length) return true;
    }
    if (opts.wallet) {
      const r = await tursoExecute(
        `SELECT 1 FROM shit_claims
         WHERE claim_kind = ? AND wallet = ?
           AND ${okSig}
         LIMIT 1`,
        [k, opts.wallet]
      );
      if (r.rows.length) return true;
    }
  }
  return false;
}

/** Drop abandoned pending claim rows so users can retry after send failures. */
export async function clearStalePendingClaims(opts: {
  kind: ClaimKind;
  twitter?: string | null;
  github?: string | null;
  wallet?: string | null;
}): Promise<void> {
  await ensureClaimSchema();
  // Anything still "pending" older than 10 minutes is dead
  const filters: string[] = [
    `claim_kind = ?`,
    `signature = 'pending'`,
    `created_at < datetime('now', '-10 minutes')`,
  ];
  const args: (string | null)[] = [opts.kind];
  if (opts.twitter) {
    filters.push(`lower(twitter) = lower(?)`);
    args.push(opts.twitter);
  } else if (opts.wallet) {
    filters.push(`wallet = ?`);
    args.push(opts.wallet);
  } else if (opts.github) {
    filters.push(`lower(github) = lower(?)`);
    args.push(opts.github);
  } else {
    return;
  }
  await tursoExecute(
    `DELETE FROM shit_claims WHERE ${filters.join(" AND ")}`,
    args
  ).catch(() => {});
}

export type TweetClaimCooldown = {
  onCooldown: boolean;
  lastClaimAt: string | null;
  nextClaimAt: string | null;
  msRemaining: number;
};

/** Tweet claims: once every 24h per twitter/wallet. */
export async function getTweetClaimCooldown(opts: {
  twitter?: string | null;
  wallet?: string | null;
}): Promise<TweetClaimCooldown> {
  await ensureClaimSchema();
  let lastMs: number | null = null;
  let lastAt: string | null = null;

  const rows: unknown[][] = [];
  if (opts.twitter) {
    const r = await tursoExecute(
      `SELECT created_at FROM shit_claims
       WHERE claim_kind = 'x_tweet'
         AND lower(twitter) = lower(?)
         AND signature IS NOT NULL
         AND length(signature) >= 40
         AND signature NOT IN ('pending', 'failed', '')
       ORDER BY datetime(created_at) DESC LIMIT 1`,
      [opts.twitter]
    );
    if (r.rows.length) rows.push(r.rows[0] as unknown[]);
  }
  if (opts.wallet) {
    const r = await tursoExecute(
      `SELECT created_at FROM shit_claims
       WHERE claim_kind = 'x_tweet'
         AND wallet = ?
         AND signature IS NOT NULL
         AND length(signature) >= 40
         AND signature NOT IN ('pending', 'failed', '')
       ORDER BY datetime(created_at) DESC LIMIT 1`,
      [opts.wallet]
    );
    if (r.rows.length) rows.push(r.rows[0] as unknown[]);
  }

  for (const row of rows) {
    const ms = parseCreatedAt(row[0]);
    if (ms != null && (lastMs == null || ms > lastMs)) {
      lastMs = ms;
      lastAt = String(row[0]);
    }
  }

  if (lastMs == null) {
    return {
      onCooldown: false,
      lastClaimAt: null,
      nextClaimAt: null,
      msRemaining: 0,
    };
  }

  const nextMs = lastMs + TWEET_CLAIM_COOLDOWN_MS;
  const remaining = nextMs - Date.now();
  if (remaining <= 0) {
    return {
      onCooldown: false,
      lastClaimAt: lastAt,
      nextClaimAt: null,
      msRemaining: 0,
    };
  }
  return {
    onCooldown: true,
    lastClaimAt: lastAt,
    nextClaimAt: new Date(nextMs).toISOString(),
    msRemaining: remaining,
  };
}

export async function tweetIdAlreadyClaimed(
  tweetId: string
): Promise<boolean> {
  if (!tweetId) return false;
  await ensureClaimSchema();
  const r = await tursoExecute(
    `SELECT 1 FROM shit_claims
     WHERE tweet_id = ? AND signature != 'pending' LIMIT 1`,
    [tweetId]
  );
  return r.rows.length > 0;
}

/** True if this identity is on the mailing list (email_signups). */
export async function isOnEmailList(opts: {
  email?: string | null;
  twitter?: string | null;
  wallet?: string | null;
  privyId?: string | null;
}): Promise<{ ok: boolean; email?: string }> {
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS email_signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      twitter_handle TEXT,
      wallet_address TEXT,
      privy_id TEXT,
      source TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    []
  ).catch(() => {});

  if (opts.email) {
    const r = await tursoExecute(
      `SELECT email FROM email_signups WHERE lower(email) = lower(?) LIMIT 1`,
      [opts.email.trim()]
    );
    if (r.rows.length) return { ok: true, email: String(r.rows[0][0]) };
  }
  if (opts.wallet) {
    const r = await tursoExecute(
      `SELECT email FROM email_signups WHERE wallet_address = ? LIMIT 1`,
      [opts.wallet]
    );
    if (r.rows.length) return { ok: true, email: String(r.rows[0][0]) };
  }
  if (opts.privyId) {
    const r = await tursoExecute(
      `SELECT email FROM email_signups WHERE privy_id = ? LIMIT 1`,
      [opts.privyId]
    );
    if (r.rows.length) return { ok: true, email: String(r.rows[0][0]) };
  }
  if (opts.twitter) {
    const r = await tursoExecute(
      `SELECT email FROM email_signups WHERE lower(twitter_handle) = lower(?) LIMIT 1`,
      [opts.twitter]
    );
    if (r.rows.length) return { ok: true, email: String(r.rows[0][0]) };
  }
  return { ok: false };
}

export async function recordClaim(opts: {
  kind: ClaimKind;
  twitter?: string | null;
  github?: string | null;
  wallet: string;
  amount: number;
  signature: string;
  tweetId?: string | null;
}) {
  await ensureClaimSchema();
  await tursoExecute(
    `INSERT INTO shit_claims
     (claim_kind, twitter, github, wallet, amount, signature, tweet_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      opts.kind,
      opts.twitter || null,
      opts.github || null,
      opts.wallet,
      opts.amount,
      opts.signature,
      opts.tweetId || null,
    ]
  );
}

// X lookups (official → TweetAPI → free) live in x-data.ts
export {
  fetchXUserPublic,
  checkXVerified,
  checkXFollowsTokenshit,
  checkXTweetTag,
  checkXTweetByUrl,
  formatXApiError,
  parseTweetId,
} from "@/lib/x-data";

export async function checkGhFork(
  githubUsername: string
): Promise<{
  ok: boolean;
  forked: boolean;
  repo?: string;
  error?: string;
  checked?: string[];
}> {
  const user = githubUsername.replace(/^@/, "").trim();
  if (!user) return { ok: false, forked: false, error: "no github" };

  const { GH_FORK_UPSTREAM } = await import("@/lib/shit-token");
  const upstream = (GH_FORK_UPSTREAM || "solana-foundation/tokens").toLowerCase();

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "TokenShit-Claim/1.0",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = (process.env.GITHUB_TOKEN || "").trim();
  if (token) headers.Authorization = `Bearer ${token}`;

  const checked: string[] = [];

  async function getJson(
    url: string
  ): Promise<{ status: number; ok: boolean; json: unknown; rate?: string }> {
    const tryOnce = async (h: Record<string, string>) => {
      const res = await fetch(url, { headers: h, cache: "no-store" });
      let json: unknown = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }
      return {
        status: res.status,
        ok: res.ok,
        json,
        rate: res.headers.get("x-ratelimit-remaining") || undefined,
      };
    };

    let r = await tryOnce(headers);
    // Bad / expired GITHUB_TOKEN → retry anonymous (public repos)
    if (
      (r.status === 401 || r.status === 403) &&
      token &&
      headers.Authorization
    ) {
      const msg = String(
        (r.json as { message?: string } | null)?.message || ""
      ).toLowerCase();
      if (
        r.status === 401 ||
        msg.includes("bad credentials") ||
        msg.includes("requires authentication")
      ) {
        const h2 = { ...headers };
        delete h2.Authorization;
        r = await tryOnce(h2);
      }
    }
    return r;
  }

  function repoUrl(owner: string, name: string) {
    return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;
  }

  function isUpstreamFork(repo: {
    fork?: boolean;
    full_name?: string;
    parent?: { full_name?: string } | null;
    source?: { full_name?: string } | null;
  }): boolean {
    if (!repo?.fork) return false;
    const parent = (repo.parent?.full_name || "").toLowerCase();
    const source = (repo.source?.full_name || "").toLowerCase();
    return parent === upstream || source === upstream;
  }

  // 1) Fast path — common fork names under the user
  const candidates = ["tokens", "solana-tokens", "solana_tokens", "Tokens"];
  for (const name of candidates) {
    const url = repoUrl(user, name);
    checked.push(`${user}/${name}`);
    const r = await getJson(url);
    if (r.status === 404) continue;
    if (r.status === 403 || r.status === 429) {
      return {
        ok: false,
        forked: false,
        error: `GitHub rate limited (${r.status}). Try again shortly.`,
        checked,
      };
    }
    if (r.ok && r.json && typeof r.json === "object") {
      const repo = r.json as {
        fork?: boolean;
        full_name?: string;
        parent?: { full_name?: string };
        source?: { full_name?: string };
      };
      if (isUpstreamFork(repo)) {
        return {
          ok: true,
          forked: true,
          repo: repo.full_name || `${user}/${name}`,
          checked,
        };
      }
    }
  }

  // 2) List user's forks (paginated) — do NOT encodeURIComponent full_name
  for (let page = 1; page <= 3; page++) {
    const listUrl =
      `https://api.github.com/users/${encodeURIComponent(user)}/repos` +
      `?type=forks&sort=updated&per_page=100&page=${page}`;
    const list = await getJson(listUrl);
    if (list.status === 404) {
      return { ok: false, forked: false, error: "GitHub user not found", checked };
    }
    if (!list.ok) {
      if (list.status === 403 || list.status === 429) {
        return {
          ok: false,
          forked: false,
          error: `GitHub rate limited (${list.status})`,
          checked,
        };
      }
      return {
        ok: false,
        forked: false,
        error: `GitHub ${list.status}`,
        checked,
      };
    }
    const repos = (Array.isArray(list.json) ? list.json : []) as {
      name: string;
      fork: boolean;
      full_name: string;
    }[];
    if (!repos.length) break;

    for (const r of repos) {
      if (!r.fork || !r.full_name) continue;
      // Prefer names that look like the registry
      const n = (r.name || "").toLowerCase();
      const priority =
        n === "tokens" || n.includes("solana") || n.includes("token");
      if (!priority && repos.length > 30) {
        // still check all, but tokens-ish first via sort below
      }
      checked.push(r.full_name);
      const [owner, name] = r.full_name.split("/");
      if (!owner || !name) continue;
      const detail = await getJson(repoUrl(owner, name));
      if (!detail.ok || !detail.json || typeof detail.json !== "object") continue;
      const d = detail.json as {
        fork?: boolean;
        full_name?: string;
        parent?: { full_name?: string };
        source?: { full_name?: string };
      };
      if (isUpstreamFork(d)) {
        return {
          ok: true,
          forked: true,
          repo: d.full_name || r.full_name,
          checked,
        };
      }
    }
    if (repos.length < 100) break;
  }

  // 3) Search API backup (finds renamed forks)
  const q = encodeURIComponent(`user:${user} fork:true ${upstream}`);
  const search = await getJson(
    `https://api.github.com/search/repositories?q=${q}&per_page=10`
  );
  if (search.ok && search.json && typeof search.json === "object") {
    const items =
      (
        search.json as {
          items?: { full_name?: string; fork?: boolean; name?: string }[];
        }
      ).items || [];
    for (const it of items) {
      if (!it.full_name) continue;
      checked.push(`search:${it.full_name}`);
      const [owner, name] = it.full_name.split("/");
      if (!owner || !name) continue;
      const detail = await getJson(repoUrl(owner, name));
      if (!detail.ok || !detail.json || typeof detail.json !== "object") continue;
      const d = detail.json as {
        fork?: boolean;
        full_name?: string;
        parent?: { full_name?: string };
        source?: { full_name?: string };
      };
      if (isUpstreamFork(d)) {
        return {
          ok: true,
          forked: true,
          repo: d.full_name || it.full_name,
          checked,
        };
      }
    }
  }

  return { ok: true, forked: false, checked };
}
