import { type NextRequest } from "next/server";
import { tursoExecute } from "@/lib/turso";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username")?.toLowerCase().trim();

    if (!username) {
      return Response.json(
        { error: "Missing username parameter" },
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

    const result = await tursoExecute(
      `SELECT referred_twitter, created_at FROM referrals
       WHERE lower(referrer_twitter) = lower(?)
       ORDER BY created_at DESC`,
      [username]
    );

    const referrals = result.rows.map((row) => ({
      referred_twitter: String(row[0]),
      created_at: String(row[1]),
    }));

    const paidR = await tursoExecute(
      `SELECT COUNT(*), COALESCE(SUM(amount),0) FROM referral_rewards
       WHERE lower(referrer_twitter) = lower(?)
         AND signature IS NOT NULL AND signature != '' AND signature != 'pending'`,
      [username]
    );
    const unpaidR = await tursoExecute(
      `SELECT COUNT(*) FROM referrals r
       WHERE lower(r.referrer_twitter) = lower(?)
       AND NOT EXISTS (
         SELECT 1 FROM referral_rewards rr
         WHERE lower(rr.referred_twitter) = lower(r.referred_twitter)
           AND rr.signature IS NOT NULL AND rr.signature != '' AND rr.signature != 'pending'
       )`,
      [username]
    );

    const paidCount = Number(paidR.rows[0]?.[0] || 0);
    const paidAmount = Number(paidR.rows[0]?.[1] || 0);
    const unpaidCount = Number(unpaidR.rows[0]?.[0] || 0);

    return Response.json({
      totalReferrals: referrals.length,
      username,
      referrals,
      paidCount,
      paidAmount,
      unpaidCount,
    });
  } catch (error) {
    console.error("Referral stats error:", error);
    return Response.json(
      { error: "Failed to fetch referral stats" },
      { status: 500 }
    );
  }
}
