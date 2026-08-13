/**
 * Mandatory treasury payout ledger.
 * Every send MUST go through reservePayout → send → finalizePayout.
 * Caps + blacklist + kill switch live here so claim/referral can't bypass.
 */
import { tursoExecute } from "@/lib/turso";
import {
  isBlacklistedWallet,
  maxSinglePayoutWhole,
  treasurySendsAllowed,
} from "@/lib/security";

export type PayoutKind =
  | "x_verified"
  | "x_premium"
  | "gh_fork"
  | "x_tweet"
  | "x_follow"
  | "email_list"
  | "referral"
  | "day_hit"
  | "day_shit"
  | "manual"
  | "other";

const DAY_BUDGET = Number(process.env.TREASURY_DAY_BUDGET || 250_000);
const WALLET_DAY_CAP = Number(process.env.TREASURY_WALLET_DAY_CAP || 120_000);
const WALLET_LIFE_CAP = Number(process.env.TREASURY_WALLET_LIFE_CAP || 150_000);
const IDENTITY_LIFE_CAP = Number(
  process.env.TREASURY_IDENTITY_LIFE_CAP || 150_000
);

export async function ensurePayoutLedger() {
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS treasury_payouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL,
      recipient TEXT NOT NULL,
      amount REAL NOT NULL,
      twitter TEXT,
      github TEXT,
      idempotency_key TEXT NOT NULL UNIQUE,
      signature TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      meta TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      finalized_at TEXT
    )`,
    []
  );
  await tursoExecute(
    `CREATE INDEX IF NOT EXISTS idx_payouts_recipient_day
     ON treasury_payouts(recipient, created_at)`,
    []
  ).catch(() => {});
  await tursoExecute(
    `CREATE INDEX IF NOT EXISTS idx_payouts_status
     ON treasury_payouts(status, created_at)`,
    []
  ).catch(() => {});
}

function utcDayStart(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10) + "T00:00:00";
}

async function sumPaid(where: string, args: (string | number | null)[]): Promise<number> {
  const r = await tursoExecute(
    `SELECT COALESCE(SUM(amount), 0) FROM treasury_payouts
     WHERE status IN ('sent','pending') AND ${where}`,
    args
  );
  return Number(r.rows[0]?.[0] || 0);
}

export type ReserveResult =
  | { ok: true; payoutId: number; idempotencyKey: string }
  | { ok: false; error: string; code: string; status: number };

/**
 * Reserve a payout slot (pending row). Call BEFORE chain send.
 * Rejects if caps exceeded, blacklisted, or kill-switch.
 */
export async function reservePayout(opts: {
  kind: PayoutKind;
  recipient: string;
  amount: number;
  twitter?: string | null;
  github?: string | null;
  /** Unique per logical claim e.g. claim:x_follow:wallet or ref:alice:bob */
  idempotencyKey: string;
  meta?: Record<string, unknown>;
}): Promise<ReserveResult> {
  await ensurePayoutLedger();

  const gate = treasurySendsAllowed();
  if (!gate.ok) {
    return {
      ok: false,
      error: `Treasury sends paused (${gate.reason})`,
      code: "paused",
      status: 503,
    };
  }

  const recipient = opts.recipient.trim();
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(recipient)) {
    return {
      ok: false,
      error: "Invalid recipient",
      code: "bad_wallet",
      status: 400,
    };
  }
  if (isBlacklistedWallet(recipient)) {
    return {
      ok: false,
      error: "Wallet blocked from treasury actions",
      code: "blacklisted",
      status: 403,
    };
  }

  const amount = Number(opts.amount);
  const cap = maxSinglePayoutWhole();
  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      ok: false,
      error: "Invalid amount",
      code: "bad_amount",
      status: 400,
    };
  }
  if (amount > cap) {
    return {
      ok: false,
      error: `Amount ${amount} exceeds max single payout ${cap}`,
      code: "over_single_cap",
      status: 400,
    };
  }

  const dayStart = utcDayStart();

  // Idempotent replay
  const existing = await tursoExecute(
    `SELECT id, status, signature FROM treasury_payouts
     WHERE idempotency_key = ? LIMIT 1`,
    [opts.idempotencyKey]
  );
  if (existing.rows.length) {
    const status = String(existing.rows[0][1] || "");
    if (status === "sent") {
      return {
        ok: false,
        error: "Already paid",
        code: "already_paid",
        status: 409,
      };
    }
    if (status === "pending") {
      // allow resume of same pending id
      return {
        ok: true,
        payoutId: Number(existing.rows[0][0]),
        idempotencyKey: opts.idempotencyKey,
      };
    }
  }

  const dayTotal = await sumPaid(`created_at >= ?`, [dayStart]);
  const isDayGame = opts.kind === "day_hit" || opts.kind === "day_shit";
  if (!isDayGame && dayTotal + amount > DAY_BUDGET) {
    return {
      ok: false,
      error: `Daily treasury budget hit (${DAY_BUDGET.toLocaleString()}). Try tomorrow.`,
      code: "day_budget",
      status: 429,
    };
  }

  const walletDay = await sumPaid(
    `recipient = ? AND created_at >= ?`,
    [recipient, dayStart]
  );
  if (!isDayGame && walletDay + amount > WALLET_DAY_CAP) {
    return {
      ok: false,
      error: `Wallet daily cap (${WALLET_DAY_CAP.toLocaleString()}) reached.`,
      code: "wallet_day_cap",
      status: 429,
    };
  }

  const walletLife = await sumPaid(`recipient = ?`, [recipient]);
  if (!isDayGame && walletLife + amount > WALLET_LIFE_CAP) {
    return {
      ok: false,
      error: `Wallet lifetime cap (${WALLET_LIFE_CAP.toLocaleString()}) reached.`,
      code: "wallet_life_cap",
      status: 429,
    };
  }

  const tw = opts.twitter?.toLowerCase().replace(/^@/, "") || null;
  const gh = opts.github?.toLowerCase().replace(/^@/, "") || null;
  if (!isDayGame && tw) {
    const idLife = await sumPaid(`lower(twitter) = lower(?)`, [tw]);
    if (idLife + amount > IDENTITY_LIFE_CAP) {
      return {
        ok: false,
        error: `X account lifetime cap (${IDENTITY_LIFE_CAP.toLocaleString()}) reached.`,
        code: "identity_life_cap",
        status: 429,
      };
    }
  }
  if (!isDayGame && gh) {
    const idLife = await sumPaid(`lower(github) = lower(?)`, [gh]);
    if (idLife + amount > IDENTITY_LIFE_CAP) {
      return {
        ok: false,
        error: `GitHub lifetime cap (${IDENTITY_LIFE_CAP.toLocaleString()}) reached.`,
        code: "identity_life_cap",
        status: 429,
      };
    }
  }

  try {
    await tursoExecute(
      `INSERT INTO treasury_payouts
         (kind, recipient, amount, twitter, github, idempotency_key, status, meta)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        opts.kind,
        recipient,
        amount,
        tw,
        gh,
        opts.idempotencyKey,
        opts.meta ? JSON.stringify(opts.meta) : null,
      ]
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/UNIQUE|unique/i.test(msg)) {
      return {
        ok: false,
        error: "Already paid or in flight",
        code: "already_paid",
        status: 409,
      };
    }
    throw e;
  }

  const row = await tursoExecute(
    `SELECT id FROM treasury_payouts WHERE idempotency_key = ? LIMIT 1`,
    [opts.idempotencyKey]
  );
  const payoutId = Number(row.rows[0]?.[0] || 0);
  if (!payoutId) {
    return {
      ok: false,
      error: "Failed to reserve payout",
      code: "reserve_failed",
      status: 500,
    };
  }

  return { ok: true, payoutId, idempotencyKey: opts.idempotencyKey };
}

export async function finalizePayout(
  payoutId: number,
  signature: string
): Promise<void> {
  await tursoExecute(
    `UPDATE treasury_payouts
     SET status = 'sent', signature = ?, finalized_at = datetime('now')
     WHERE id = ? AND status = 'pending'`,
    [signature, payoutId]
  );
}

export async function failPayout(
  payoutId: number,
  reason: string
): Promise<void> {
  await tursoExecute(
    `UPDATE treasury_payouts
     SET status = 'failed', meta = COALESCE(meta,'') || ?, finalized_at = datetime('now')
     WHERE id = ? AND status = 'pending'`,
    [`|fail:${reason.slice(0, 200)}`, payoutId]
  );
}

/**
 * Full path: reserve → on-chain send → finalize.
 * Use this from claim + referral instead of bare sendShitFromTreasury.
 */
export async function payFromTreasury(opts: {
  kind: PayoutKind;
  recipient: string;
  amount: number;
  twitter?: string | null;
  github?: string | null;
  idempotencyKey: string;
  meta?: Record<string, unknown>;
}): Promise<{ signature: string; amount: number; payoutId: number }> {
  const reserved = await reservePayout(opts);
  if (!reserved.ok) {
    const err = new Error(reserved.error) as Error & {
      code?: string;
      status?: number;
    };
    err.code = reserved.code;
    err.status = reserved.status;
    throw err;
  }

  try {
    const { sendShitFromTreasury } = await import("@/lib/treasury");
    const { signature, amount } = await sendShitFromTreasury(
      opts.recipient,
      opts.amount
    );
    await finalizePayout(reserved.payoutId, signature);
    return { signature, amount, payoutId: reserved.payoutId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await failPayout(reserved.payoutId, msg).catch(() => {});
    throw e;
  }
}
