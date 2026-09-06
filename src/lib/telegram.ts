const TG_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TG_SIGNUP_CHAT_ID = process.env.TELEGRAM_SIGNUP_CHAT_ID || "";
/** Claims go to same chat as signups unless TELEGRAM_CLAIM_CHAT_ID is set */
const TG_CLAIM_CHAT_ID =
  process.env.TELEGRAM_CLAIM_CHAT_ID || TG_SIGNUP_CHAT_ID;

/** KOL review chat — defaults to signup chat (GROK) */
const TG_KOL_CHAT_ID =
  process.env.TELEGRAM_KOL_CHAT_ID ||
  process.env.TELEGRAM_SIGNUP_CHAT_ID ||
  "";
/** Optional forum topic (TOKENSHIT = 1430) */
const TG_KOL_THREAD_ID = process.env.TELEGRAM_KOL_THREAD_ID
  ? Number(process.env.TELEGRAM_KOL_THREAD_ID)
  : process.env.TELEGRAM_TOPIC_TOKENSHIT
    ? Number(process.env.TELEGRAM_TOPIC_TOKENSHIT)
    : 1430;

export type TgInlineButton = {
  text: string;
  callback_data?: string;
  url?: string;
};

export async function sendTelegramMessage(
  text: string,
  chatId: string = TG_SIGNUP_CHAT_ID,
  opts?: {
    threadId?: number | null;
    replyMarkup?: { inline_keyboard: TgInlineButton[][] };
    disablePreview?: boolean;
  }
): Promise<{ ok: boolean; error?: string; messageId?: number }> {
  if (!TG_BOT_TOKEN || !chatId) {
    return { ok: false, error: "Telegram not configured" };
  }

  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: opts?.disablePreview !== false,
  };
  if (opts?.threadId != null && Number.isFinite(opts.threadId)) {
    body.message_thread_id = opts.threadId;
  }
  if (opts?.replyMarkup) {
    body.reply_markup = opts.replyMarkup;
  }

  const res = await fetch(
    `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    return { ok: false, error: `TG ${res.status}: ${errBody}` };
  }
  const data = (await res.json().catch(() => null)) as {
    result?: { message_id?: number };
  } | null;
  return { ok: true, messageId: data?.result?.message_id };
}

export async function answerTelegramCallback(
  callbackQueryId: string,
  text?: string,
  showAlert = false
): Promise<void> {
  if (!TG_BOT_TOKEN || !callbackQueryId) return;
  await fetch(
    `https://api.telegram.org/bot${TG_BOT_TOKEN}/answerCallbackQuery`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text?.slice(0, 200),
        show_alert: showAlert,
      }),
    }
  ).catch(() => {});
}

export async function editTelegramMessage(
  chatId: string | number,
  messageId: number,
  text: string,
  opts?: { replyMarkup?: { inline_keyboard: TgInlineButton[][] } | null }
): Promise<{ ok: boolean; error?: string }> {
  if (!TG_BOT_TOKEN) return { ok: false, error: "no bot" };
  const body: Record<string, unknown> = {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };
  if (opts && "replyMarkup" in opts) {
    body.reply_markup =
      opts.replyMarkup === null
        ? { inline_keyboard: [] }
        : opts.replyMarkup;
  }
  const res = await fetch(
    `https://api.telegram.org/bot${TG_BOT_TOKEN}/editMessageText`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    return { ok: false, error: `TG edit ${res.status}: ${errBody}` };
  }
  return { ok: true };
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function shortWallet(w: string): string {
  if (!w || w.length < 10) return w || "—";
  return `${w.slice(0, 4)}…${w.slice(-4)}`;
}

const KIND_LABEL: Record<string, string> = {
  x_verified: "X verified",
  x_premium: "X Premium",
  gh_fork: "GitHub fork",
  x_tweet: "Tweet tag",
  x_follow: "Follow",
  x_like: "Like",
  x_retweet: "Retweet",
  pumpfast: "PumpFast upvote",
  referral: "Referral",
};

/** Fire-and-forget TG ping on successful treasury claim */
export async function notifyClaimTelegram(opts: {
  kind: string;
  amount: number;
  twitter?: string | null;
  github?: string | null;
  wallet: string;
  signature: string;
  followers?: number | null;
  ip?: string | null;
}): Promise<void> {
  try {
    const label = KIND_LABEL[opts.kind] || opts.kind;
    const lines = [
      `<b>TOKENSHIT claim</b>`,
      `kind: <b>${escapeHtml(label)}</b> (<code>${escapeHtml(opts.kind)}</code>)`,
      `amount: <b>${opts.amount.toLocaleString()}</b> $TOKENSHIT`,
    ];
    if (opts.twitter) {
      lines.push(
        `x: <a href="https://x.com/${escapeHtml(opts.twitter)}">@${escapeHtml(opts.twitter)}</a>`
      );
    }
    if (opts.github) {
      lines.push(
        `gh: <a href="https://github.com/${escapeHtml(opts.github)}">${escapeHtml(opts.github)}</a>`
      );
    }
    if (opts.followers != null) {
      lines.push(`followers: <b>${opts.followers.toLocaleString()}</b>`);
    }
    lines.push(`wallet: <code>${escapeHtml(shortWallet(opts.wallet))}</code>`);
    lines.push(
      `tx: <a href="https://solscan.io/tx/${escapeHtml(opts.signature)}">${escapeHtml(opts.signature.slice(0, 12))}…</a>`
    );
    if (opts.ip) lines.push(`ip: <code>${escapeHtml(opts.ip)}</code>`);

    const r = await sendTelegramMessage(lines.join("\n"), TG_CLAIM_CHAT_ID);
    if (!r.ok) console.error("notifyClaimTelegram", r.error);
  } catch (e) {
    console.error("notifyClaimTelegram", e);
  }
}

export async function notifyReferralPayoutTelegram(opts: {
  referrer: string;
  paid: number;
  amount: number;
  wallet: string;
  details?: { referred: string; signature: string; amount: number }[];
}): Promise<void> {
  try {
    const lines = [
      `<b>TOKENSHIT referral payout</b>`,
      `referrer: <a href="https://x.com/${escapeHtml(opts.referrer)}">@${escapeHtml(opts.referrer)}</a>`,
      `paid: <b>${opts.paid}</b> × → <b>${opts.amount.toLocaleString()}</b> $TOKENSHIT`,
      `wallet: <code>${escapeHtml(shortWallet(opts.wallet))}</code>`,
    ];
    for (const d of (opts.details || []).slice(0, 8)) {
      lines.push(
        `· @${escapeHtml(d.referred)} +${d.amount.toLocaleString()} <a href="https://solscan.io/tx/${escapeHtml(d.signature)}">tx</a>`
      );
    }
    const r = await sendTelegramMessage(lines.join("\n"), TG_CLAIM_CHAT_ID);
    if (!r.ok) console.error("notifyReferralPayoutTelegram", r.error);
  } catch (e) {
    console.error("notifyReferralPayoutTelegram", e);
  }
}

/**
 * KOL nomination review — Approve / Live / Reject inline buttons.
 * Callback data: kol:a:{id} | kol:l:{id} | kol:r:{id}
 */
export async function notifyKolNominationTelegram(opts: {
  id: number;
  handle: string;
  followers: number;
  displayName?: string | null;
  byX: string;
  note?: string | null;
  avatarUrl?: string | null;
}): Promise<void> {
  try {
    const h = opts.handle.replace(/^@/, "");
    const card = `https://tokenshit.com/kols/${encodeURIComponent(h)}`;
    const x = `https://x.com/${encodeURIComponent(h)}`;
    const lines = [
      `<b>KOL nomination</b> · pending`,
      `→ <a href="${x}">@${escapeHtml(h)}</a> · <b>${opts.followers.toLocaleString()}</b> flw`,
    ];
    if (opts.displayName) {
      lines.push(`name: ${escapeHtml(opts.displayName.slice(0, 48))}`);
    }
    lines.push(`by @${escapeHtml(opts.byX.replace(/^@/, ""))}`);
    if (opts.note) {
      lines.push(`note: ${escapeHtml(opts.note.slice(0, 120))}`);
    }
    lines.push(
      `card: <a href="${card}">/kols/${escapeHtml(h)}</a>`,
      `id <code>${opts.id}</code>`
    );

    const id = opts.id;
    const r = await sendTelegramMessage(lines.join("\n"), TG_KOL_CHAT_ID, {
      threadId: Number.isFinite(TG_KOL_THREAD_ID) ? TG_KOL_THREAD_ID : null,
      replyMarkup: {
        inline_keyboard: [
          [
            { text: "✅ Approve", callback_data: `kol:a:${id}` },
            { text: "🟢 Live", callback_data: `kol:l:${id}` },
            { text: "❌ Reject", callback_data: `kol:r:${id}` },
          ],
          [
            { text: "Open card", url: card },
            {
              text: "Admin",
              url: "https://tokenshit.com/admin?tab=kols",
            },
          ],
        ],
      },
    });
    if (!r.ok) console.error("notifyKolNominationTelegram", r.error);
  } catch (e) {
    console.error("notifyKolNominationTelegram", e);
  }
}

/** Parse callback_data kol:{a|l|r}:{id} */
export function parseKolCallback(
  data: string
): { action: "accepted" | "live" | "rejected"; id: number } | null {
  const m = /^kol:([alr]):(\d+)$/.exec((data || "").trim());
  if (!m) return null;
  const map = {
    a: "accepted" as const,
    l: "live" as const,
    r: "rejected" as const,
  };
  const action = map[m[1] as "a" | "l" | "r"];
  const id = Number(m[2]);
  if (!action || !Number.isFinite(id) || id <= 0) return null;
  return { action, id };
}

export function isTelegramKolAdmin(userId: number | string | undefined): boolean {
  const raw =
    process.env.TELEGRAM_KOL_ADMIN_IDS ||
    process.env.TELEGRAM_ADMIN_IDS ||
    "";
  // If unset, allow any user in the configured chat (forum is private enough)
  if (!raw.trim()) return true;
  const allow = new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
  return allow.has(String(userId || ""));
}

export function kolChatId(): string {
  return TG_KOL_CHAT_ID;
}
