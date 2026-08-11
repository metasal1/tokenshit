import { type NextRequest } from "next/server";
import { tursoExecute } from "@/lib/turso";
import { REFERRAL_REWARD_SHIT } from "@/lib/shit-token";
import { sendShitFromTreasury } from "@/lib/treasury";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const referrerTwitter = String(body.referrerTwitter || "")
      .toLowerCase()
      .trim();
    const referredTwitter = String(body.referredTwitter || "")
      .toLowerCase()
      .trim();
    const referredWallet = body.referredWallet
      ? String(body.referredWallet)
      : null;
    // Optional: referrer's Solana wallet to receive $SHIT reward
    const referrerWallet = body.referrerWallet
      ? String(body.referrerWallet).trim()
      : null;

    if (!referrerTwitter || !referredTwitter) {
      return Response.json(
        { error: "Missing referrer or referred twitter handle" },
        { status: 400 }
      );
    }

    if (referrerTwitter === referredTwitter) {
      return Response.json(
        { error: "Cannot refer yourself, degen" },
        { status: 400 }
      );
    }

    const existingResult = await tursoExecute(
      "SELECT id FROM referrals WHERE referred_twitter = ?",
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

    // Optional $SHIT reward to referrer wallet (best-effort; never fail track)
    let reward: { amount: number; signature?: string; error?: string } | null =
      null;
    if (
      referrerWallet &&
      /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(referrerWallet)
    ) {
      try {
        // ensure rewards table
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
        const { signature } = await sendShitFromTreasury(
          referrerWallet,
          REFERRAL_REWARD_SHIT
        );
        await tursoExecute(
          `INSERT INTO referral_rewards (referrer_twitter, referred_twitter, wallet, amount, signature)
           VALUES (?, ?, ?, ?, ?)`,
          [
            referrerTwitter,
            referredTwitter,
            referrerWallet,
            REFERRAL_REWARD_SHIT,
            signature,
          ]
        );
        reward = { amount: REFERRAL_REWARD_SHIT, signature };
      } catch (e) {
        reward = {
          amount: REFERRAL_REWARD_SHIT,
          error: e instanceof Error ? e.message : String(e),
        };
      }
    }

    return Response.json({
      success: true,
      message: "Referral tracked",
      reward,
      rewardAmount: REFERRAL_REWARD_SHIT,
    });
  } catch (error) {
    console.error("Referral tracking error:", error);
    return Response.json({ error: "Failed to track referral" }, { status: 500 });
  }
}
