import { type NextRequest } from "next/server";
import { tursoExecute } from "@/lib/turso";
import { sendEmail, welcomeEmail } from "@/lib/resend";
import { sendTelegramMessage, escapeHtml } from "@/lib/telegram";

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
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    []
  );
}

function truncWallet(addr?: string | null): string {
  if (!addr) return "";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export async function POST(request: NextRequest) {
  try {
    await ensureSignupSchema();
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    const twitterHandle = body.twitterHandle
      ? String(body.twitterHandle).toLowerCase()
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

    try {
      await tursoExecute(
        `INSERT INTO email_signups (email, twitter_handle, wallet_address, privy_id, source)
         VALUES (?, ?, ?, ?, ?)`,
        [email, twitterHandle, walletAddress, privyId, source]
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/UNIQUE/i.test(msg)) {
        return Response.json({ ok: true, alreadySignedUp: true });
      }
      throw e;
    }

    const tgLines = [
      "🆕 <b>New TOKENSHIT signup</b>",
      `📧 ${escapeHtml(email)}`,
      twitterHandle
        ? `🐦 <a href="https://x.com/${escapeHtml(twitterHandle)}">@${escapeHtml(twitterHandle)}</a>`
        : null,
      walletAddress
        ? `💰 <code>${escapeHtml(truncWallet(walletAddress))}</code>`
        : null,
      `📍 ${escapeHtml(source)}`,
    ].filter(Boolean) as string[];

    const welcome = welcomeEmail(twitterHandle);

    const [emailRes, tgRes] = await Promise.allSettled([
      sendEmail({
        to: email,
        subject: welcome.subject,
        html: welcome.html,
        text: welcome.text,
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

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json({ error: "Failed to sign up" }, { status: 500 });
  }
}
