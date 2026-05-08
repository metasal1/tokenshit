const TG_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TG_SIGNUP_CHAT_ID = process.env.TELEGRAM_SIGNUP_CHAT_ID || "";

export async function sendTelegramMessage(
  text: string,
  chatId: string = TG_SIGNUP_CHAT_ID
): Promise<{ ok: boolean; error?: string }> {
  if (!TG_BOT_TOKEN || !chatId) {
    return { ok: false, error: "Telegram not configured" };
  }

  const res = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, error: `TG ${res.status}: ${body}` };
  }
  return { ok: true };
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
