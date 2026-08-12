/**
 * Anti-abuse for signups + treasury claims.
 * Goal: slow farm bots / throwaway X accounts without blocking real degens.
 *
 * Env knobs (all optional):
 *   MIN_X_FOLLOWERS_CLAIM=50        — tweet/follow claims
 *   MIN_X_FOLLOWERS_REFERRAL=25     — referred account must clear this for payout
 *   SIGNUP_PER_IP_HOUR=8
 *   CLAIM_PER_IP_DAY=12
 *   SIGNUP_BLOCK_DISPOSABLE=1       — default on
 *   ABUSE_SOFT_MODE=1               — log/tag only, don't hard-block (testing)
 */
import { tursoExecute } from "@/lib/turso";
import { fetchXUserPublic } from "@/lib/claims";

export const MIN_X_FOLLOWERS_CLAIM = Number(
  process.env.MIN_X_FOLLOWERS_CLAIM || 50
);
export const MIN_X_FOLLOWERS_REFERRAL = Number(
  process.env.MIN_X_FOLLOWERS_REFERRAL || 25
);
export const SIGNUP_PER_IP_HOUR = Number(
  process.env.SIGNUP_PER_IP_HOUR || 8
);
export const CLAIM_PER_IP_DAY = Number(process.env.CLAIM_PER_IP_DAY || 12);

const SOFT = process.env.ABUSE_SOFT_MODE === "1";

/** Common disposable / burn email hosts */
const DISPOSABLE = new Set(
  [
    "mailinator.com",
    "guerrillamail.com",
    "guerrillamail.net",
    "sharklasers.com",
    "grr.la",
    "tempmail.com",
    "temp-mail.org",
    "temp-mail.io",
    "10minutemail.com",
    "10minemail.com",
    "yopmail.com",
    "trashmail.com",
    "throwaway.email",
    "getnada.com",
    "nada.ltd",
    "discard.email",
    "mailnesia.com",
    "maildrop.cc",
    "fakeinbox.com",
    "emailondeck.com",
    "mintemail.com",
    "moakt.com",
    "tmpmail.org",
    "tmpmail.net",
    "tmail.ws",
    "dispostable.com",
    "mailcatch.com",
    "mytemp.email",
    "tempail.com",
    "tempr.email",
    "discardmail.com",
    "spamgourmet.com",
    "mailnull.com",
    "jetable.org",
    "inboxkitten.com",
    "emailfake.com",
    "crazymailing.com",
    "mailforspam.com",
    "trash-mail.com",
  ].map((d) => d.toLowerCase())
);

export function getClientIp(request: Request): string {
  const h = (name: string) => request.headers.get(name) || "";
  const cf = h("cf-connecting-ip").trim();
  if (cf) return cf.slice(0, 64);
  const xff = h("x-forwarded-for").split(",")[0]?.trim();
  if (xff) return xff.slice(0, 64);
  const real = h("x-real-ip").trim();
  if (real) return real.slice(0, 64);
  return "unknown";
}

export function isDisposableEmail(email: string): boolean {
  if (process.env.SIGNUP_BLOCK_DISPOSABLE === "0") return false;
  const host = email.split("@")[1]?.toLowerCase().trim();
  if (!host) return true;
  if (DISPOSABLE.has(host)) return true;
  // plus-address farms on free providers still allowed — rate limit covers
  if (/^(temp|trash|fake|spam|disposable)/i.test(host)) return true;
  return false;
}

async function ensureAbuseSchema() {
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS abuse_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL,
      ip TEXT NOT NULL,
      subject TEXT,
      meta TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    []
  );
  await tursoExecute(
    `CREATE INDEX IF NOT EXISTS idx_abuse_ip_kind_time
     ON abuse_events(ip, kind, created_at)`,
    []
  ).catch(() => {});
}

export async function recordAbuseEvent(
  kind: string,
  ip: string,
  subject?: string | null,
  meta?: Record<string, unknown>
) {
  try {
    await ensureAbuseSchema();
    await tursoExecute(
      `INSERT INTO abuse_events (kind, ip, subject, meta) VALUES (?, ?, ?, ?)`,
      [
        kind.slice(0, 64),
        (ip || "unknown").slice(0, 64),
        subject ? String(subject).slice(0, 128) : null,
        meta ? JSON.stringify(meta).slice(0, 500) : null,
      ]
    );
  } catch (e) {
    console.error("abuse event log failed", e);
  }
}

/** Count events of kind for ip in last `hours` */
export async function countAbuseRecent(
  kind: string,
  ip: string,
  hours: number
): Promise<number> {
  try {
    await ensureAbuseSchema();
    const r = await tursoExecute(
      `SELECT COUNT(*) FROM abuse_events
       WHERE kind = ? AND ip = ?
         AND created_at >= datetime('now', ?)`,
      [kind, ip, `-${Math.max(1, hours)} hours`]
    );
    return Number(r.rows[0]?.[0] || 0);
  } catch {
    return 0;
  }
}

export type GateResult =
  | { ok: true; soft?: string }
  | { ok: false; status: number; error: string; code?: string };

export async function gateSignupIp(ip: string): Promise<GateResult> {
  const n = await countAbuseRecent("signup", ip, 1);
  if (n >= SIGNUP_PER_IP_HOUR) {
    if (SOFT) return { ok: true, soft: `signup rate soft ${n}/${SIGNUP_PER_IP_HOUR}` };
    return {
      ok: false,
      status: 429,
      error: "Too many signups from this network. Try again later.",
      code: "ip_rate_signup",
    };
  }
  return { ok: true };
}

export async function gateClaimIp(ip: string): Promise<GateResult> {
  const n = await countAbuseRecent("claim", ip, 24);
  if (n >= CLAIM_PER_IP_DAY) {
    if (SOFT) return { ok: true, soft: `claim rate soft ${n}/${CLAIM_PER_IP_DAY}` };
    return {
      ok: false,
      status: 429,
      error: "Too many claims from this network today. Come back tomorrow.",
      code: "ip_rate_claim",
    };
  }
  return { ok: true };
}

export async function gateXFollowersForClaim(
  twitter: string | null | undefined,
  kind: string
): Promise<GateResult & { followers?: number }> {
  // Verified claim already requires blue; GH fork is GH quality. Soft/hard on tweet+follow.
  if (kind !== "x_tweet" && kind !== "x_follow") return { ok: true };
  if (!twitter) {
    return { ok: false, status: 400, error: "Twitter required", code: "no_twitter" };
  }
  if (MIN_X_FOLLOWERS_CLAIM <= 0) return { ok: true };

  const x = await fetchXUserPublic(twitter);
  if (!x.ok) {
    // Fail closed on claim if we can't verify size — farms hide behind API errors
    return {
      ok: false,
      status: 503,
      error: "Could not verify X account. Try again shortly.",
      code: "x_lookup_failed",
    };
  }
  const followers = x.followers;
  if (followers < MIN_X_FOLLOWERS_CLAIM) {
    if (SOFT) {
      return {
        ok: true,
        soft: `followers ${followers} < ${MIN_X_FOLLOWERS_CLAIM}`,
        followers,
      };
    }
    return {
      ok: false,
      status: 403,
      error: `X account needs at least ${MIN_X_FOLLOWERS_CLAIM} followers to claim this reward (you have ${followers}). Grow a bit, then come back — keeps the treasury for real users.`,
      code: "low_followers",
      followers,
    };
  }
  // default avatar + 0 tweets = botty
  if (followers < MIN_X_FOLLOWERS_CLAIM * 2 && (x.tweets || 0) < 3) {
    if (!SOFT) {
      return {
        ok: false,
        status: 403,
        error:
          "X account looks brand-new (almost no posts). Post a bit, then claim.",
        code: "thin_account",
        followers,
      };
    }
  }
  return { ok: true, followers };
}

export async function gateReferredForPayout(
  referredTwitter: string
): Promise<GateResult & { followers?: number }> {
  if (MIN_X_FOLLOWERS_REFERRAL <= 0) return { ok: true };
  const x = await fetchXUserPublic(referredTwitter);
  if (!x.ok) {
    return {
      ok: false,
      status: 403,
      error: `Could not verify @${referredTwitter} — skipped payout`,
      code: "x_lookup_failed",
    };
  }
  if (x.followers < MIN_X_FOLLOWERS_REFERRAL) {
    return {
      ok: false,
      status: 403,
      error: `@${referredTwitter} has ${x.followers} followers (need ${MIN_X_FOLLOWERS_REFERRAL}+ for referral pay)`,
      code: "low_followers_referred",
      followers: x.followers,
    };
  }
  return { ok: true, followers: x.followers };
}

export function qualityLabel(followers: number | null | undefined): string {
  if (followers == null) return "unknown";
  if (followers < 10) return "dust";
  if (followers < MIN_X_FOLLOWERS_CLAIM) return "thin";
  if (followers < 500) return "small";
  if (followers < 5000) return "mid";
  return "solid";
}
