import { type NextRequest } from "next/server";
import { tursoExecute } from "@/lib/turso";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referrerTwitter, referredTwitter, referredWallet } = body;

    if (!referrerTwitter || !referredTwitter) {
      return Response.json(
        { error: "Missing referrer or referred twitter handle" },
        { status: 400 }
      );
    }

    // Prevent self-referral
    if (referrerTwitter === referredTwitter) {
      return Response.json(
        { error: "Cannot refer yourself, degen" },
        { status: 400 }
      );
    }

    // Check if already referred
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

    // Insert referral
    await tursoExecute(
      "INSERT INTO referrals (referrer_twitter, referred_twitter, referred_wallet) VALUES (?, ?, ?)",
      [referrerTwitter, referredTwitter, referredWallet || null]
    );

    return Response.json({ success: true, message: "Referral tracked" });
  } catch (error) {
    console.error("Referral tracking error:", error);
    return Response.json(
      { error: "Failed to track referral" },
      { status: 500 }
    );
  }
}
