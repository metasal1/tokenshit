import { type NextRequest } from "next/server";
import { tursoExecute } from "@/lib/turso";
import { sendTemplateEmail } from "@/lib/resend";
import { sendTelegramMessage, escapeHtml } from "@/lib/telegram";
import { fetchXUserPublic } from "@/lib/claims";

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
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    []
  );
  // Best-effort migrations for existing DBs
  for (const col of [
    "ALTER TABLE email_signups ADD COLUMN x_followers INTEGER",
    "ALTER TABLE email_signups ADD COLUMN x_verified INTEGER",
    "ALTER TABLE email_signups ADD COLUMN x_verified_type TEXT",
  ]) {
    try {
      await tursoExecute(col, []);
    } catch {
      /* already exists */
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

    if (!email || !EMAIL_RE.test(email) || email.length > 254) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }

    const existing = await tursoExecute(
      "SELECT id FROM email_signups WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing.rows.length > 0) {
      return Response.json({ ok: true, alreadySignedUp: true });
    }

    // Enrich with X metrics when handle present (1 API call)
    let xFollowers: number | null = null;
    let xVerified: boolean | null = null;
    let xVerifiedType: string | null = null;
    let xLookupErr: string | null = null;
    if (twitterHandle) {
      try {
        const x = await fetchXUserPublic(twitterHandle);
        if (x.ok) {
          xFollowers = x.followers;
          xVerified = x.verified;
          xVerifiedType = x.verifiedType;
        } else {
          xLookupErr = x.error || "lookup failed";
        }
      } catch (e) {
        xLookupErr = e instanceof Error ? e.message : String(e);
      }
    }

    try {
      await tursoExecute(
        `INSERT INTO email_signups
           (email, twitter_handle, wallet_address, privy_id, source, x_followers, x_verified, x_verified_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          email,
          twitterHandle,
          walletAddress,
          privyId,
          source,
          xFollowers,
          xVerified == null ? null : xVerified ? 1 : 0,
          xVerifiedType,
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
          ? `✅ verified: ? <i>(${escapeHtml(xLookupErr.slice(0, 80))})</i>`
          : null
        : xVerified
          ? `✅ verified: <b>yes</b>${
              xVerifiedType && xVerifiedType !== "none"
                ? ` (${escapeHtml(xVerifiedType)})`
                : ""
            }`
          : `✅ verified: no`;

    const followersLine =
      xFollowers != null
        ? `👥 followers: <b>${escapeHtml(fmtFollowers(xFollowers))}</b>`
        : twitterHandle
          ? `👥 followers: ?`
          : null;

    const tgLines = [
      "🆕 <b>New TOKENSHIT signup</b>",
      `📧 ${escapeHtml(email)}`,
      twitterHandle
        ? `🐦 <a href="https://x.com/${escapeHtml(twitterHandle)}">@${escapeHtml(twitterHandle)}</a>`
        : null,
      followersLine,
      verifiedLine,
      walletAddress
        ? `💰 <code>${escapeHtml(truncWallet(walletAddress))}</code>`
        : null,
      `📍 ${escapeHtml(source)}`,
    ].filter(Boolean) as string[];

    const greeting = twitterHandle ? `gm @${twitterHandle}` : "gm degen";

    const [emailRes, tgRes] = await Promise.allSettled([
      sendTemplateEmail({
        to: email,
        template: "welcome",
        variables: { GREETING: greeting },
      }),
      sendTelegramMessage(tgLines.join("\n")),
    ]);

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

    return Response.json({
      ok: true,
      x:
        twitterHandle && xFollowers != null
          ? { followers: xFollowers, verified: xVerified, verifiedType: xVerifiedType }
          : undefined,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json({ error: "Failed to sign up" }, { status: 500 });
  }
}
