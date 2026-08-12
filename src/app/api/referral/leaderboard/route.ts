import { type NextRequest } from "next/server";
import { tursoExecute } from "@/lib/turso";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    await tursoExecute(
      `CREATE TABLE IF NOT EXISTS referrals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        referrer_twitter TEXT NOT NULL,
        referred_twitter TEXT NOT NULL UNIQUE,
        referred_wallet TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      []
    ).catch(() => {});

    const result = await tursoExecute(
      `SELECT lower(referrer_twitter) as u, COUNT(*) as c
       FROM referrals
       GROUP BY lower(referrer_twitter)
       ORDER BY c DESC
       LIMIT 20`
    );

    const leaderboard = result.rows.map((row) => ({
      username: String(row[0] || ""),
      referralCount: Number(row[1] || 0),
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
