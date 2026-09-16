import { type NextRequest } from "next/server";
import { tursoExecute } from "@/lib/turso";
import { setAudienceUnsubscribed } from "@/lib/resend";
import { getClientIp, recordAbuseEvent } from "@/lib/abuse";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function ensureUnsubSchema() {
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
  for (const col of [
    "ALTER TABLE email_signups ADD COLUMN unsubscribed INTEGER",
    "ALTER TABLE email_signups ADD COLUMN unsubscribed_at TEXT",
  ]) {
    try {
      await tursoExecute(col, []);
    } catch {
      /* exists */
    }
  }
}

function readEmail(request: NextRequest, body: Record<string, unknown>): string {
  const q = request.nextUrl.searchParams.get("email") || "";
  const b = body.email != null ? String(body.email) : "";
  return (b || q).trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const ctype = request.headers.get("content-type") || "";
    let body: Record<string, unknown> = {};
    if (ctype.includes("application/json")) {
      body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    }
    const email = readEmail(request, body);
    if (!email || !EMAIL_RE.test(email) || email.length > 254) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }

    await ensureUnsubSchema();
    await tursoExecute(
      `UPDATE email_signups
       SET unsubscribed = 1, unsubscribed_at = datetime('now')
       WHERE email = ?`,
      [email]
    );
    const audience = await setAudienceUnsubscribed(email);
    await recordAbuseEvent("unsubscribe", ip, email, {
      audience_ok: audience.ok,
    }).catch(() => {});

    return Response.json({ ok: true, unsubscribed: true });
  } catch (e) {
    return Response.json(
      { error: String(e), code: "unsub_fail" },
      { status: 500 }
    );
  }
}
