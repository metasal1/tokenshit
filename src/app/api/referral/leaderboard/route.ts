import { NextResponse } from "next/server";
import { tursoExecute } from "@/lib/turso";

export const runtime = "edge";

export async function GET() {
  try {
    const result = await tursoExecute(
      "SELECT referrer_twitter, COUNT(*) as count FROM referrals GROUP BY referrer_twitter ORDER BY count DESC LIMIT 20",
      []
    );

    const leaderboard = result.rows.map((r) => ({
      username: r[0],
      count: Number(r[1]),
    }));

    return NextResponse.json({ leaderboard });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
