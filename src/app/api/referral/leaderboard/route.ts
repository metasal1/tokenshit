import { type NextRequest } from "next/server";
import { tursoExecute } from "@/lib/turso";

export async function GET(request: NextRequest) {
  try {
    // Get top 20 referrers with their referral counts
    const result = await tursoExecute(
      `SELECT referrer_twitter, COUNT(*) as referral_count 
       FROM referrals 
       GROUP BY referrer_twitter 
       ORDER BY referral_count DESC 
       LIMIT 20`
    );

    const leaderboard = result.rows.map((row) => ({
      username: row[0],
      referralCount: row[1],
    }));

    return Response.json({ leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return Response.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
