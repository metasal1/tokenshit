import { tursoExecute } from "@/lib/turso";

export const dynamic = "force-dynamic";

async function ensure() {
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS email_signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      twitter_handle TEXT,
      wallet_address TEXT,
      privy_id TEXT,
      source TEXT,
      x_followers INTEGER,
      x_verified INTEGER,
      x_verified_type TEXT,
      x_avatar_url TEXT,
      referrer_twitter TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    []
  );
  for (const col of [
    "ALTER TABLE email_signups ADD COLUMN x_followers INTEGER",
    "ALTER TABLE email_signups ADD COLUMN x_verified INTEGER",
    "ALTER TABLE email_signups ADD COLUMN x_verified_type TEXT",
    "ALTER TABLE email_signups ADD COLUMN x_avatar_url TEXT",
    "ALTER TABLE email_signups ADD COLUMN referrer_twitter TEXT",
  ]) {
    try {
      await tursoExecute(col, []);
    } catch {
      /* exists */
    }
  }
}

/** GET /api/signup/recent — public toast feed (no emails). */
export async function GET() {
  try {
    await ensure();
    const r = await tursoExecute(
      `SELECT id, twitter_handle, x_followers, x_verified, x_avatar_url,
              referrer_twitter, created_at
       FROM email_signups
       WHERE twitter_handle IS NOT NULL AND twitter_handle != ''
       ORDER BY id DESC
       LIMIT 12`,
      []
    );

    const events = r.rows.map((row) => {
      const handle = row[1] ? String(row[1]) : null;
      const avatar =
        (row[4] ? String(row[4]) : null) ||
        (handle
          ? `https://unavatar.io/twitter/${encodeURIComponent(handle)}`
          : null);
      return {
        id: Number(row[0]),
        handle,
        followers: row[2] != null && row[2] !== "" ? Number(row[2]) : null,
        verified: row[3] == null ? null : Number(row[3]) === 1,
        avatarUrl: avatar,
        referrer: row[5] ? String(row[5]) : null,
        createdAt: String(row[6] || ""),
      };
    });

    return Response.json(
      { events },
      {
        headers: {
          "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
        },
      }
    );
  } catch (e) {
    return Response.json({ events: [], error: String(e) }, { status: 500 });
  }
}
