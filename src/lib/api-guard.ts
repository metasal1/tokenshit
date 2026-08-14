/**
 * Lightweight API guards for CF Workers / OpenNext.
 */
import { tursoExecute } from "@/lib/turso";

/** Loopback / placeholder — never use for rate buckets (site-wide lock risk). */
export function isUnreliableIp(ip: string | null | undefined): boolean {
  if (!ip) return true;
  const s = ip.trim().toLowerCase();
  if (!s || s === "unknown") return true;
  if (s === "127.0.0.1" || s === "::1" || s === "0.0.0.0" || s === "::")
    return true;
  if (s.startsWith("127.")) return true;
  // IPv6 loopback forms
  if (s === "0:0:0:0:0:0:0:1") return true;
  return false;
}

/**
 * Best-effort real client IP behind CF / OpenNext / proxies.
 * Prefer platform single-client headers. Never fall back to loopback as a
 * "real" IP — return "unknown" so abuse gates skip (identity still required).
 */
export function getClientIp(request: {
  headers: { get(name: string): string | null };
}): string {
  const h = request.headers;
  const candidates = [
    h.get("cf-connecting-ip"),
    h.get("true-client-ip"),
    h.get("x-vercel-forwarded-for"),
    h.get("x-real-ip"),
    // OpenNext / some proxies
    h.get("x-client-ip"),
    h.get("x-forwarded-for"),
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    // XFF can be "client, proxy1, proxy2" — leftmost is original client
    const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
      // strip :port on IPv4
      const ip = part.replace(/^\[([^\]]+)\](?::\d+)?$/, "$1").replace(
        /^(\d+\.\d+\.\d+\.\d+):\d+$/,
        "$1"
      );
      if (!isUnreliableIp(ip)) return ip;
    }
  }

  return "unknown";
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
 * Unreliable IPs share no bucket (fail-open) — use identity gates for abuse.
 */
export async function rateLimitIp(opts: {
  ip: string;
  bucket: string;
  limit: number;
  windowHours?: number;
}): Promise<Response | null> {
  const windowHours = opts.windowHours ?? 1;
  if (opts.limit <= 0) return null;
  if (isUnreliableIp(opts.ip)) return null;

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
    await tursoExecute(`INSERT INTO api_rate (bucket, ip) VALUES (?, ?)`, [
      bucket,
      ip,
    ]);
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

export function isSolanaAddress(s: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s);
}
