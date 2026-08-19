import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function authorized(req: NextRequest): boolean {
  const secret =
    process.env.CRON_SECRET ||
    process.env.HERMES_CRON_SECRET ||
    "";
  if (!secret) return false;
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : "";
  const header = req.headers.get("x-cron-secret") || "";
  return bearer === secret || header === secret;
}

/** POST — register Telegram webhook for KOL callbacks */
export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const token = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
  const secret = (process.env.TELEGRAM_WEBHOOK_SECRET || "").trim();
  if (!token) {
    return Response.json({ error: "TELEGRAM_BOT_TOKEN missing" }, { status: 503 });
  }
  if (!secret) {
    return Response.json(
      { error: "TELEGRAM_WEBHOOK_SECRET missing on worker" },
      { status: 503 }
    );
  }
  const url = "https://tokenshit.com/api/telegram/webhook";
  const res = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        secret_token: secret,
        allowed_updates: ["callback_query"],
        drop_pending_updates: false,
      }),
    }
  );
  const data = await res.json().catch(() => ({}));
  // also getWebhookInfo
  const infoRes = await fetch(
    `https://api.telegram.org/bot${token}/getWebhookInfo`
  );
  const info = await infoRes.json().catch(() => ({}));
  return Response.json({
    ok: !!(data as { ok?: boolean }).ok,
    setWebhook: data,
    webhookInfo: info,
  });
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const token = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
  if (!token) {
    return Response.json({ error: "no bot token" }, { status: 503 });
  }
  const infoRes = await fetch(
    `https://api.telegram.org/bot${token}/getWebhookInfo`
  );
  const info = await infoRes.json().catch(() => ({}));
  return Response.json({ webhookInfo: info });
}
