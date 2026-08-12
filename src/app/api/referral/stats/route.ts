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
      `SELECT r.referred_twitter, r.created_at,
              rr.signature, rr.amount
       FROM referrals r
       LEFT JOIN referral_rewards rr
         ON lower(rr.referred_twitter) = lower(r.referred_twitter)
       WHERE lower(r.referrer_twitter) = lower(?)
       ORDER BY r.created_at DESC`,
      [username]
    );

    const referrals = result.rows.map((row) => {
      const sig = row[2] != null ? String(row[2]) : null;
      const paid = Boolean(sig && sig !== "" && sig !== "pending");
      return {
        referred_twitter: String(row[0]),
        created_at: String(row[1]),
        paid,
        amount: row[3] != null ? Number(row[3]) : null,
        signature: paid ? sig : null,
      };
    });

    const paidCount = referrals.filter((r) => r.paid).length;
    const unpaidCount = referrals.length - paidCount;
    const paidAmount = referrals
      .filter((r) => r.paid)
      .reduce((s, r) => s + (r.amount || 0), 0);

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
