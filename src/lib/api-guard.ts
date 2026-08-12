/**
 * Lightweight API guards for CF Workers.
 */
import { tursoExecute } from "@/lib/turso";

export function getClientIp(request: Request): string {
  const h = request.headers;
  const xf = h.get("cf-connecting-ip") || h.get("x-forwarded-for") || "";
  const first = xf.split(",")[0]?.trim();
  return first || h.get("x-real-ip") || "unknown";
}

/** Cron / internal secret (fail closed). */
export function requireCronSecret(request: Request): Response | null {
  const secret =
    process.env.CRON_SECRET ||
    process.env.TREASURY_DROP_SECRET ||
    process.env.HERMES_CRON_SECRET ||
    "";
  if (!secret) {
    return Response.json(
      { error: "CRON_SECRET not configured" },
      { status: 503 }
    );
  }
  const auth = request.headers.get("authorization") || "";
  const bearer = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : "";
  const header =
    request.headers.get("x-cron-secret") ||
    request.headers.get("x-admin-secret") ||
    "";
  const provided = bearer || header;
  if (!provided || provided !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

async function ensureRateTable() {
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS api_rate (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bucket TEXT NOT NULL,
      ip TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    []
  );
}

/**
 * Simple DB rate limit. Returns 429 Response if over limit.
 * windowHours: lookback window.
 */
export async function rateLimitIp(opts: {
  ip: string;
  bucket: string;
  limit: number;
  windowHours?: number;
}): Promise<Response | null> {
  const windowHours = opts.windowHours ?? 1;
  const ip = (opts.ip || "unknown").slice(0, 80);
  const bucket = opts.bucket.slice(0, 64);
  try {
    await ensureRateTable();
    const r = await tursoExecute(
      `SELECT COUNT(*) FROM api_rate
       WHERE bucket = ? AND ip = ?
         AND created_at > datetime('now', ?)`,
      [bucket, ip, `-${windowHours} hours`]
    );
    const n = Number(r.rows[0]?.[0] ?? 0);
    if (n >= opts.limit) {
      return Response.json(
        {
          error: "Rate limit — try again later",
          code: "rate_limit",
          bucket,
          limit: opts.limit,
        },
        { status: 429 }
      );
    }
    await tursoExecute(
      `INSERT INTO api_rate (bucket, ip) VALUES (?, ?)`,
      [bucket, ip]
    );
    // opportunistic prune
    if (Math.random() < 0.02) {
      await tursoExecute(
        `DELETE FROM api_rate WHERE created_at < datetime('now', '-2 days')`,
        []
      ).catch(() => {});
    }
  } catch {
    // fail open on rate table errors — don't break product
  }
  return null;
}

/** Valid Solana base58 pubkey shape */
export function isSolanaAddress(s: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s);
}
