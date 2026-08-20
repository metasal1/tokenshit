/**
 * Server gate for Privy Solana gas sponsorship.
 * Rate-limits per wallet + IP before client may call sponsor:true.
 */
import { tursoExecute } from "@/lib/turso";
import { getClientIp, rateLimitIp } from "@/lib/api-guard";
import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Max sponsored client txs per wallet / rolling day */
const PER_WALLET_DAY = Number(process.env.SPONSOR_MAX_PER_WALLET_DAY || 15);
/** Max sponsored client txs per IP / rolling day */
const PER_IP_DAY = Number(process.env.SPONSOR_MAX_PER_IP_DAY || 40);

async function ensureSponsorSchema() {
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS sponsor_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wallet TEXT NOT NULL,
      privy_id TEXT,
      kind TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    []
  );
  try {
    await tursoExecute(
      `CREATE INDEX IF NOT EXISTS idx_sponsor_wallet_day ON sponsor_usage (wallet, created_at)`,
      []
    );
  } catch {
    /* ok */
  }
}

function normalizeWallet(w: string): string {
  return w.trim();
}

/**
 * POST { wallet, kind?, privyId? }
 * Returns { ok, allow, remaining, reason? }
 * On allow, records one usage (call once per sponsored send attempt).
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limited = await rateLimitIp({
      ip,
      bucket: "sponsor_gate",
      limit: Math.max(PER_IP_DAY * 3, 60),
      windowHours: 1,
    });
    if (limited) return limited;

    const body = (await req.json().catch(() => ({}))) as {
      wallet?: string;
      kind?: string;
      privyId?: string;
      /** dryRun: check only, do not consume quota */
      dryRun?: boolean;
    };

    const wallet = body.wallet ? normalizeWallet(body.wallet) : "";
    if (!wallet || wallet.length < 32) {
      return Response.json(
        { ok: false, allow: false, reason: "wallet_required" },
        { status: 400 }
      );
    }

    await ensureSponsorSchema();

    const walletCount = await tursoExecute(
      `SELECT COUNT(*) FROM sponsor_usage
       WHERE wallet = ? AND created_at >= datetime('now', '-1 day')`,
      [wallet]
    );
    const wUsed = Number(walletCount.rows?.[0]?.[0] ?? 0);

    if (wUsed >= PER_WALLET_DAY) {
      return Response.json({
        ok: true,
        allow: false,
        reason: "wallet_day_cap",
        used: wUsed,
        limit: PER_WALLET_DAY,
        remaining: 0,
      });
    }

    // IP soft cap via separate count table row with wallet=ip:…
    const ipKey = `ip:${ip || "unknown"}`;
    const ipCount = await tursoExecute(
      `SELECT COUNT(*) FROM sponsor_usage
       WHERE wallet = ? AND created_at >= datetime('now', '-1 day')`,
      [ipKey]
    );
    const ipUsed = Number(ipCount.rows?.[0]?.[0] ?? 0);
    if (ipUsed >= PER_IP_DAY) {
      return Response.json({
        ok: true,
        allow: false,
        reason: "ip_day_cap",
        used: ipUsed,
        limit: PER_IP_DAY,
        remaining: 0,
      });
    }

    if (!body.dryRun) {
      await tursoExecute(
        `INSERT INTO sponsor_usage (wallet, privy_id, kind) VALUES (?, ?, ?)`,
        [wallet, body.privyId || null, body.kind || "client"]
      );
      await tursoExecute(
        `INSERT INTO sponsor_usage (wallet, privy_id, kind) VALUES (?, ?, ?)`,
        [ipKey, body.privyId || null, body.kind || "ip"]
      );
    }

    return Response.json({
      ok: true,
      allow: true,
      remaining: Math.max(0, PER_WALLET_DAY - wUsed - (body.dryRun ? 0 : 1)),
      walletLimit: PER_WALLET_DAY,
      strippedCloseRequired: true,
    });
  } catch (e) {
    return Response.json(
      {
        ok: false,
        allow: false,
        reason: "gate_error",
        error: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
