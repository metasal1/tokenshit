import { getPrivyUserCount } from "@/lib/privy-users";
import { tursoExecute } from "@/lib/turso";

export const dynamic = "force-dynamic";

/**
 * GET /api/signup/count
 * Public ticker metric — Privy accounts (primary).
 * Also returns email list size for debugging.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const force = url.searchParams.get("refresh") === "1";

    const privy = await getPrivyUserCount({ force });

    let signups = 0;
    try {
      await tursoExecute(
        `CREATE TABLE IF NOT EXISTS email_signups (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL UNIQUE,
          created_at TEXT DEFAULT (datetime('now'))
        )`,
        []
      );
      const r = await tursoExecute(`SELECT COUNT(*) FROM email_signups`, []);
      signups = Number(r.rows[0]?.[0] ?? 0);
    } catch {
      /* ignore */
    }

    return Response.json(
      {
        users: privy.users,
        privyUsers: privy.users,
        signups,
        source: privy.source,
        cached: privy.cached,
        updatedAt: privy.updatedAt,
        ...(privy.error ? { error: privy.error } : {}),
      },
      {
        headers: {
          // short CDN cache; real refresh is Turso TTL inside getPrivyUserCount
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (e) {
    return Response.json(
      { users: 0, privyUsers: 0, signups: 0, error: String(e) },
      { status: 500 }
    );
  }
}
