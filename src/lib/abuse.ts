/**
 * Anti-abuse for signups + treasury claims.
 *
 * Metasal claim rules:
 *   - X login compulsory
 *   - min 100 followers + real PFP
 *   - major claims (verified/premium/gh): 1 IP / day
 *
 * Env knobs (optional):
 *   MIN_X_FOLLOWERS_CLAIM=100
 *   MIN_X_FOLLOWERS_REFERRAL=100
 *   MAJOR_CLAIMS_PER_IP_DAY=1
 *   CLAIM_PER_IP_DAY=12
 *   ABUSE_SOFT_MODE=1
 */
import { tursoExecute } from "@/lib/turso";
import { fetchXUserPublic } from "@/lib/claims";
import {
  ABUSE_MIN_FOLLOWERS_CLAIM,
  ABUSE_MIN_FOLLOWERS_REFERRAL,
  CLAIM_REQUIRE_PFP,
  MAJOR_CLAIMS_PER_IP_DAY,
} from "@/lib/shit-token";

export const MIN_X_FOLLOWERS_CLAIM = ABUSE_MIN_FOLLOWERS_CLAIM;
export const MIN_X_FOLLOWERS_REFERRAL = ABUSE_MIN_FOLLOWERS_REFERRAL;
export const SIGNUP_PER_IP_HOUR = Number(process.env.SIGNUP_PER_IP_HOUR || 8);
export const CLAIM_PER_IP_DAY = Number(process.env.CLAIM_PER_IP_DAY || 12);

const SOFT = process.env.ABUSE_SOFT_MODE === "1";

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
    "trashmail.me",
    "emailondeck.com",
    "mintemail.com",
    "mytemp.email",
    "tempail.com",
    "dispostable.com",
  ].map((h) => h.toLowerCase())
);

export type GateResult = {
  ok: boolean;
  status?: number;
  error?: string;
  code?: string;
  soft?: string;
};

export async function ensureAbuseSchema() {
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS abuse_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL,
      ip TEXT,
      subject TEXT,
      meta TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    []
  );
  await tursoExecute(
    `CREATE INDEX IF NOT EXISTS idx_abuse_kind_ip_time
     ON abuse_events(kind, ip, created_at)`,
    []
  ).catch(() => {});
}

export async function recordAbuseEvent(
  kind: string,
  ip: string | null,
  subject: string | null,
  meta?: Record<string, unknown>
) {
  await ensureAbuseSchema();
  await tursoExecute(
    `INSERT INTO abuse_events (kind, ip, subject, meta) VALUES (?, ?, ?, ?)`,
    [kind, ip, subject, meta ? JSON.stringify(meta) : null]
  );
}

export function getClientIp(req: {
  headers: { get(name: string): string | null };
}): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  return "unknown";
}

export function isDisposableEmail(email: string): boolean {
  const host = email.split("@")[1]?.toLowerCase().trim();
  if (!host) return true;
  if (DISPOSABLE.has(host)) return true;
  return (
    host.endsWith(".tk") ||
    host.includes("tempmail") ||
    host.includes("throwaway")
  );
}

async function countAbuseRecent(
  kind: string,
  ip: string,
  hours: number
): Promise<number> {
  await ensureAbuseSchema();
  const r = await tursoExecute(
    `SELECT COUNT(*) FROM abuse_events
     WHERE kind = ? AND ip = ?
       AND created_at >= datetime('now', ?)`,
    [kind, ip, `-${hours} hours`]
  );
  return Number(r.rows[0]?.[0] || 0);
}

export async function gateSignupIp(ip: string): Promise<GateResult> {
  const n = await countAbuseRecent("signup", ip, 1);
  if (n >= SIGNUP_PER_IP_HOUR) {
    if (SOFT)
      return { ok: true, soft: `signup rate soft ${n}/${SIGNUP_PER_IP_HOUR}` };
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
    if (SOFT)
      return { ok: true, soft: `claim rate soft ${n}/${CLAIM_PER_IP_DAY}` };
    return {
      ok: false,
      status: 429,
      error: "Too many claims from this network today. Come back tomorrow.",
      code: "ip_rate_claim",
    };
  }
  return { ok: true };
}

/** Major claims: verified / premium / GH fork — 1 per IP per day */
export async function gateMajorClaimIp(
  ip: string,
  kind: string
): Promise<GateResult> {
  const major =
    kind === "x_verified" || kind === "x_premium" || kind === "gh_fork";
  if (!major) return { ok: true };
  const limit = MAJOR_CLAIMS_PER_IP_DAY > 0 ? MAJOR_CLAIMS_PER_IP_DAY : 1;
  const n = await countAbuseRecent("claim_major", ip, 24);
  if (n >= limit) {
    if (SOFT) return { ok: true, soft: `major claim soft ${n}/${limit}` };
    return {
      ok: false,
      status: 429,
      error:
        "One major claim (verified / premium / GitHub) per network per day. Try again tomorrow.",
      code: "ip_rate_major",
    };
  }
  return { ok: true };
}

/** All claims: X profile, ≥100 followers, real PFP. Fail closed on lookup fail. */
export async function gateXProfileForClaim(
  twitter: string | null | undefined
): Promise<
  GateResult & {
    followers?: number;
    hasPfp?: boolean;
    premium?: boolean;
    verified?: boolean;
  }
> {
  if (!twitter) {
    return {
      ok: false,
      status: 400,
      error: "Sign in with X is required.",
      code: "no_twitter",
    };
  }
  const x = await fetchXUserPublic(twitter);
  if (!x.ok) {
    return {
      ok: false,
      status: 502,
      error: x.error || "Could not verify your X profile. Try again shortly.",
      code: "x_lookup_failed",
    };
  }
  const followers = x.followers;
  if (followers < MIN_X_FOLLOWERS_CLAIM) {
    return {
      ok: false,
      status: 403,
      error: `Need at least ${MIN_X_FOLLOWERS_CLAIM} X followers (you have ${followers}).`,
      code: "low_followers",
      followers,
      hasPfp: x.hasPfp,
      premium: x.premium,
      verified: x.verified,
    };
  }
  if (CLAIM_REQUIRE_PFP && !x.hasPfp) {
    return {
      ok: false,
      status: 403,
      error: "Set a profile picture on X, then claim.",
      code: "no_pfp",
      followers,
      hasPfp: false,
      premium: x.premium,
      verified: x.verified,
    };
  }
  return {
    ok: true,
    followers,
    hasPfp: x.hasPfp,
    premium: x.premium,
    verified: x.verified,
  };
}

/** @deprecated use gateXProfileForClaim */
export async function gateXFollowersForClaim(
  twitter: string | null | undefined,
  _kind: string
): Promise<GateResult & { followers?: number }> {
  return gateXProfileForClaim(twitter);
}

export async function gateReferredForPayout(
  referredTwitter: string
): Promise<GateResult & { followers?: number }> {
  if (MIN_X_FOLLOWERS_REFERRAL <= 0) return { ok: true };
  const x = await fetchXUserPublic(referredTwitter);
  if (!x.ok) {
    return {
      ok: false,
      status: 502,
      error: `Could not verify @${referredTwitter}`,
      code: "x_lookup_failed",
    };
  }
  if (x.followers < MIN_X_FOLLOWERS_REFERRAL) {
    return {
      ok: false,
      status: 403,
      error: `@${referredTwitter} has ${x.followers} followers (need ${MIN_X_FOLLOWERS_REFERRAL}+)`,
      code: "low_followers_referred",
      followers: x.followers,
    };
  }
  if (CLAIM_REQUIRE_PFP && !x.hasPfp) {
    return {
      ok: false,
      status: 403,
      error: `@${referredTwitter} needs a profile picture`,
      code: "no_pfp_referred",
      followers: x.followers,
    };
  }
  return { ok: true, followers: x.followers };
}


export function qualityLabel(followers: number): string {
  if (followers >= 10000) return "whale";
  if (followers >= 1000) return "solid";
  if (followers >= 100) return "ok";
  if (followers >= 25) return "thin";
  return "micro";
}

export function fmtFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
