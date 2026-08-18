import { type NextRequest } from "next/server";
import { tursoExecute } from "@/lib/turso";
import { requirePrivy } from "@/lib/privy-server";
import { getClientIp, rateLimitIp } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

/**
 * GET /api/referral/stats?username=
 * Full detail only when Privy session X handle matches username.
 * Public: totalReferrals count only.
 */
export async function GET(request: NextRequest) {
  try {
    const limited = await rateLimitIp({
      ip: getClientIp(request),
      bucket: "referral_stats",
      limit: 60,
      windowHours: 1,
    });
    if (limited) return limited;

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

    const countR = await tursoExecute(
      `SELECT COUNT(*) FROM referrals WHERE lower(referrer_twitter) = lower(?)`,
      [username]
    );
    const totalReferrals = Number(countR.rows[0]?.[0] || 0);

    // Session must match username for PII (handles, sigs)
    const auth = await requirePrivy(request, {});
    const sessionHandle =
      auth.ok && auth.id.twitter
        ? String(auth.id.twitter).toLowerCase().replace(/^@/, "")
        : null;
    const isOwner = sessionHandle === username;

    if (!isOwner) {
      return Response.json({
        totalReferrals,
        username,
        referrals: [],
        paidCount: 0,
        paidAmount: 0,
        unpaidCount: 0,
        detail: false,
      });
    }

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
      detail: true,
    });
  } catch {
    return Response.json(
      { error: "Failed to fetch referral stats" },
      { status: 500 }
    );
  }
}
