import { type NextRequest } from "next/server";
import {
  answerTelegramCallback,
  editTelegramMessage,
  escapeHtml,
  isTelegramKolAdmin,
  parseKolCallback,
} from "@/lib/telegram";
import { setKolNominationStatus } from "@/lib/kol-noms";
import { prewarmKolOg } from "@/lib/kol-sync";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Telegram bot webhook — KOL approve/reject callbacks.
 *
 * setWebhook:
 *   url=https://tokenshit.com/api/telegram/webhook
 *   secret_token=$TELEGRAM_WEBHOOK_SECRET
 *   allowed_updates=["callback_query"]
 */
function authorized(req: NextRequest): boolean {
  const secret = (process.env.TELEGRAM_WEBHOOK_SECRET || "").trim();
  if (!secret) {
    // Dev fallback only if explicitly allowed
    if (process.env.TELEGRAM_WEBHOOK_ALLOW_INSECURE === "1") return true;
    return false;
  }
  const hdr =
    req.headers.get("x-telegram-bot-api-secret-token") ||
    req.headers.get("X-Telegram-Bot-Api-Secret-Token") ||
    "";
  return hdr === secret;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let update: Record<string, unknown> = {};
  try {
    update = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: true });
  }

  const cq = update.callback_query as
    | {
        id: string;
        data?: string;
        from?: { id?: number; username?: string };
        message?: {
          message_id?: number;
          chat?: { id?: number };
        };
      }
    | undefined;

  if (!cq?.id) {
    return Response.json({ ok: true });
  }

  const parsed = parseKolCallback(cq.data || "");
  if (!parsed) {
    await answerTelegramCallback(cq.id, "Unknown button");
    return Response.json({ ok: true });
  }

  if (!isTelegramKolAdmin(cq.from?.id)) {
    await answerTelegramCallback(cq.id, "Not authorized", true);
    return Response.json({ ok: true });
  }

  const result = await setKolNominationStatus(parsed.id, parsed.action);
  if (!result.ok || !result.row) {
    await answerTelegramCallback(
      cq.id,
      result.error || "Update failed",
      true
    );
    return Response.json({ ok: true });
  }

  const row = result.row;
  const who = cq.from?.username
    ? `@${cq.from.username}`
    : `id:${cq.from?.id || "?"}`;
  const statusEmoji =
    parsed.action === "rejected"
      ? "❌ rejected"
      : parsed.action === "live"
        ? "🟢 live"
        : "✅ approved";

  await answerTelegramCallback(cq.id, `${statusEmoji} @${row.handle}`);

  const chatId = cq.message?.chat?.id;
  const msgId = cq.message?.message_id;
  if (chatId != null && msgId != null) {
    const h = row.handle;
    const text = [
      `<b>KOL nomination</b> · ${statusEmoji}`,
      `→ <a href="https://x.com/${escapeHtml(h)}">@${escapeHtml(h)}</a>`,
      row.followers != null
        ? `followers: <b>${Number(row.followers).toLocaleString()}</b>`
        : "",
      `by moderator ${escapeHtml(who)}`,
      `id <code>${row.id}</code>`,
      `<a href="https://tokenshit.com/kols/${encodeURIComponent(h)}">card</a> · <a href="https://tokenshit.com/admin?tab=kols">admin</a>`,
    ]
      .filter(Boolean)
      .join("\n");
    await editTelegramMessage(chatId, msgId, text, { replyMarkup: null });
  }

  if (parsed.action === "accepted" || parsed.action === "live") {
    void prewarmKolOg(row.handle).catch(() => {});
  }

  return Response.json({ ok: true });
}

export async function GET() {
  return Response.json({
    ok: true,
    service: "telegram-webhook",
    expects: "POST callback_query kol:a|l|r:{id}",
  });
}
