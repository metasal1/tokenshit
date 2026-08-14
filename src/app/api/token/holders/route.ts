import { SHIT_MINT, SHIT_SYMBOL } from "@/lib/shit-token";
import { tursoExecute } from "@/lib/turso";

export const dynamic = "force-dynamic";

const HELIUS =
  process.env.HELIUS_RPC_URL ||
  process.env.SOLANA_RPC_URL ||
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  "https://viviyan-bkj12u-fast-mainnet.helius-rpc.com";

const TOKEN_2022 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 min — GPA is heavy

async function ensureCache() {
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS app_stats (
      key TEXT PRIMARY KEY,
      value_num REAL,
      value_text TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    []
  );
}

async function readCache(): Promise<{
  holders: number;
  updatedAt: string | null;
  ageMs: number | null;
} | null> {
  try {
    await ensureCache();
    const r = await tursoExecute(
      `SELECT value_num, updated_at FROM app_stats WHERE key = 'shit_holders_v2' LIMIT 1`,
      []
    );
    if (!r.rows.length) return null;
    const holders = Number(r.rows[0][0] ?? 0);
    const updatedAt = r.rows[0][1] != null ? String(r.rows[0][1]) : null;
    let ageMs: number | null = null;
    if (updatedAt) {
      const t = Date.parse(
        updatedAt.includes("T") ? updatedAt : updatedAt.replace(" ", "T") + "Z"
      );
      if (Number.isFinite(t)) ageMs = Date.now() - t;
    }
    return { holders, updatedAt, ageMs };
  } catch {
    return null;
  }
}

async function writeCache(holders: number, meta?: { accounts?: number; zero?: number }) {
  await ensureCache();
  await tursoExecute(
    `INSERT INTO app_stats (key, value_num, value_text, updated_at)
     VALUES ('shit_holders_v2', ?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET
       value_num = excluded.value_num,
       value_text = excluded.value_text,
       updated_at = datetime('now')`,
    [holders, meta ? JSON.stringify(meta) : null]
  );
}

/**
 * Count Token-2022 token accounts for TOKENSHIT with **amount > 0**.
 * Empty ATAs are common after claims/closes — do NOT count as holders.
 *
 * Token account layout: amount u64 LE @ offset 64.
 */
async function fetchHolderCountFresh(): Promise<{
  holders: number;
  accounts: number;
  zero: number;
}> {
  const res = await fetch(HELIUS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getProgramAccounts",
      params: [
        TOKEN_2022,
        {
          encoding: "base64",
          // amount only (8 bytes @ 64)
          dataSlice: { offset: 64, length: 8 },
          filters: [{ memcmp: { offset: 0, bytes: SHIT_MINT } }],
        },
      ],
    }),
    cache: "no-store",
  });
  const json = await res.json();
  if (json?.error) {
    throw new Error(json.error.message || "RPC error");
  }
  const list = json?.result;
  if (!Array.isArray(list)) {
    throw new Error("unexpected RPC shape");
  }

  let holders = 0;
  let zero = 0;
  for (const row of list) {
    const data = row?.account?.data;
    const b64 = Array.isArray(data) ? data[0] : data;
    if (typeof b64 !== "string" || b64.length < 8) {
      zero++;
      continue;
    }
    // base64 decode first 8 bytes → u64 LE amount
    const bin =
      typeof atob === "function"
        ? Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
        : Buffer.from(b64, "base64");
    if (bin.length < 8) {
      zero++;
      continue;
    }
    // little-endian u64 (amount won't exceed 2^53 for our supply)
    const amt =
      bin[0] +
      bin[1] * 256 +
      bin[2] * 65536 +
      bin[3] * 16777216 +
      bin[4] * 4294967296 +
      bin[5] * 1099511627776;
    if (amt > 0) holders++;
    else zero++;
  }

  return { holders, accounts: list.length, zero };
}

/**
 * GET /api/token/holders
 * Public ticker metric — $TOKENSHIT **non-zero** holder accounts (cached 10m).
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const force = url.searchParams.get("refresh") === "1";
    if (force) {
      const { requireCronSecret } = await import("@/lib/api-guard");
      const denied = requireCronSecret(request);
      if (denied) return denied;
    }

    const cached = await readCache();
    const freshEnough =
      cached &&
      cached.ageMs != null &&
      cached.ageMs >= 0 &&
      cached.ageMs < CACHE_TTL_MS &&
      !force;

    if (freshEnough && cached) {
      return Response.json(
        {
          holders: cached.holders,
          mint: SHIT_MINT,
          symbol: SHIT_SYMBOL,
          source: "cache",
          updatedAt: cached.updatedAt,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    }

    try {
      const { holders, accounts, zero } = await fetchHolderCountFresh();
      await writeCache(holders, { accounts, zero }).catch(() => {});
      return Response.json(
        {
          holders,
          accounts,
          zeroBalance: zero,
          mint: SHIT_MINT,
          symbol: SHIT_SYMBOL,
          source: "rpc",
          updatedAt: new Date().toISOString(),
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    } catch (e) {
      if (cached && cached.holders > 0) {
        return Response.json({
          holders: cached.holders,
          mint: SHIT_MINT,
          symbol: SHIT_SYMBOL,
          source: "fallback",
          updatedAt: cached.updatedAt,
          error: e instanceof Error ? e.message : String(e),
        });
      }
      throw e;
    }
  } catch (e) {
    return Response.json(
      { holders: 0, error: String(e) },
      { status: 500 }
    );
  }
}
