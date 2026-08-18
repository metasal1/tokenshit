import { tursoExecute } from "@/lib/turso";
import { ensureClaimSchema } from "@/lib/claims";
import { getClientIp, rateLimitIp } from "@/lib/api-guard";
import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = {
  jup_verified: "Jupiter VRFD",
    x_premium: "X premium",
    x_verified: "X verified",
    gh_fork: "GH fork",
    x_tweet: "tweet tag",
    x_follow: "X follow",
    email_list: "list join",
    day_hit: "HIT pot",
    day_shit: "SHIT pot",
  };

function maskHandle(h: string | null): string | null {
  if (!h) return null;
  const s = h.replace(/^@/, "").replace(/^gh:/, "");
  if (s.length <= 3) return `${s[0] || "?"}…`;
  return `${s.slice(0, 2)}…${s.slice(-1)}`;
}

/** GET /api/claim/recent — public toast feed; handles masked, no GitHub. */
export async function GET(req: NextRequest) {
  try {
    const limited = await rateLimitIp({
      ip: getClientIp(req),
      bucket: "claim_recent",
      limit: 120,
      windowHours: 1,
    });
    if (limited) return limited;

    await ensureClaimSchema();
    const r = await tursoExecute(
      `SELECT id, claim_kind, twitter, amount, created_at
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
      const handle = maskHandle(twitter);
      return {
        id: Number(row[0]),
        kind,
        kindLabel: KIND_LABEL[kind] || kind,
        handle,
        // no raw twitter/github for public feed
        amount: Number(row[3] || 0),
        avatarUrl: null as string | null,
        createdAt: String(row[4] || ""),
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
  } catch {
    return Response.json({ events: [] }, { status: 500 });
  }
}
