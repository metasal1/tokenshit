import { type NextRequest } from "next/server";
import { tursoExecute } from "@/lib/turso";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return Response.json(
        { error: "Missing username parameter" },
        { status: 400 }
      );
    }

    // Get referrals made by this user
    const result = await tursoExecute(
      "SELECT referred_twitter, created_at FROM referrals WHERE referrer_twitter = ? ORDER BY created_at DESC",
      [username]
    );

    const referrals = result.rows.map((row) => ({
      referred_twitter: row[0],
      created_at: row[1],
    }));

    return Response.json({
      totalReferrals: referrals.length,
      username,
      referrals,
    });
  } catch (error) {
    console.error("Referral stats error:", error);
    return Response.json(
      { error: "Failed to fetch referral stats" },
      { status: 500 }
    );
  }
}
