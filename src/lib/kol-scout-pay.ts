/**
 * Pay scout 2,500 $TOKENSHIT when a KOL (≥10k flw) is accepted or set live.
 * Once per nomination id (idempotent).
 */
import { tursoExecute } from "@/lib/turso";
import {
  KOL_SCOUT_REWARD_SHIT,
  MIN_KOL_FOLLOWERS,
} from "@/lib/shit-token";
import { payFromTreasury } from "@/lib/treasury-ledger";
import type { KolNomRow } from "@/lib/kol-noms";
import { ensureKolNomSchema } from "@/lib/kol-noms";

async function ensureScoutPayCols() {
  await ensureKolNomSchema();
  for (const sql of [
    `ALTER TABLE kol_nominations ADD COLUMN scout_paid_at TEXT`,
    `ALTER TABLE kol_nominations ADD COLUMN scout_sig TEXT`,
    `ALTER TABLE kol_nominations ADD COLUMN scout_amount REAL`,
    `ALTER TABLE kol_nominations ADD COLUMN scout_wallet TEXT`,
  ]) {
    await tursoExecute(sql).catch(() => {});
  }
}

async function resolveScoutWallet(
  byX: string | null,
  byWallet: string | null
): Promise<string | null> {
  if (byWallet && byWallet.length >= 32) return byWallet;
  if (!byX) return null;
  const x = byX.replace(/^@/, "").toLowerCase();
  // latest successful claim wallet for this X
  try {
    const r = await tursoExecute(
      `SELECT wallet FROM claims
       WHERE lower(twitter) = ? AND wallet IS NOT NULL AND wallet != ''
         AND (signature IS NOT NULL AND signature != '' OR amount > 0)
       ORDER BY id DESC LIMIT 1`,
      [x]
    );
    const w = r.rows[0]?.[0];
    if (w && String(w).length >= 32) return String(w);
  } catch {
    /* table shape may vary */
  }
  try {
    const r = await tursoExecute(
      `SELECT wallet FROM claims
       WHERE lower(twitter) = ? AND wallet IS NOT NULL AND length(wallet) > 30
       ORDER BY id DESC LIMIT 1`,
      [x]
    );
    const w = r.rows[0]?.[0];
    if (w) return String(w);
  } catch {
    /* */
  }
  // day_stakes / player_clout fallback
  try {
    const r = await tursoExecute(
      `SELECT wallet FROM player_clout
       WHERE lower(twitter) = ? AND wallet IS NOT NULL AND length(wallet) > 30
       LIMIT 1`,
      [x]
    );
    const w = r.rows[0]?.[0];
    if (w) return String(w);
  } catch {
    /* */
  }
  return null;
}

export type ScoutPayResult =
  | {
      paid: true;
      amount: number;
      signature: string;
      wallet: string;
      scoutX: string;
    }
  | {
      paid: false;
      reason: string;
      amount?: number;
    };

/**
 * Call after status → accepted | live.
 * Skips if already paid, followers < 10k, no scout, no wallet.
 */
export async function payKolScoutIfEligible(
  row: KolNomRow,
  newStatus: "accepted" | "live" | "rejected" | "pending"
): Promise<ScoutPayResult> {
  if (newStatus !== "accepted" && newStatus !== "live") {
    return { paid: false, reason: "status_not_accept" };
  }
  if (process.env.CLAIMS_ENABLED === "0") {
    return { paid: false, reason: "giveaways_paused" };
  }
  await ensureScoutPayCols();

  // re-read paid flag
  const fresh = await tursoExecute(
    `SELECT scout_paid_at, scout_sig, followers, by_x, by_wallet, handle, id
     FROM kol_nominations WHERE id = ? LIMIT 1`,
    [row.id]
  );
  if (!fresh.rows[0]) return { paid: false, reason: "not_found" };
  const paidAt = fresh.rows[0][0];
  if (paidAt) {
    return {
      paid: false,
      reason: "already_paid",
      amount: KOL_SCOUT_REWARD_SHIT,
    };
  }

  const followers = Number(fresh.rows[0][2] ?? row.followers ?? 0);
  if (followers < MIN_KOL_FOLLOWERS) {
    return {
      paid: false,
      reason: `followers_${followers}_lt_${MIN_KOL_FOLLOWERS}`,
    };
  }

  const byX = (fresh.rows[0][3] ?? row.byX) as string | null;
  const byWallet = (fresh.rows[0][4] ?? row.byWallet) as string | null;
  // Don't pay system list imports — only real scouts
  if (!byX || byX === "auto-sync") {
    return { paid: false, reason: "no_scout" };
  }

  const wallet = await resolveScoutWallet(byX, byWallet);
  if (!wallet) {
    return { paid: false, reason: "no_wallet", amount: KOL_SCOUT_REWARD_SHIT };
  }

  const amount = KOL_SCOUT_REWARD_SHIT;
  const idem = `kol_scout:${row.id}`;

  try {
    const { signature } = await payFromTreasury({
      kind: "kol_scout",
      recipient: wallet,
      amount,
      twitter: byX,
      idempotencyKey: idem,
      meta: {
        kol: row.handle,
        nomId: row.id,
        followers,
        status: newStatus,
      },
    });
    await tursoExecute(
      `UPDATE kol_nominations
       SET scout_paid_at = datetime('now'),
           scout_sig = ?,
           scout_amount = ?,
           scout_wallet = ?
       WHERE id = ? AND scout_paid_at IS NULL`,
      [signature, amount, wallet, row.id]
    );
    return {
      paid: true,
      amount,
      signature,
      wallet,
      scoutX: byX,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // idempotent race — already sent
    if (/idempotency|already|duplicate/i.test(msg)) {
      return { paid: false, reason: `ledger:${msg.slice(0, 80)}` };
    }
    console.error("payKolScoutIfEligible", row.id, msg);
    return { paid: false, reason: msg.slice(0, 160) };
  }
}
