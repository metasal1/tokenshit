const TG_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TG_SIGNUP_CHAT_ID = process.env.TELEGRAM_SIGNUP_CHAT_ID || "";
/** Claims go to same chat as signups unless TELEGRAM_CLAIM_CHAT_ID is set */
const TG_CLAIM_CHAT_ID =
  process.env.TELEGRAM_CLAIM_CHAT_ID || TG_SIGNUP_CHAT_ID;

export async function sendTelegramMessage(
  text: string,
  chatId: string = TG_SIGNUP_CHAT_ID
): Promise<{ ok: boolean; error?: string }> {
  if (!TG_BOT_TOKEN || !chatId) {
    return { ok: false, error: "Telegram not configured" };
  }

  const res = await fetch(
    `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    }
  );

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
