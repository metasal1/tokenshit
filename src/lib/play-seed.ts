/**
 * House spark → play pot.
 * Smooth hourly seed (~3,750 SHIT) capped at 90k/day (~$2.4).
 * Credits hit_pot/shit_pot 50/50 so settle math includes the bag.
 */
import { tursoExecute } from "@/lib/turso";
import {
  PLAY_POT_ADDRESS,
  PLAY_SEED_DAY_CAP,
  PLAY_SEED_ENABLED,
  PLAY_SEED_FLOOR,
  PLAY_SEED_HOUR_AMOUNT,
} from "@/lib/shit-token";
import { ensureDayGameSchema, ensureRound, getRound, utcHourString } from "@/lib/day-game";

export type SeedResult = {
  ok: boolean;
  hour: string;
  amount: number;
  signature?: string;
  reason?: string;
  hitPot?: number;
  shitPot?: number;
  skipped?: boolean;
};

let schemaReady = false;

async function ensurePlaySeedSchema() {
  if (schemaReady) return;
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS play_seeds (
      utc_hour TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      signature TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      hit_credit REAL NOT NULL DEFAULT 0,
      shit_credit REAL NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`
  );
  schemaReady = true;
}

function utcDayFromHour(hour: string): string {
  // hour like 2026-08-19T14
  return hour.slice(0, 10);
}

async function daySeededTotal(utcDay: string): Promise<number> {
  const r = await tursoExecute(
    `SELECT COALESCE(SUM(amount), 0) FROM play_seeds
     WHERE status = 'sent' AND utc_hour LIKE ?`,
    [`${utcDay}%`]
  );
  return Number(r.rows[0]?.[0] || 0);
}

/**
 * Seed current (or given) UTC hour pot if under floor and under day cap.
 * Idempotent per utc_hour.
 */
export async function seedPlayHour(
  hour?: string
): Promise<SeedResult> {
  const utcHour = hour || utcHourString();
  await ensurePlaySeedSchema();
  await ensureDayGameSchema();

  if (!PLAY_SEED_ENABLED) {
    return { ok: true, hour: utcHour, amount: 0, skipped: true, reason: "disabled" };
  }

  const amountCfg = Math.floor(PLAY_SEED_HOUR_AMOUNT);
  const floor = Math.floor(PLAY_SEED_FLOOR);
  const dayCap = Math.floor(PLAY_SEED_DAY_CAP);
  if (!(amountCfg > 0)) {
    return { ok: true, hour: utcHour, amount: 0, skipped: true, reason: "amount_zero" };
  }

  // already seeded this hour?
  const prev = await tursoExecute(
    `SELECT amount, signature, status FROM play_seeds WHERE utc_hour = ? LIMIT 1`,
    [utcHour]
  );
  if (prev.rows[0]) {
    const st = String(prev.rows[0][2] || "");
    if (st === "sent") {
      return {
        ok: true,
        hour: utcHour,
        amount: Number(prev.rows[0][0] || 0),
        signature: prev.rows[0][1] ? String(prev.rows[0][1]) : undefined,
        skipped: true,
        reason: "already_seeded",
      };
    }
  }

  await ensureRound(utcHour);
  const round = await getRound(utcHour);
  if (!round) {
    return { ok: false, hour: utcHour, amount: 0, reason: "no_round" };
  }

  const potNow = Number(round.hitPot || 0) + Number(round.shitPot || 0);
  if (potNow >= floor) {
    return {
      ok: true,
      hour: utcHour,
      amount: 0,
      skipped: true,
      reason: `pot_above_floor:${potNow}`,
      hitPot: round.hitPot,
      shitPot: round.shitPot,
    };
  }

  let need = Math.min(amountCfg, Math.max(0, floor - potNow));
  // if floor == amount, need = amount when pot 0
  if (need <= 0) {
    return { ok: true, hour: utcHour, amount: 0, skipped: true, reason: "need_zero" };
  }

  const day = utcDayFromHour(utcHour);
  const spent = await daySeededTotal(day);
  const remaining = Math.max(0, dayCap - spent);
  if (remaining <= 0) {
    return {
      ok: true,
      hour: utcHour,
      amount: 0,
      skipped: true,
      reason: `day_cap:${spent}`,
    };
  }
  need = Math.min(need, remaining);
  need = Math.floor(need);
  if (need < 1) {
    return { ok: true, hour: utcHour, amount: 0, skipped: true, reason: "need_lt_1" };
  }

  const hitCredit = Math.floor(need / 2);
  const shitCredit = need - hitCredit;

  // reserve row
  await tursoExecute(
    `INSERT INTO play_seeds (utc_hour, amount, status, hit_credit, shit_credit)
     VALUES (?, ?, 'pending', ?, ?)
     ON CONFLICT(utc_hour) DO UPDATE SET
       amount = excluded.amount,
       status = 'pending',
       hit_credit = excluded.hit_credit,
       shit_credit = excluded.shit_credit
     WHERE play_seeds.status != 'sent'`,
    [utcHour, need, hitCredit, shitCredit]
  );

  try {
    const { sendShitFromTreasury } = await import("@/lib/treasury");
    const { signature, amount } = await sendShitFromTreasury(
      PLAY_POT_ADDRESS,
      need,
      { memo: `tokenshit.com/play seed ${utcHour}` }
    );

    // credit DB pots so settle includes seed
    await tursoExecute(
      `UPDATE day_rounds
       SET hit_pot = COALESCE(hit_pot, 0) + ?,
           shit_pot = COALESCE(shit_pot, 0) + ?
       WHERE utc_day = ?`,
      [hitCredit, shitCredit, utcHour]
    );

    await tursoExecute(
      `UPDATE play_seeds
       SET status = 'sent', signature = ?, amount = ?
       WHERE utc_hour = ?`,
      [signature, amount, utcHour]
    );

    try {
      const { ensurePayoutLedger } = await import("@/lib/treasury-ledger");
      await ensurePayoutLedger();
      await tursoExecute(
        `INSERT OR IGNORE INTO treasury_payouts
           (kind, recipient, amount, twitter, idempotency_key, signature, status, meta, finalized_at)
         VALUES ('play_seed', ?, ?, NULL, ?, ?, 'sent', ?, datetime('now'))`,
        [
          PLAY_POT_ADDRESS,
          amount,
          `play_seed:${utcHour}`,
          signature,
          JSON.stringify({ utcHour, hitCredit, shitCredit }),
        ]
      );
    } catch {
      /* ledger optional */
    }

    const after = await getRound(utcHour);
    return {
      ok: true,
      hour: utcHour,
      amount,
      signature,
      hitPot: after?.hitPot,
      shitPot: after?.shitPot,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await tursoExecute(
      `UPDATE play_seeds SET status = 'failed' WHERE utc_hour = ? AND status = 'pending'`,
      [utcHour]
    ).catch(() => {});
    console.error("seedPlayHour", utcHour, msg);
    return { ok: false, hour: utcHour, amount: 0, reason: msg.slice(0, 200) };
  }
}

export async function getHourSeed(utcHour: string): Promise<{
  amount: number;
  signature: string | null;
  status: string | null;
}> {
  await ensurePlaySeedSchema();
  const r = await tursoExecute(
    `SELECT amount, signature, status FROM play_seeds WHERE utc_hour = ? LIMIT 1`,
    [utcHour]
  );
  if (!r.rows[0]) return { amount: 0, signature: null, status: null };
  return {
    amount: Number(r.rows[0][0] || 0),
    signature: r.rows[0][1] != null ? String(r.rows[0][1]) : null,
    status: r.rows[0][2] != null ? String(r.rows[0][2]) : null,
  };
}
