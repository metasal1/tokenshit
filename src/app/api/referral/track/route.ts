import { type NextRequest } from "next/server";
import { tursoExecute } from "@/lib/turso";
import { REFERRAL_REWARD_SHIT } from "@/lib/shit-token";
import { requirePrivy } from "@/lib/privy-server";
import { assertNotBlacklisted, isBlacklistedTwitter } from "@/lib/security";

export const dynamic = "force-dynamic";

/**
 * POST /api/referral/track
 * Body: { referrerTwitter, referredTwitter?, referredWallet? }
 * Auth: Bearer Privy token of the **referred** user (must match X).
 * Never pays treasury.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const referrerTwitter = String(body.referrerTwitter || "")
      .toLowerCase()
      .replace(/^@/, "")
      .trim();
    let referredTwitter = String(body.referredTwitter || "")
      .toLowerCase()
      .replace(/^@/, "")
      .trim();
    const referredWallet = body.referredWallet
      ? String(body.referredWallet).trim()
      : null;

    if (referredWallet) {
      const blocked = assertNotBlacklisted(referredWallet);
      if (blocked) return blocked;
    }

    const auth = await requirePrivy(request, {
      twitter: referredTwitter || null,
      requireTwitter: true,
    });
    if (!auth.ok) return auth.res;

    // Force referred = authenticated X (ignore spoofed body if secret resolves)
    if (auth.id.twitter) referredTwitter = auth.id.twitter;

    if (!referrerTwitter || !referredTwitter) {
      return Response.json(
        { error: "Missing referrer or referred twitter handle" },
        { status: 400 }
      );
    }

    if (
      !/^[a-z0-9_]{1,15}$/i.test(referrerTwitter) ||
      !/^[a-z0-9_]{1,15}$/i.test(referredTwitter)
    ) {
      return Response.json({ error: "Invalid twitter handle" }, { status: 400 });
    }

    if (referrerTwitter === referredTwitter) {
      return Response.json(
        { error: "Cannot refer yourself, degen" },
        { status: 400 }
      );
    }

    if (isBlacklistedTwitter(referrerTwitter)) {
      return Response.json(
        {
          error: "Invalid referral link",
          code: "referrer_blocked",
        },
        { status: 403 }
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

    if (referredWallet) {
      const mule = await tursoExecute(
        "SELECT id FROM referrals WHERE referred_wallet = ? LIMIT 1",
        [referredWallet]
      );
      if (mule.rows.length > 0) {
        return Response.json(
          { error: "This wallet was already used for a referral", code: "wallet_reuse" },
          { status: 409 }
        );
      }
    }

    if (isBlacklistedTwitter(referredTwitter)) {
      return Response.json(
        { error: "Invalid account", code: "referred_blocked" },
        { status: 403 }
      );
    }

    await tursoExecute(
      "INSERT INTO referrals (referrer_twitter, referred_twitter, referred_wallet) VALUES (?, ?, ?)",
      [referrerTwitter, referredTwitter, referredWallet || null]
    );

    return Response.json({
      success: true,
      message: "Referral tracked",
      reward: null,
      rewardAmount: REFERRAL_REWARD_SHIT,
      payoutOnTrack: false,
    });
  } catch (error) {
    console.error("Referral tracking error:", error);
    return Response.json({ error: "Failed to track referral" }, { status: 500 });
  }
}
