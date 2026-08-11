import { type NextRequest } from "next/server";
import { tursoExecute } from "@/lib/turso";
import { REFERRAL_REWARD_SHIT } from "@/lib/shit-token";
import { sendShitFromTreasury } from "@/lib/treasury";

export const dynamic = "force-dynamic";

/**
 * POST /api/referral/claim-rewards
 * Body: { twitter, wallet }
 * Pays REFERRAL_REWARD_SHIT per unpaid referral for this twitter handle.
 */
export async function POST(request: NextRequest) {
  try {
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
         WHERE rr.referred_twitter = r.referred_twitter
       )
       LIMIT 20`,
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
        const { signature } = await sendShitFromTreasury(
          wallet,
          REFERRAL_REWARD_SHIT
        );
        await tursoExecute(
          `INSERT INTO referral_rewards (referrer_twitter, referred_twitter, wallet, amount, signature)
           VALUES (?, ?, ?, ?, ?)`,
          [twitter, referred, wallet, REFERRAL_REWARD_SHIT, signature]
        );
        paid.push({
          referred,
          signature,
          amount: REFERRAL_REWARD_SHIT,
        });
      } catch (e) {
        errors.push(
          `${referred}: ${e instanceof Error ? e.message : String(e)}`
        );
        break; // stop on first treasury fail
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
