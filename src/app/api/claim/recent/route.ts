import { tursoExecute } from "@/lib/turso";
import { ensureClaimSchema } from "@/lib/claims";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = {
  x_verified: "X verified",
  gh_fork: "GH fork",
  x_tweet: "tweet tag",
  x_follow: "X follow",
};

/** GET /api/claim/recent — public glitch-toast feed (no wallets). */
export async function GET() {
  try {
    await ensureClaimSchema();
    const r = await tursoExecute(
      `SELECT id, claim_kind, twitter, github, amount, created_at
       FROM shit_claims
       WHERE signature IS NOT NULL
         AND signature != ''
         AND signature != 'pending'
       ORDER BY id DESC
       LIMIT 15`,
      []
    );

    const events = r.rows.map((row) => {
      const kind = String(row[1] || "");
      const twitter = row[2] ? String(row[2]).replace(/^@/, "") : null;
      const github = row[3] ? String(row[3]).replace(/^@/, "") : null;
      const handle = twitter || (github ? `gh:${github}` : null);
      const avatarUrl = twitter
        ? `https://unavatar.io/twitter/${encodeURIComponent(twitter)}`
        : github
          ? `https://unavatar.io/github/${encodeURIComponent(github)}`
          : null;
      return {
        id: Number(row[0]),
        kind,
        kindLabel: KIND_LABEL[kind] || kind,
        handle,
        twitter,
        github,
        amount: Number(row[4] || 0),
        avatarUrl,
        createdAt: String(row[5] || ""),
      };
    });

    return Response.json(
      { events },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20",
        },
      }
    );
  } catch (e) {
    return Response.json({ events: [], error: String(e) }, { status: 500 });
  }
}
