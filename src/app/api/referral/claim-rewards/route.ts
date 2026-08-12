import { type NextRequest } from "next/server";
import { tursoExecute } from "@/lib/turso";
import { REFERRAL_REWARD_SHIT } from "@/lib/shit-token";
import { payFromTreasury } from "@/lib/treasury-ledger";
import { requirePrivy } from "@/lib/privy-server";
import { assertNotBlacklisted } from "@/lib/security";
import {
  getClientIp,
  gateClaimIp,
  gateReferredForPayout,
  recordAbuseEvent,
} from "@/lib/abuse";

export const dynamic = "force-dynamic";

/**
 * POST /api/referral/claim-rewards
 * Body: { twitter, wallet }
 * Auth: Privy Bearer — twitter must match linked X.
 * Re-enabled only with auth; still opt-in via REFERRAL_PAYOUTS_ENABLED=1
 * OR default on when PRIVY_APP_SECRET is set (real identity checks).
 */
export async function POST(request: NextRequest) {
  try {
    const ipGate = await gateClaimIp(getClientIp(request));
    if (!ipGate.ok) {
      return Response.json(
        { error: ipGate.error, code: ipGate.code },
        { status: ipGate.status }
      );
    }

    const secretOk = Boolean(process.env.PRIVY_APP_SECRET);
    const flagOn = process.env.REFERRAL_PAYOUTS_ENABLED === "1";
    const flagOff = process.env.REFERRAL_PAYOUTS_ENABLED === "0";
    if (flagOff || (!flagOn && !secretOk)) {
      return Response.json(
        {
          ok: false,
          error:
            "Referral payouts paused. Set PRIVY_APP_SECRET + REFERRAL_PAYOUTS_ENABLED=1 to reopen.",
          paid: 0,
          amount: 0,
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    let twitter = String(body.twitter || "")
      .toLowerCase()
      .replace(/^@/, "")
      .trim();
    const wallet = String(body.wallet || "").trim();

    // Auth first — never leak payout state unauthenticated
    const auth = await requirePrivy(request, {
      twitter: twitter || null,
      wallet: wallet || null,
      requireTwitter: true,
      body: body as Record<string, unknown>,
    });
    if (!auth.ok) return auth.res;
    if (auth.id.twitter) twitter = auth.id.twitter;

    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) {
      return Response.json({ error: "valid wallet required" }, { status: 400 });
    }

    const blocked = assertNotBlacklisted(wallet);
    if (blocked) return blocked;

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

    // Clear stuck pending rows (failed mid-send / worker timeout)
    await tursoExecute(
      `DELETE FROM referral_rewards
       WHERE signature = 'pending'
         AND created_at < datetime('now', '-10 minutes')`,
      []
    ).catch(() => {});

    const unpaid = await tursoExecute(
      `SELECT referred_twitter FROM referrals r
       WHERE lower(r.referrer_twitter) = lower(?)
       AND NOT EXISTS (
         SELECT 1 FROM referral_rewards rr
         WHERE lower(rr.referred_twitter) = lower(r.referred_twitter)
           AND rr.signature IS NOT NULL
           AND rr.signature != ''
           AND rr.signature != 'pending'
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
        const q = await gateReferredForPayout(referred);
        if (!q.ok) {
          errors.push(q.error || q.code || "skipped");
          await recordAbuseEvent("ref_skip", getClientIp(request), referred, {
            reason: q.code,
            followers: q.followers,
            referrer: twitter,
          });
          continue;
        }

        const reserved = await tursoExecute(
          `INSERT OR IGNORE INTO referral_rewards
             (referrer_twitter, referred_twitter, wallet, amount, signature)
           VALUES (?, ?, ?, ?, ?)`,
          [twitter, referred, wallet, REFERRAL_REWARD_SHIT, "pending"]
        );
        // Turso HTTP may not surface rowsAffected — check pending row exists
        const check = await tursoExecute(
          `SELECT signature FROM referral_rewards
           WHERE lower(referred_twitter) = lower(?) LIMIT 1`,
          [referred]
        );
        const sig0 = check.rows[0]?.[0] != null ? String(check.rows[0][0]) : null;
        if (sig0 && sig0 !== "pending") {
          continue; // already paid
        }
        if (!sig0) {
          // insert ignored and no row — unique race
          continue;
        }

        const { signature } = await payFromTreasury({
          kind: "referral",
          recipient: wallet,
          amount: REFERRAL_REWARD_SHIT,
          twitter,
          idempotencyKey: `ref:${twitter}:${referred.toLowerCase()}`,
          meta: { referred },
        });
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
        await tursoExecute(
          `DELETE FROM referral_rewards WHERE referred_twitter = ? AND signature = 'pending'`,
          [referred]
        ).catch(() => {});
        errors.push(
          `${referred}: ${e instanceof Error ? e.message : String(e)}`
        );
        // don't break whole batch — try next referral
        continue;
      }
    }

    if (paid.length > 0) {
      const { notifyReferralPayoutTelegram } = await import("@/lib/telegram");
      void notifyReferralPayoutTelegram({
        referrer: twitter,
        paid: paid.length,
        amount: paid.length * REFERRAL_REWARD_SHIT,
        wallet,
        details: paid,
      });
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
