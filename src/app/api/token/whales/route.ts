import {
  SHIT_DECIMALS,
  SHIT_MINT,
  SHIT_SYMBOL,
  TREASURY_ADDRESS,
} from "@/lib/shit-token";
import { tursoExecute } from "@/lib/turso";
import {
  labelWallet,
  WHALE_MINT,
  WHALE_POOL,
  WHALE_POOL_METEORA,
  WHALE_TRADES_WORKER,
} from "@/lib/whales";
import { reverseWalletNames } from "@/lib/name-reverse";

export const dynamic = "force-dynamic";

const HELIUS =
  process.env.SOLANA_RPC_URL ||
  process.env.HELIUS_RPC_URL ||
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  "https://rpc.aex402.com/";

const CACHE_TTL_MS = 3 * 60 * 1000; // 3 min

type HolderRow = {
  rank: number;
  owner: string;
  tokenAccount: string;
  amount: number;
  amountRaw: string;
  pctSupply: number;
  label: string | null;
  /** SNS / ADNS full name e.g. metasal.sol */
  domain: string | null;
  domainKind: "sns" | "ans" | null;
  isYou: boolean;
  isTreasury: boolean;
  isPool: boolean;
  /** ui amount delta vs previous snapshot */
  delta: number | null;
  holdSecAvg: number | null;
  holdLabel: string | null;
  acqMix: string | null;
  firstAcquiredTs: number | null;
};

async function rpc(
  method: string,
  params: unknown
): Promise<unknown> {
  const res = await fetch(HELIUS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params: Array.isArray(params) ? params : params,
    }),
    cache: "no-store",
  });
  const json = (await res.json()) as {
    result?: unknown;
    error?: { message?: string };
  };
  if (json.error) throw new Error(json.error.message || "RPC error");
  return json.result;
}

async function ensureTables() {
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS app_stats (
      key TEXT PRIMARY KEY,
      value_num REAL,
      value_text TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    []
  );
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS whale_holder_snap (
      owner TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    []
  );
}

async function readJsonCache(): Promise<{
  at: number;
  payload: unknown;
} | null> {
  try {
    await ensureTables();
    const r = await tursoExecute(
      `SELECT value_text, updated_at FROM app_stats WHERE key = 'whale_board' LIMIT 1`,
      []
    );
    if (!r.rows.length || r.rows[0][0] == null) return null;
    const payload = JSON.parse(String(r.rows[0][0]));
    const updatedAt = r.rows[0][1] != null ? String(r.rows[0][1]) : null;
    let at = 0;
    if (updatedAt) {
      const t = Date.parse(
        updatedAt.includes("T") ? updatedAt : updatedAt.replace(" ", "T") + "Z"
      );
      if (Number.isFinite(t)) at = t;
    }
    return { at, payload };
  } catch {
    return null;
  }
}

async function writeJsonCache(payload: unknown) {
  await ensureTables();
  await tursoExecute(
    `INSERT INTO app_stats (key, value_text, updated_at)
     VALUES ('whale_board', ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET
       value_text = excluded.value_text,
       updated_at = datetime('now')`,
    [JSON.stringify(payload)]
  );
}

async function loadPrevAmounts(): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  try {
    await ensureTables();
    const r = await tursoExecute(
      `SELECT owner, amount FROM whale_holder_snap`,
      []
    );
    for (const row of r.rows) {
      map.set(String(row[0]), Number(row[1]) || 0);
    }
  } catch {
    /* empty */
  }
  return map;
}

async function saveAmounts(rows: { owner: string; amount: number }[]) {
  await ensureTables();
  for (const h of rows) {
    await tursoExecute(
      `INSERT INTO whale_holder_snap (owner, amount, updated_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(owner) DO UPDATE SET
         amount = excluded.amount,
         updated_at = datetime('now')`,
      [h.owner, h.amount]
    );
  }
}

async function enrichHolding(
  owner: string,
  amount: number
): Promise<{
  holdSecAvg: number | null;
  holdLabel: string | null;
  acqMix: string | null;
  firstAcquiredTs: number | null;
}> {
  const empty = {
    holdSecAvg: null as number | null,
    holdLabel: null as string | null,
    acqMix: null as string | null,
    firstAcquiredTs: null as number | null,
  };
  if (amount <= 0) return empty;
  try {
    const u = new URL(`${WHALE_TRADES_WORKER}/holding`);
    u.searchParams.set("wallet", owner);
    u.searchParams.set("amount", String(Math.floor(amount)));
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(u.toString(), {
      signal: ctrl.signal,
      cache: "no-store",
    });
    clearTimeout(t);
    if (!res.ok) return empty;
    const j = (await res.json()) as {
      holding?: {
        ok?: boolean;
        holdSecAvg?: number;
        detail?: string;
        firstAcquiredTs?: number;
        primaryLabel?: string;
      };
    };
    const h = j.holding;
    if (!h?.ok) return empty;
    return {
      holdSecAvg:
        typeof h.holdSecAvg === "number" && Number.isFinite(h.holdSecAvg)
          ? h.holdSecAvg
          : null,
      holdLabel: h.detail || h.primaryLabel || null,
      acqMix: h.detail || null,
      firstAcquiredTs:
        typeof h.firstAcquiredTs === "number" ? h.firstAcquiredTs : null,
    };
  } catch {
    return empty;
  }
}

async function fetchWhalesFresh(limit: number): Promise<{
  holders: HolderRow[];
  supply: number;
  movements: {
    owner: string;
    label: string | null;
    delta: number;
    amount: number;
    pctSupply: number;
  }[];
  updatedAt: string;
}> {
  const want = Math.min(50, Math.max(5, limit));

  // Supply
  const supplyRes = (await rpc("getTokenSupply", [WHALE_MINT])) as {
    value?: { uiAmount?: number | null; amount?: string; decimals?: number };
  };
  const decimals = supplyRes?.value?.decimals ?? SHIT_DECIMALS;
  const supply =
    supplyRes?.value?.uiAmount != null &&
    Number.isFinite(supplyRes.value.uiAmount)
      ? Number(supplyRes.value.uiAmount)
      : Number(supplyRes?.value?.amount || 0) / 10 ** decimals;

  // Helius getTokenAccounts — full holder set (not capped at 20 like largest)
  const byOwner = new Map<string, { amount: number; tokenAccount: string; amountRaw: string }>();
  let page = 1;
  for (; page <= 5; page++) {
    type TokenAccountsResult = {
      token_accounts?: {
        address?: string;
        owner?: string;
        amount?: string | number;
      }[];
      total?: number;
    };
    let result: TokenAccountsResult | null = null;
    try {
      result = (await rpc("getTokenAccounts", {
        mint: WHALE_MINT,
        limit: 1000,
        page,
        displayOptions: { showZeroBalance: false },
      })) as TokenAccountsResult;
    } catch {
      // fallback below if method unsupported
      result = null;
      break;
    }
    const accounts = result?.token_accounts || [];
    if (!accounts.length) break;
    for (const ta of accounts) {
      const owner = ta.owner || "";
      if (!owner) continue;
      let raw = 0;
      try {
        raw = Number(ta.amount || 0);
      } catch {
        raw = 0;
      }
      if (!Number.isFinite(raw) || raw <= 0) continue;
      const ui = raw / 10 ** decimals;
      const cur = byOwner.get(owner);
      if (!cur) {
        byOwner.set(owner, {
          amount: ui,
          tokenAccount: ta.address || owner,
          amountRaw: String(raw),
        });
      } else {
        cur.amount += ui;
      }
    }
    if (accounts.length < 1000) break;
  }

  // Fallback: getTokenLargestAccounts (max ~20) if DAS empty
  if (!byOwner.size) {
    const largest = (await rpc("getTokenLargestAccounts", [WHALE_MINT])) as {
      value?: {
        address: string;
        amount: string;
        uiAmount: number | null;
        uiAmountString?: string;
      }[];
    };
    const accounts = largest?.value || [];
    const multi = (await rpc("getMultipleAccounts", [
      accounts.map((a) => a.address),
      { encoding: "jsonParsed", commitment: "confirmed" },
    ])) as {
      value?: Array<{
        data?: {
          parsed?: {
            info?: {
              owner?: string;
              tokenAmount?: { uiAmount?: number; amount?: string };
            };
          };
        };
      } | null>;
    };
    accounts.forEach((acc, i) => {
      const info = multi?.value?.[i]?.data?.parsed?.info;
      const owner = info?.owner || "";
      if (!owner) return;
      const ui =
        info?.tokenAmount?.uiAmount != null
          ? Number(info.tokenAmount.uiAmount)
          : acc.uiAmount != null
            ? Number(acc.uiAmount)
            : Number(acc.uiAmountString || 0);
      byOwner.set(owner, {
        amount: Number.isFinite(ui) ? ui : 0,
        tokenAccount: acc.address,
        amountRaw: info?.tokenAmount?.amount || acc.amount || "0",
      });
    });
  }

  const merged = [...byOwner.entries()]
    .map(([owner, v]) => ({ owner, ...v }))
    .filter((h) => h.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, want);

  const prev = await loadPrevAmounts();

  const enrichTargets = merged
    .filter((h) => {
      const lab = labelWallet(h.owner);
      return !lab?.toLowerCase().includes("pool");
    })
    .slice(0, 15);

  const holdMap = new Map<
    string,
    Awaited<ReturnType<typeof enrichHolding>>
  >();

  // SNS / ADNS reverse for non-pool wallets (cap for latency)
  const nameTargets = merged
    .filter((h) => {
      const lab = labelWallet(h.owner);
      if (lab?.toLowerCase().includes("pool")) return false;
      if (h.owner === TREASURY_ADDRESS) return false;
      return true;
    })
    .map((h) => h.owner)
    .slice(0, 30);

  const [nameMap] = await Promise.all([
    reverseWalletNames(nameTargets, {
      concurrency: 10,
      timeoutMs: 2500,
    }).catch(() => new Map()),
    Promise.all(
      enrichTargets.map(async (h) => {
        holdMap.set(h.owner, await enrichHolding(h.owner, h.amount));
      })
    ),
  ]);

  const holders: HolderRow[] = merged.map((h, idx) => {
    const infra = labelWallet(h.owner);
    const name = nameMap.get(h.owner) || null;
    // Display label: Pool/Treasury first, else domain name
    const label = infra || (name ? name.domain : null);
    const pct = supply > 0 ? (h.amount / supply) * 100 : 0;
    const prevAmt = prev.has(h.owner) ? prev.get(h.owner)! : null;
    const delta = prevAmt == null ? null : h.amount - prevAmt;
    const hold = holdMap.get(h.owner);
    return {
      rank: idx + 1,
      owner: h.owner,
      tokenAccount: h.tokenAccount,
      amount: h.amount,
      amountRaw: h.amountRaw,
      pctSupply: pct,
      label,
      domain: name?.domain ?? null,
      domainKind: name?.kind ?? null,
      isYou: false,
      isTreasury: h.owner === TREASURY_ADDRESS,
      isPool:
        h.owner === WHALE_POOL ||
        h.owner === WHALE_POOL_METEORA ||
        Boolean(infra?.toLowerCase().includes("pool")),
      delta,
      holdSecAvg: hold?.holdSecAvg ?? null,
      holdLabel: hold?.holdLabel ?? null,
      acqMix: hold?.acqMix ?? null,
      firstAcquiredTs: hold?.firstAcquiredTs ?? null,
    };
  });

  const movements = holders
    .filter((h) => h.delta != null && Math.abs(h.delta!) >= 1)
    .map((h) => ({
      owner: h.owner,
      label: h.label,
      domain: h.domain,
      delta: h.delta!,
      amount: h.amount,
      pctSupply: h.pctSupply,
    }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  await saveAmounts(
    merged.map((h) => ({ owner: h.owner, amount: h.amount }))
  ).catch(() => {});

  return {
    holders,
    supply,
    movements,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * GET /api/token/whales
 * Top $TOKENSHIT holders + hold time + movement vs last snapshot.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const force = url.searchParams.get("refresh") === "1";
    const limit = Math.min(50, Math.max(5, Number(url.searchParams.get("limit") || 50)));

    if (!force) {
      const cached = await readJsonCache();
      if (cached && Date.now() - cached.at < CACHE_TTL_MS && cached.payload) {
        return Response.json(
          { ...(cached.payload as object), source: "cache" },
          {
            headers: {
              "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
            },
          }
        );
      }
    }

    const data = await fetchWhalesFresh(limit);
    const payload = {
      ok: true,
      mint: SHIT_MINT,
      symbol: SHIT_SYMBOL,
      decimals: SHIT_DECIMALS,
      supply: data.supply,
      holders: data.holders,
      movements: data.movements,
      updatedAt: data.updatedAt,
      you: null,
      treasury: TREASURY_ADDRESS,
      pool: WHALE_POOL,
    };
    await writeJsonCache(payload).catch(() => {});
    return Response.json(
      { ...payload, source: "rpc" },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (e) {
    const cached = await readJsonCache();
    if (cached?.payload) {
      return Response.json({
        ...(cached.payload as object),
        source: "fallback",
        error: e instanceof Error ? e.message : String(e),
      });
    }
    return Response.json(
      { ok: false, holders: [], movements: [], error: String(e) },
      { status: 500 }
    );
  }
}
