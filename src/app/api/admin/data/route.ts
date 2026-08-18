import { type NextRequest } from "next/server";
import { tursoBatch } from "@/lib/turso";
import { requirePrivy } from "@/lib/privy-server";
import { ensureKolNomSchema } from "@/lib/kol-noms";

export const dynamic = "force-dynamic";

/** Normalize did:privy:xxx ↔ xxx for allowlist compare */
function normPrivyId(id: string): string {
  const s = id.trim().toLowerCase();
  return s.startsWith("did:privy:") ? s.slice("did:privy:".length) : s;
}

function adminAllowlist(): string[] {
  return (process.env.ADMIN_PRIVY_ID || "")
    .split(",")
    .map((s) => normPrivyId(s))
    .filter(Boolean);
}

function isAdminPrivy(privyId: string): boolean {
  const adminIds = adminAllowlist();
  if (adminIds.length === 0) return false;
  return adminIds.includes(normPrivyId(privyId));
}

/**
 * Admin dump — fail closed.
 * Auth: Privy token whose sub is in ADMIN_PRIVY_ID (comma-separated).
 * Optional: x-cron-secret / Bearer CRON_SECRET for automation.
 */
export async function GET(req: NextRequest) {
  const allow = adminAllowlist();
  const cronSecret =
    process.env.CRON_SECRET ||
    process.env.TREASURY_DROP_SECRET ||
    process.env.HERMES_CRON_SECRET ||
    "";

  const authHeader = req.headers.get("authorization") || "";
  const bearer = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";
  const headerSecret =
    req.headers.get("x-cron-secret") ||
    req.headers.get("x-admin-secret") ||
    "";

  // Cron path (exact secret match only — never treat Privy JWT as cron)
  if (cronSecret && (bearer === cronSecret || headerSecret === cronSecret)) {
    // ok — cron
  } else {
    if (allow.length === 0) {
      return Response.json(
        { error: "Admin not configured (ADMIN_PRIVY_ID)" },
        { status: 503 }
      );
    }
    const auth = await requirePrivy(req, {});
    if (!auth.ok) return auth.res;
    if (!isAdminPrivy(auth.id.privyId)) {
      return Response.json(
        {
          error: "Forbidden — Privy id not on allowlist",
          yourId: auth.id.privyId,
        },
        { status: 403 }
      );
    }
  }

  const results = await tursoBatch([
    {
      sql: `SELECT email, twitter_handle, wallet_address, source, created_at
            FROM email_signups ORDER BY created_at DESC LIMIT 500`,
      args: [],
    },
    {
      sql: `SELECT device_id, COUNT(*) as total,
              SUM(CASE WHEN vote='hit' THEN 1 ELSE 0 END) as hits,
              SUM(CASE WHEN vote='shit' THEN 1 ELSE 0 END) as shits,
              MAX(voted_at) as last_vote
            FROM votes GROUP BY device_id ORDER BY total DESC LIMIT 100`,
      args: [],
    },
    {
      sql: `SELECT referrer_twitter, referred_twitter, referred_wallet, created_at
            FROM referrals ORDER BY created_at DESC LIMIT 100`,
      args: [],
    },
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

  // kol noms soft-fail (table may be empty/new)
  let kolNoms: Array<{
    id: number;
    handle: string;
    note: string | null;
    byX: string | null;
    status: string;
    createdAt: string;
  }> = [];
  try {
    await ensureKolNomSchema();
    const { tursoExecute } = await import("@/lib/turso");
    const kr = await tursoExecute(
      `SELECT id, handle, note, by_x, status, created_at
       FROM kol_nominations ORDER BY id DESC LIMIT 100`
    );
    kolNoms = kr.rows.map((r) => ({
      id: Number(r[0]),
      handle: String(r[1] || ""),
      note: r[2] != null ? String(r[2]) : null,
      byX: r[3] != null ? String(r[3]) : null,
      status: String(r[4] || ""),
      createdAt: String(r[5] || ""),
    }));
  } catch (e) {
    console.error("admin kolNoms soft", e);
  }

  return Response.json(
    { stats, users, voters, referrals, kolNoms },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    }
  );
}
