import { tursoExecute } from "@/lib/turso";

export const dynamic = "force-dynamic";

/**
 * GET /api/signup/count — public list size for ticker.
 */
export async function GET() {
  try {
    await tursoExecute(
      `CREATE TABLE IF NOT EXISTS email_signups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        twitter_handle TEXT,
        wallet_address TEXT,
        privy_id TEXT,
        source TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      []
    );
    const r = await tursoExecute(
      `SELECT COUNT(*) FROM email_signups`,
      []
    );
    const users = Number(r.rows[0]?.[0] ?? 0);
    return Response.json(
      { users, signups: users },
      {
        headers: {
          "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40",
        },
      }
    );
  } catch (e) {
    return Response.json(
      { users: 0, signups: 0, error: String(e) },
      { status: 500 }
    );
  }
}
