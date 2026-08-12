import { type NextRequest } from "next/server";
import { tursoExecute } from "@/lib/turso";
import { sendTemplateEmail } from "@/lib/resend";
import { sendTelegramMessage, escapeHtml } from "@/lib/telegram";
import { fetchXUserPublic } from "@/lib/claims";
import {
  getClientIp,
  gateSignupIp,
  isDisposableEmail,
  recordAbuseEvent,
  qualityLabel,
  MIN_X_FOLLOWERS_CLAIM,
} from "@/lib/abuse";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function ensureSignupSchema() {
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS email_signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      twitter_handle TEXT,
      wallet_address TEXT,
      privy_id TEXT,
      source TEXT,
      x_followers INTEGER,
      x_verified INTEGER,
      x_verified_type TEXT,
      x_avatar_url TEXT,
      referrer_twitter TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    []
  );
  for (const col of [
    "ALTER TABLE email_signups ADD COLUMN x_followers INTEGER",
    "ALTER TABLE email_signups ADD COLUMN x_verified INTEGER",
    "ALTER TABLE email_signups ADD COLUMN x_verified_type TEXT",
    "ALTER TABLE email_signups ADD COLUMN x_avatar_url TEXT",
    "ALTER TABLE email_signups ADD COLUMN referrer_twitter TEXT",
  ]) {
    try {
      await tursoExecute(col, []);
    } catch {
      /* exists */
    }
  }
}

function truncWallet(addr?: string | null): string {
  if (!addr) return "";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

function fmtFollowers(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export async function POST(request: NextRequest) {
  try {
    await ensureSignupSchema();
    const ip = getClientIp(request);
    const ipGate = await gateSignupIp(ip);
    if (!ipGate.ok) {
      await recordAbuseEvent("signup_blocked", ip, null, { reason: ipGate.code });
      return Response.json(
        { error: ipGate.error, code: ipGate.code },
        { status: ipGate.status }
      );
    }

    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    const twitterHandle = body.twitterHandle
      ? String(body.twitterHandle).toLowerCase().replace(/^@/, "")
      : null;
    const walletAddress = body.walletAddress
      ? String(body.walletAddress)
      : null;
    const privyId = body.privyId ? String(body.privyId) : null;
    const source = body.source
      ? String(body.source).slice(0, 64)
      : "post-login-modal";
    let referrerTwitter = body.referrerTwitter
      ? String(body.referrerTwitter).toLowerCase().replace(/^@/, "").trim()
      : null;
    if (referrerTwitter && !/^[a-z0-9_]{1,15}$/i.test(referrerTwitter)) {
      referrerTwitter = null;
    }
    if (
      referrerTwitter &&
      twitterHandle &&
      referrerTwitter === twitterHandle
    ) {
      referrerTwitter = null;
    }

    if (!email || !EMAIL_RE.test(email) || email.length > 254) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }

    if (isDisposableEmail(email)) {
      await recordAbuseEvent("signup_blocked", ip, email, {
        reason: "disposable",
      });
      return Response.json(
        {
          error: "Use a real email (disposable addresses are blocked).",
          code: "disposable_email",
        },
        { status: 400 }
      );
    }

    const existing = await tursoExecute(
      "SELECT id FROM email_signups WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing.rows.length > 0) {
      return Response.json({ ok: true, alreadySignedUp: true });
    }

    // One privy / wallet spam
    if (privyId) {
      const p = await tursoExecute(
        "SELECT id FROM email_signups WHERE privy_id = ? LIMIT 1",
        [privyId]
      );
      if (p.rows.length > 0) {
        return Response.json({ ok: true, alreadySignedUp: true });
      }
    }

    let xFollowers: number | null = null;
    let xVerified: boolean | null = null;
    let xVerifiedType: string | null = null;
    let xAvatarUrl: string | null = null;
    let xLookupErr: string | null = null;
    if (twitterHandle) {
      try {
        const x = await fetchXUserPublic(twitterHandle);
        if (x.ok) {
          xFollowers = x.followers;
          xVerified = x.verified;
          xVerifiedType = x.verifiedType;
          xAvatarUrl =
            x.profileImageUrl ||
            `https://unavatar.io/twitter/${encodeURIComponent(twitterHandle)}`;
        } else {
          xLookupErr = x.error || "lookup failed";
          xAvatarUrl = `https://unavatar.io/twitter/${encodeURIComponent(twitterHandle)}`;
        }
      } catch (e) {
        xLookupErr = e instanceof Error ? e.message : String(e);
        xAvatarUrl = `https://unavatar.io/twitter/${encodeURIComponent(twitterHandle)}`;
      }
    }

    // If no referrer on body, try referrals table
    if (!referrerTwitter && twitterHandle) {
      try {
        const r = await tursoExecute(
          `SELECT referrer_twitter FROM referrals
           WHERE lower(referred_twitter) = lower(?) LIMIT 1`,
          [twitterHandle]
        );
        if (r.rows[0]?.[0]) {
          referrerTwitter = String(r.rows[0][0]).toLowerCase();
        }
      } catch {
        /* ignore */
      }
    }

    try {
      await tursoExecute(
        `INSERT INTO email_signups
           (email, twitter_handle, wallet_address, privy_id, source,
            x_followers, x_verified, x_verified_type, x_avatar_url, referrer_twitter)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          email,
          twitterHandle,
          walletAddress,
          privyId,
          source,
          xFollowers,
          xVerified == null ? null : xVerified ? 1 : 0,
          xVerifiedType,
          xAvatarUrl,
          referrerTwitter,
        ]
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/UNIQUE/i.test(msg)) {
        return Response.json({ ok: true, alreadySignedUp: true });
      }
      throw e;
    }

    const verifiedLine =
      xVerified == null
        ? xLookupErr
          ? `verified: ? <i>(${escapeHtml(xLookupErr.slice(0, 80))})</i>`
          : null
        : xVerified
          ? `verified: <b>yes</b>${
              xVerifiedType && xVerifiedType !== "none"
                ? ` (${escapeHtml(xVerifiedType)})`
                : ""
            }`
          : `verified: no`;

    const followersLine =
      xFollowers != null
        ? `followers: <b>${escapeHtml(fmtFollowers(xFollowers))}</b> (${escapeHtml(qualityLabel(xFollowers))})`
        : twitterHandle
          ? `followers: ?`
          : null;

    const thin =
      xFollowers != null && xFollowers < MIN_X_FOLLOWERS_CLAIM
        ? `thin account (&lt;${MIN_X_FOLLOWERS_CLAIM} flw) — claims gated`
        : null;

    const tgLines = [
      "<b>New TOKENSHIT signup</b>",
      `email: ${escapeHtml(email)}`,
      twitterHandle
        ? `x: <a href="https://x.com/${escapeHtml(twitterHandle)}">@${escapeHtml(twitterHandle)}</a>`
        : null,
      followersLine,
      thin,
      verifiedLine,
      referrerTwitter
        ? `ref: <a href="https://x.com/${escapeHtml(referrerTwitter)}">@${escapeHtml(referrerTwitter)}</a>`
        : null,
      walletAddress
        ? `wallet: <code>${escapeHtml(truncWallet(walletAddress))}</code>`
        : null,
      `ip: <code>${escapeHtml(ip)}</code>`,
      `source: ${escapeHtml(source)}`,
    ].filter(Boolean) as string[];

    const greeting = twitterHandle ? `gm @${twitterHandle}` : "gm degen";

    // Skip welcome email for obvious dust accounts (still store signup)
    const skipWelcome =
      xFollowers != null && xFollowers < 5 && source !== "claim-page";

    const [emailRes, tgRes] = await Promise.allSettled([
      skipWelcome
        ? Promise.resolve({
            id: undefined as string | undefined,
            error: undefined as string | undefined,
            mode: "inline" as const,
          })
        : sendTemplateEmail({
            to: email,
            template: "welcome",
            variables: { GREETING: greeting },
          }),
      sendTelegramMessage(tgLines.join("\n")),
    ]);

    await recordAbuseEvent("signup", ip, email, {
      twitter: twitterHandle,
      followers: xFollowers,
      source,
    });

    if (
      emailRes.status === "rejected" ||
      (emailRes.status === "fulfilled" && emailRes.value.error)
    ) {
      console.error(
        "Resend send failed:",
        emailRes.status === "rejected"
          ? emailRes.reason
          : emailRes.value.error
      );
    }
    if (
      tgRes.status === "rejected" ||
      (tgRes.status === "fulfilled" && !tgRes.value.ok)
    ) {
      console.error(
        "Telegram send failed:",
        tgRes.status === "rejected" ? tgRes.reason : tgRes.value.error
      );
    }

    const publicEvent = {
      id: Date.now(),
      handle: twitterHandle,
      followers: xFollowers,
      verified: xVerified,
      avatarUrl: xAvatarUrl,
      referrer: referrerTwitter,
      createdAt: new Date().toISOString(),
    };

    return Response.json({
      ok: true,
      event: publicEvent,
      x:
        twitterHandle && xFollowers != null
          ? {
              followers: xFollowers,
              verified: xVerified,
              verifiedType: xVerifiedType,
              avatarUrl: xAvatarUrl,
            }
          : undefined,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json({ error: "Failed to sign up" }, { status: 500 });
  }
}
