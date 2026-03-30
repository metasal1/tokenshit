import { NextRequest, NextResponse } from "next/server";
import { tursoExecute } from "@/lib/turso";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { referrerTwitter, referredTwitter, referredWallet } = await req.json();

    if (!referrerTwitter || !referredTwitter) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (referrerTwitter.toLowerCase() === referredTwitter.toLowerCase()) {
      return NextResponse.json({ error: "No self-referrals" }, { status: 400 });
    }

    // INSERT OR IGNORE — if already referred, silently skip
    await tursoExecute(
      "INSERT OR IGNORE INTO referrals (referrer_twitter, referred_twitter, referred_wallet) VALUES (?, ?, ?)",
      [referrerTwitter.toLowerCase(), referredTwitter.toLowerCase(), referredWallet || null]
    );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
