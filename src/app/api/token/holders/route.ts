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
      `SELECT value_num, updated_at FROM app_stats WHERE key = 'shit_holders' LIMIT 1`,
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

async function writeCache(holders: number) {
  await ensureCache();
  await tursoExecute(
    `INSERT INTO app_stats (key, value_num, updated_at)
     VALUES ('shit_holders', ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET
       value_num = excluded.value_num,
       updated_at = datetime('now')`,
    [holders]
  );
}

/**
 * Count Token-2022 token accounts for TOKENSHIT mint.
 * Uses dataSlice length 0 so we only get pubkeys (cheaper).
 */
async function fetchHolderCountFresh(): Promise<number> {
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
          dataSlice: { offset: 0, length: 0 },
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
  return list.length;
}

/**
 * GET /api/token/holders
 * Public ticker metric — $TOKENSHIT holder accounts (cached 10m).
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const force = url.searchParams.get("refresh") === "1";
    // refresh only with cron secret (expensive)
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
      const holders = await fetchHolderCountFresh();
      await writeCache(holders).catch(() => {});
      return Response.json(
        {
          holders,
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
