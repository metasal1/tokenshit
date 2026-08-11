import { type NextRequest } from "next/server";
import { tursoExecute } from "@/lib/turso";
import { REFERRAL_REWARD_SHIT } from "@/lib/shit-token";
import { sendShitFromTreasury } from "@/lib/treasury";

export const dynamic = "force-dynamic";

/**
 * POST /api/referral/claim-rewards
 * Body: { twitter, wallet }
 *
 * SECURITY (2026-08):
 * - Disabled by default (REFERRAL_PAYOUTS_ENABLED=1 to re-open).
 * - Insert reward row BEFORE send (UNIQUE referred_twitter) to stop double-pay races.
 * - Never trust unauthenticated mass claims.
 */
export async function POST(request: NextRequest) {
  try {
    if (process.env.REFERRAL_PAYOUTS_ENABLED !== "1") {
      return Response.json(
        {
          ok: false,
          error:
            "Referral payouts paused after treasury drain. Tracking still works.",
          paid: 0,
          amount: 0,
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const twitter = String(body.twitter || "")
      .toLowerCase()
      .replace(/^@/, "")
      .trim();
    const wallet = String(body.wallet || "").trim();
    if (!twitter || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) {
      return Response.json(
        { error: "twitter + valid wallet required" },
        { status: 400 }
      );
    }

    await tursoExecute(
      `CREATE TABLE IF NOT EXISTS referral_rewards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        referrer_twitter TEXT NOT NULL,
        referred_twitter TEXT NOT NULL,
        wallet TEXT NOT NULL,
        amount REAL NOT NULL,
        signature TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(referred_twitter)
      )`,
      []
    );

    // Unpaid referrals
    const unpaid = await tursoExecute(
      `SELECT referred_twitter FROM referrals r
       WHERE lower(r.referrer_twitter) = ?
       AND NOT EXISTS (
         SELECT 1 FROM referral_rewards rr
         WHERE lower(rr.referred_twitter) = lower(r.referred_twitter)
       )
       LIMIT 5`,
      [twitter]
    );

    if (unpaid.rows.length === 0) {
      return Response.json({
        ok: true,
        paid: 0,
        amount: 0,
        message: "No unpaid referrals",
      });
    }

    const paid: { referred: string; signature: string; amount: number }[] = [];
    const errors: string[] = [];

    for (const row of unpaid.rows) {
      const referred = String(row[0]);
      try {
        // Reserve row first — UNIQUE blocks concurrent double-pay
        const reserved = await tursoExecute(
          `INSERT OR IGNORE INTO referral_rewards
             (referrer_twitter, referred_twitter, wallet, amount, signature)
           VALUES (?, ?, ?, ?, ?)`,
          [twitter, referred, wallet, REFERRAL_REWARD_SHIT, "pending"]
        );
        // If ignore fired, changes=0
        if ((reserved as { rowsAffected?: number }).rowsAffected === 0) {
          continue;
        }

        const { signature } = await sendShitFromTreasury(
          wallet,
          REFERRAL_REWARD_SHIT
        );
        await tursoExecute(
          `UPDATE referral_rewards SET signature = ? WHERE referred_twitter = ? AND signature = 'pending'`,
          [signature, referred]
        );
        paid.push({
          referred,
          signature,
          amount: REFERRAL_REWARD_SHIT,
        });
      } catch (e) {
        // Roll back pending reservation so a later fix can retry
        await tursoExecute(
          `DELETE FROM referral_rewards WHERE referred_twitter = ? AND signature = 'pending'`,
          [referred]
        ).catch(() => {});
        errors.push(
          `${referred}: ${e instanceof Error ? e.message : String(e)}`
        );
        break;
      }
    }

    return Response.json({
      ok: true,
      paid: paid.length,
      amount: paid.length * REFERRAL_REWARD_SHIT,
      details: paid,
      errors: errors.length ? errors : undefined,
      perReferral: REFERRAL_REWARD_SHIT,
    });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
