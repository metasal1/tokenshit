import { type NextRequest } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { tursoBatch } from "@/lib/turso";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";
const ADMIN_PRIVY_ID = process.env.ADMIN_PRIVY_ID || "";

export const dynamic = "force-dynamic";

async function verifyPrivyToken(token: string): Promise<string | null> {
  try {
    const JWKS = createRemoteJWKSet(
      new URL(`https://auth.privy.io/api/v1/apps/${PRIVY_APP_ID}/jwks.json`)
    );
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: "privy.io",
      audience: PRIVY_APP_ID,
    });
    // Return the Privy user ID (sub)
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const privyId = await verifyPrivyToken(token);
  if (!privyId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const allowedIds = (ADMIN_PRIVY_ID || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (allowedIds.length > 0 && !allowedIds.includes(privyId)) {
    // Return the id so it can be added to ADMIN_PRIVY_ID env var
    return Response.json({ error: "Forbidden", yourPrivyId: privyId }, { status: 403 });
  }

  const results = await tursoBatch([
    // All signed-up users
    {
      sql: `SELECT email, twitter_handle, wallet_address, source, created_at
            FROM email_signups ORDER BY created_at DESC`,
      args: [],
    },
    // Vote counts per voter (twitter or device)
    {
      sql: `SELECT device_id, COUNT(*) as total,
              SUM(CASE WHEN vote='hit' THEN 1 ELSE 0 END) as hits,
              SUM(CASE WHEN vote='shit' THEN 1 ELSE 0 END) as shits,
              MAX(voted_at) as last_vote
            FROM votes GROUP BY device_id ORDER BY total DESC LIMIT 100`,
      args: [],
    },
    // Referrals
    {
      sql: `SELECT referrer_twitter, referred_twitter, referred_wallet, created_at
            FROM referrals ORDER BY created_at DESC LIMIT 100`,
      args: [],
    },
    // Aggregate stats
    {
      sql: `SELECT
              (SELECT COUNT(*) FROM email_signups) as signups,
              (SELECT COUNT(*) FROM votes) as total_votes,
              (SELECT COUNT(DISTINCT device_id) FROM votes) as unique_voters,
              (SELECT COUNT(*) FROM referrals) as referrals`,
      args: [],
    },
  ]);

  const users = results[0].rows.map((r) => ({
    email: r[0],
    twitter: r[1],
    wallet: r[2],
    source: r[3],
    createdAt: r[4],
  }));

  const voters = results[1].rows.map((r) => ({
    voterId: r[0],
    total: r[1],
    hits: r[2],
    shits: r[3],
    lastVote: r[4],
  }));

  const referrals = results[2].rows.map((r) => ({
    referrer: r[0],
    referred: r[1],
    wallet: r[2],
    createdAt: r[3],
  }));

  const stats = results[3].rows[0]
    ? {
        signups: results[3].rows[0][0],
        totalVotes: results[3].rows[0][1],
        uniqueVoters: results[3].rows[0][2],
        referrals: results[3].rows[0][3],
      }
    : { signups: 0, totalVotes: 0, uniqueVoters: 0, referrals: 0 };

  return Response.json({ stats, users, voters, referrals });
}
