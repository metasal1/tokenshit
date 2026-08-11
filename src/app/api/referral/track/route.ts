import { type NextRequest } from "next/server";
import { tursoExecute } from "@/lib/turso";
import { REFERRAL_REWARD_SHIT } from "@/lib/shit-token";

export const dynamic = "force-dynamic";

/**
 * POST /api/referral/track
 * Body: { referrerTwitter, referredTwitter, referredWallet? }
 *
 * SECURITY (2026-08): Never pays treasury here.
 * Attack was: unauthenticated spam of fake referredTwitter + referrerWallet
 * → 10k $TOKENSHIT each from SHTy treasury.
 * Rewards only via /api/referral/claim-rewards after proper checks.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const referrerTwitter = String(body.referrerTwitter || "")
      .toLowerCase()
      .replace(/^@/, "")
      .trim();
    const referredTwitter = String(body.referredTwitter || "")
      .toLowerCase()
      .replace(/^@/, "")
      .trim();
    const referredWallet = body.referredWallet
      ? String(body.referredWallet)
      : null;

    if (!referrerTwitter || !referredTwitter) {
      return Response.json(
        { error: "Missing referrer or referred twitter handle" },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9_]{1,15}$/i.test(referrerTwitter) || !/^[a-z0-9_]{1,15}$/i.test(referredTwitter)) {
      return Response.json({ error: "Invalid twitter handle" }, { status: 400 });
    }

    if (referrerTwitter === referredTwitter) {
      return Response.json(
        { error: "Cannot refer yourself, degen" },
        { status: 400 }
      );
    }

    await tursoExecute(
      `CREATE TABLE IF NOT EXISTS referrals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        referrer_twitter TEXT NOT NULL,
        referred_twitter TEXT NOT NULL UNIQUE,
        referred_wallet TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      []
    );

    const existingResult = await tursoExecute(
      "SELECT id FROM referrals WHERE lower(referred_twitter) = lower(?)",
      [referredTwitter]
    );

    if (existingResult.rows.length > 0) {
      return Response.json(
        { error: "Already referred by someone else", alreadyReferred: true },
        { status: 409 }
      );
    }

    await tursoExecute(
      "INSERT INTO referrals (referrer_twitter, referred_twitter, referred_wallet) VALUES (?, ?, ?)",
      [referrerTwitter, referredTwitter, referredWallet || null]
    );

    return Response.json({
      success: true,
      message: "Referral tracked",
      /** payout disabled on track — claim path only, gated */
      reward: null,
      rewardAmount: REFERRAL_REWARD_SHIT,
      payoutOnTrack: false,
    });
  } catch (error) {
    console.error("Referral tracking error:", error);
    return Response.json({ error: "Failed to track referral" }, { status: 500 });
  }
}
