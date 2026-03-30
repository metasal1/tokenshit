import { NextRequest, NextResponse } from "next/server";
import { tursoExecute } from "@/lib/turso";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get("username");
    if (!username) {
      return NextResponse.json({ error: "Missing username" }, { status: 400 });
    }

    const handle = username.toLowerCase();

    const countResult = await tursoExecute(
      "SELECT COUNT(*) as cnt FROM referrals WHERE referrer_twitter = ?",
      [handle]
    );
    const totalReferrals = Number(countResult.rows[0]?.[0] ?? 0);

    const listResult = await tursoExecute(
      "SELECT referred_twitter, created_at FROM referrals WHERE referrer_twitter = ? ORDER BY created_at DESC LIMIT 50",
      [handle]
    );

    const referrals = listResult.rows.map((r) => ({
      referred_twitter: r[0],
      created_at: r[1],
    }));

    return NextResponse.json({ totalReferrals, referrals });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
