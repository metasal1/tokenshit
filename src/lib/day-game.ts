/**
 * Hit / Shit of the Hour — free plays, snapshots, settlement.
 * Free mode: no stake. Fixed hourly prize from claims treasury (SHTy).
 * Round key = UTC hour `YYYY-MM-DDTHH` (stored in day_* tables as utc_day).
 */
import { tursoExecute } from "@/lib/turso";
import { PLAY_POT_ADDRESS } from "@/lib/shit-token";
import { rpc } from "@/lib/treasury";

/** Legacy stake amount — free play uses 0 */
export const DAY_STAKE_AMOUNT = 0;
export const DAY_HOUSE_FEE_BPS = 0;
export const DAY_GAME_ENABLED = process.env.DAY_GAME_ENABLED !== "0";

/** Free Play of the Hour */
export const FREE_PLAY = process.env.PLAY_FREE !== "0";
/** 1 UP + 1 DOWN per wallet per UTC hour */
export const PLAY_MAX_PER_SIDE = 1;
/** Total slots = both sides (kept for API/UI that still read maxPicks) */
export const PLAY_MAX_PICKS = PLAY_MAX_PER_SIDE * 2;
/** Winning window: top N HIT % and bottom N SHIT % share the pot */
export const PLAY_WIN_WINDOW = 3;
/** Must still hold this much $TOKENSHIT (didn't dump claims) */
export const PLAY_MIN_BALANCE = Number(process.env.PLAY_MIN_BALANCE || 10_000);
/** Base prize each hour from SHTy; jackpot rolls on top if no winners */
export const HOUR_PRIZE = Number(process.env.PLAY_HOUR_PRIZE || 20_000);
export const PLAY_REQUIRE_FOLLOW = process.env.PLAY_REQUIRE_FOLLOW !== "0";

/** Round length */
export const ROUND_MS = 60 * 60 * 1000;

export type DaySide = "hit" | "shit";

/** Current UTC hour key: 2026-08-13T14 */
export function utcHourString(d = new Date()): string {
  const iso = d.toISOString(); // 2026-08-13T14:23:45.678Z
  return iso.slice(0, 13); // YYYY-MM-DDTHH
}

/** @deprecated use utcHourString — kept for import aliases */
export function utcDayString(d = new Date()): string {
  return utcHourString(d);
}

export function previousUtcHour(hourKey: string): string {
  const t = Date.parse(hourKey + ":00:00.000Z") - ROUND_MS;
  return utcHourString(new Date(t));
}

/** @deprecated */
export function previousUtcDay(day: string): string {
  // If day-only key, treat as previous calendar day; if hour key, previous hour
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    const t = Date.parse(day + "T12:00:00.000Z") - 86400000;
    return new Date(t).toISOString().slice(0, 10);
  }
  return previousUtcHour(day);
}

export function nextUtcHourMs(from = Date.now()): number {
  const d = new Date(from);
  return Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    d.getUTCHours() + 1,
    0,
    0,
    0
  );
}

/** @deprecated */
export function nextUtcMidnightMs(from = Date.now()): number {
  return nextUtcHourMs(from);
}

export function formatHourLabel(hourKey: string): string {
  try {
    const t = Date.parse(
      hourKey.includes("T") ? hourKey + ":00:00.000Z" : hourKey + "T00:00:00.000Z"
    );
    if (!Number.isFinite(t)) return hourKey;
    return new Date(t).toISOString().replace(":00.000Z", "Z").slice(0, 16) + " UTC";
  } catch {
    return hourKey;
  }
}

export async function ensureDayGameSchema() {
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS day_rounds (
      utc_day TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'open',
      hit_pot REAL NOT NULL DEFAULT 0,
      shit_pot REAL NOT NULL DEFAULT 0,
      open_snap_at TEXT,
      close_snap_at TEXT,
      settled_at TEXT,
      hit_asset_id TEXT,
      shit_asset_id TEXT,
      hit_pct REAL,
      shit_pct REAL,
      hit_winner TEXT,
      shit_winner TEXT,
      hit_prize REAL,
      shit_prize REAL,
      hit_fee REAL,
      shit_fee REAL,
      hit_sig TEXT,
      shit_sig TEXT,
      hit_fee_sig TEXT,
      shit_fee_sig TEXT,
      meta TEXT
    )`,
    []
  );
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS day_stakes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      utc_day TEXT NOT NULL,
      wallet TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      side TEXT NOT NULL,
      amount REAL NOT NULL,
      signature TEXT NOT NULL UNIQUE,
      twitter TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    []
  );
  await tursoExecute(
    `CREATE INDEX IF NOT EXISTS idx_day_stakes_day_side
     ON day_stakes(utc_day, side)`,
    []
  );
  await tursoExecute(
    `CREATE INDEX IF NOT EXISTS idx_day_stakes_day_wallet
     ON day_stakes(utc_day, wallet)`,
    []
  );
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS day_prices (
      utc_day TEXT NOT NULL,
      phase TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      price REAL NOT NULL,
      volume24h REAL NOT NULL DEFAULT 0,
      name TEXT,
      symbol TEXT,
      logo TEXT,
      snapped_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (utc_day, phase, asset_id)
    )`,
    []
  );
}

export async function ensureRound(utcDay: string) {
  await ensureDayGameSchema();
  await tursoExecute(
    `INSERT OR IGNORE INTO day_rounds (utc_day, status) VALUES (?, 'open')`,
    [utcDay]
  );
}

export type RoundMeta = {
  jackpot?: number;
  freePlay?: boolean;
  rolledFrom?: string;
  rolledAmount?: number;
  [k: string]: unknown;
};

export function parseRoundMeta(raw: string | null | undefined): RoundMeta {
  if (!raw) return {};
  try {
    const j = JSON.parse(raw);
    return j && typeof j === "object" ? (j as RoundMeta) : {};
  } catch {
    return {};
  }
}

/** Prize this hour = base 10k + jackpot rolled from prior empty hours */
export async function getHourPrizePool(utcDay: string): Promise<{
  base: number;
  jackpot: number;
  total: number;
}> {
  await ensureRound(utcDay);
  const r = await tursoExecute(
    `SELECT meta FROM day_rounds WHERE utc_day = ? LIMIT 1`,
    [utcDay]
  );
  const meta = parseRoundMeta(
    r.rows[0]?.[0] != null ? String(r.rows[0][0]) : null
  );
  const jackpot = Math.max(0, Math.floor(Number(meta.jackpot || 0)));
  const base = FREE_PLAY ? HOUR_PRIZE : 0;
  return { base, jackpot, total: base + jackpot };
}

export async function setHourJackpot(
  utcDay: string,
  jackpot: number,
  extra?: RoundMeta
): Promise<void> {
  await ensureRound(utcDay);
  const r = await tursoExecute(
    `SELECT meta FROM day_rounds WHERE utc_day = ? LIMIT 1`,
    [utcDay]
  );
  const meta = parseRoundMeta(
    r.rows[0]?.[0] != null ? String(r.rows[0][0]) : null
  );
  const next = {
    ...meta,
    ...extra,
    freePlay: true,
    jackpot: Math.max(0, Math.floor(jackpot)),
  };
  await tursoExecute(`UPDATE day_rounds SET meta = ? WHERE utc_day = ?`, [
    JSON.stringify(next),
    utcDay,
  ]);
}

/** On-chain TOKENSHIT UI balance for play gate (30s cache) */
const shitBalCache = new Map<string, { at: number; ui: number }>();

export async function getWalletShitUi(wallet: string): Promise<number> {
  const key = wallet.toLowerCase();
  const hit = shitBalCache.get(key);
  if (hit && Date.now() - hit.at < 30_000) return hit.ui;
  const { SHIT_MINT, SHIT_DECIMALS } = await import("@/lib/shit-token");
  const HELIUS =
    process.env.HELIUS_RPC_URL ||
    "https://viviyan-bkj12u-fast-mainnet.helius-rpc.com";
  try {
    const res = await fetch(HELIUS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenAccountsByOwner",
        params: [
          wallet,
          { mint: SHIT_MINT },
          { encoding: "jsonParsed", commitment: "confirmed" },
        ],
      }),
      cache: "no-store",
    });
    const json = (await res.json()) as {
      result?: { value?: Array<{ account?: { data?: { parsed?: { info?: { tokenAmount?: { amount?: string; decimals?: number } } } } } }> };
    };
    let raw = 0;
    let decimals = SHIT_DECIMALS;
    for (const a of json?.result?.value || []) {
      const info = a?.account?.data?.parsed?.info?.tokenAmount;
      if (!info) continue;
      raw += Number(info.amount || 0);
      if (typeof info.decimals === "number") decimals = info.decimals;
    }
    const ui = raw / Math.pow(10, decimals);
    shitBalCache.set(key, { at: Date.now(), ui });
    return ui;
  } catch {
    return 0;
  }
}

/** Normalize hour key so leftover date-only rows never leak into the next hour. */
export function normalizeHourKey(raw: string): string {
  const s = String(raw || "").trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}$/.test(s)) return s;
  const t = Date.parse(s.includes("T") ? (s.endsWith("Z") ? s : s + "Z") : s + "T00:00:00.000Z");
  if (Number.isFinite(t)) return utcHourString(new Date(t));
  return utcHourString();
}

export async function countWalletPicks(
  utcDay: string,
  wallet: string
): Promise<number> {
  const hour = normalizeHourKey(utcDay);
  const r = await tursoExecute(
    `SELECT COUNT(*) FROM day_stakes
     WHERE utc_day = ? AND lower(wallet) = lower(?)`,
    [hour, wallet]
  );
  return Number(r.rows[0]?.[0] || 0);
}

export async function countWalletSidePicks(
  utcDay: string,
  wallet: string,
  side: DaySide
): Promise<number> {
  const hour = normalizeHourKey(utcDay);
  const r = await tursoExecute(
    `SELECT COUNT(*) FROM day_stakes
     WHERE utc_day = ? AND lower(wallet) = lower(?) AND side = ?`,
    [hour, wallet, side]
  );
  return Number(r.rows[0]?.[0] || 0);
}

export type MajorSnap = {
  assetId: string;
  price: number;
  volume24h: number;
  name: string;
  symbol: string;
  logo: string;
  source?: string;
  /** Tokens.xyz 1h change when hour-open pct unavailable */
  change1h?: number | null;
};

/**
 * Live majors with multi-source USD prices.
 * Meta: Tokens.xyz. Price: Pyth → Jupiter → CG → Dex → txyz.
 */
export async function fetchRealMajorsLive(): Promise<MajorSnap[]> {
  const { priceMajorsLive } = await import("@/lib/live-prices");
  const priced = await priceMajorsLive();
  return priced.map((m) => ({
    assetId: m.assetId,
    price: m.price,
    volume24h: m.volume24h,
    name: m.name,
    symbol: m.symbol,
    logo: m.logo,
    source: m.source,
    change1h: m.txyzChange1h ?? null,
  }));
}

export async function snapshotPrices(
  utcDay: string,
  phase: "open" | "close"
): Promise<number> {
  await ensureRound(utcDay);

  // OPEN must freeze once: re-running hourly must NOT overwrite hour baseline
  // (that made every live % read as 0 forever).
  if (phase === "open") {
    const existing = await tursoExecute(
      `SELECT COUNT(*) FROM day_prices WHERE utc_day = ? AND phase = 'open'`,
      [utcDay]
    );
    const n = Number(existing.rows[0]?.[0] || 0);
    if (n > 0) {
      return n;
    }
  }

  const majors = await fetchRealMajorsLive();
  const now = new Date().toISOString();
  for (const m of majors) {
    if (phase === "open") {
      // Insert-only for open — never clobber baseline
      await tursoExecute(
        `INSERT INTO day_prices
          (utc_day, phase, asset_id, price, volume24h, name, symbol, logo, snapped_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(utc_day, phase, asset_id) DO NOTHING`,
        [
          utcDay,
          phase,
          m.assetId,
          Number(m.price),
          Number(m.volume24h) || 0,
          m.name,
          m.symbol,
          m.logo,
          now,
        ]
      );
    } else {
      await tursoExecute(
        `INSERT INTO day_prices
          (utc_day, phase, asset_id, price, volume24h, name, symbol, logo, snapped_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(utc_day, phase, asset_id) DO UPDATE SET
           price = excluded.price,
           volume24h = excluded.volume24h,
           name = excluded.name,
           symbol = excluded.symbol,
           logo = excluded.logo,
           snapped_at = excluded.snapped_at`,
        [
          utcDay,
          phase,
          m.assetId,
          Number(m.price),
          Number(m.volume24h) || 0,
          m.name,
          m.symbol,
          m.logo,
          now,
        ]
      );
    }
  }
  const col = phase === "open" ? "open_snap_at" : "close_snap_at";
  if (phase === "open") {
    // Only set open_snap_at if still null
    await tursoExecute(
      `UPDATE day_rounds SET open_snap_at = COALESCE(open_snap_at, ?) WHERE utc_day = ?`,
      [now, utcDay]
    );
  } else {
    await tursoExecute(
      `UPDATE day_rounds SET ${col} = ? WHERE utc_day = ?`,
      [now, utcDay]
    );
  }
  return majors.length;
}

export async function getRound(utcDay: string) {
  await ensureRound(utcDay);
  const r = await tursoExecute(
    `SELECT utc_day, status, hit_pot, shit_pot, open_snap_at, close_snap_at,
            settled_at, hit_asset_id, shit_asset_id, hit_pct, shit_pct,
            hit_winner, shit_winner, hit_prize, shit_prize, hit_fee, shit_fee,
            hit_sig, shit_sig, hit_fee_sig, shit_fee_sig, meta
     FROM day_rounds WHERE utc_day = ?`,
    [utcDay]
  );
  const row = r.rows[0];
  if (!row) return null;
  return {
    utcDay: String(row[0]),
    status: String(row[1]),
    hitPot: Number(row[2] || 0),
    shitPot: Number(row[3] || 0),
    openSnapAt: row[4] ? String(row[4]) : null,
    closeSnapAt: row[5] ? String(row[5]) : null,
    settledAt: row[6] ? String(row[6]) : null,
    hitAssetId: row[7] ? String(row[7]) : null,
    shitAssetId: row[8] ? String(row[8]) : null,
    hitPct: row[9] != null ? Number(row[9]) : null,
    shitPct: row[10] != null ? Number(row[10]) : null,
    hitWinner: row[11] ? String(row[11]) : null,
    shitWinner: row[12] ? String(row[12]) : null,
    hitPrize: row[13] != null ? Number(row[13]) : null,
    shitPrize: row[14] != null ? Number(row[14]) : null,
    hitFee: row[15] != null ? Number(row[15]) : null,
    shitFee: row[16] != null ? Number(row[16]) : null,
    hitSig: row[17] ? String(row[17]) : null,
    shitSig: row[18] ? String(row[18]) : null,
    hitFeeSig: row[19] ? String(row[19]) : null,
    shitFeeSig: row[20] ? String(row[20]) : null,
    meta: row[21] ? String(row[21]) : null,
  };
}

export async function listStakes(utcDay: string, side?: DaySide) {
  await ensureDayGameSchema();
  if (side) {
    const r = await tursoExecute(
      `SELECT wallet, asset_id, side, amount, signature, twitter, created_at
       FROM day_stakes WHERE utc_day = ? AND side = ? ORDER BY id ASC`,
      [utcDay, side]
    );
    return r.rows.map((row) => ({
      wallet: String(row[0]),
      assetId: String(row[1]),
      side: String(row[2]) as DaySide,
      amount: Number(row[3]),
      signature: String(row[4]),
      twitter: row[5] ? String(row[5]) : null,
      createdAt: String(row[6] || ""),
    }));
  }
  const r = await tursoExecute(
    `SELECT wallet, asset_id, side, amount, signature, twitter, created_at
     FROM day_stakes WHERE utc_day = ? ORDER BY id ASC`,
    [utcDay]
  );
  return r.rows.map((row) => ({
    wallet: String(row[0]),
    assetId: String(row[1]),
    side: String(row[2]) as DaySide,
    amount: Number(row[3]),
    signature: String(row[4]),
    twitter: row[5] ? String(row[5]) : null,
    createdAt: String(row[6] || ""),
  }));
}

export type PastWinner = {
  utcHour: string;
  hourLabel: string;
  settledAt: string | null;
  assetId: string | null;
  symbol: string;
  name: string;
  logo: string;
  pct: number | null;
  winner: string | null; // wallet | SPLIT:N | null
  winners?: Array<{ wallet: string; tickets: number; amount: number; sig?: string | null }>;
  prize: number;
  fee: number;
  pot: number;
  sig: string | null;
  vrf: import("@/lib/day-vrf-links").VrfRecord | null;
  vrfLink: import("@/lib/day-vrf-links").VrfLink | null;
};

/** Past settled HIT or SHIT winners (newest first). */
export async function listPastWinners(
  side: DaySide,
  limit = 50
): Promise<PastWinner[]> {
  await ensureDayGameSchema();
  const lim = Math.min(100, Math.max(1, Math.floor(limit)));
  const isHit = side === "hit";
  const r = await tursoExecute(
    isHit
      ? `SELECT utc_day, settled_at, hit_asset_id, hit_pct, hit_winner, hit_prize, hit_fee, hit_pot, hit_sig, meta
         FROM day_rounds
         WHERE status = 'settled' AND hit_asset_id IS NOT NULL
         ORDER BY utc_day DESC
         LIMIT ${lim}`
      : `SELECT utc_day, settled_at, shit_asset_id, shit_pct, shit_winner, shit_prize, shit_fee, shit_pot, shit_sig, meta
         FROM day_rounds
         WHERE status = 'settled' AND shit_asset_id IS NOT NULL
         ORDER BY utc_day DESC
         LIMIT ${lim}`,
    []
  );

  const { vrfPrimaryLink } = await import("@/lib/day-vrf-links");
  const out: PastWinner[] = [];
  for (const row of r.rows) {
    const hour = String(row[0]);
    const assetId = row[2] ? String(row[2]) : null;
    let name = "";
    let symbol = "";
    let logo = "";
    if (assetId) {
      const m = await tursoExecute(
        `SELECT name, symbol, logo FROM day_prices
         WHERE utc_day = ? AND asset_id = ?
         ORDER BY CASE phase WHEN 'close' THEN 0 ELSE 1 END
         LIMIT 1`,
        [hour, assetId]
      );
      if (m.rows[0]) {
        name = String(m.rows[0][0] || "");
        symbol = String(m.rows[0][1] || "");
        logo = String(m.rows[0][2] || "");
      }
    }
    let vrf = null;
    try {
      const metaRaw = row[9] ? String(row[9]) : "";
      if (metaRaw) {
        const meta = JSON.parse(metaRaw);
        vrf = isHit ? meta.hitVrf || null : meta.shitVrf || null;
      }
    } catch {
      vrf = null;
    }
    let winnersList:
      | Array<{
          wallet: string;
          tickets: number;
          amount: number;
          sig?: string | null;
        }>
      | undefined;
    try {
      const metaRaw2 = row[9] ? String(row[9]) : "";
      if (metaRaw2) {
        const meta2 = JSON.parse(metaRaw2) as Record<string, unknown>;
        const raw = isHit ? meta2.hitWinners : meta2.shitWinners;
        if (Array.isArray(raw)) {
          winnersList = raw
            .map((x) => {
              const o = x as Record<string, unknown>;
              return {
                wallet: String(o.wallet || ""),
                tickets: Number(o.tickets || 0),
                amount: Number(o.amount || 0),
                sig: o.sig != null ? String(o.sig) : null,
              };
            })
            .filter((w) => w.wallet);
        }
        if (!winnersList?.length && vrf && typeof vrf === "object") {
          const shares = (vrf as { shares?: unknown }).shares;
          if (Array.isArray(shares)) {
            winnersList = shares
              .map((x) => {
                const o = x as Record<string, unknown>;
                return {
                  wallet: String(o.wallet || ""),
                  tickets: Number(o.tickets || 0),
                  amount: Number(o.amount || 0),
                  sig: null as string | null,
                };
              })
              .filter((w) => w.wallet);
          }
        }
      }
    } catch {
      /* */
    }
    out.push({
      utcHour: hour,
      hourLabel: formatHourLabel(hour),
      settledAt: row[1] ? String(row[1]) : null,
      assetId,
      symbol: symbol || assetId || "—",
      name,
      logo,
      pct: row[3] != null ? Number(row[3]) : null,
      winner: row[4] ? String(row[4]) : null,
      winners: winnersList,
      prize: Number(row[5] || 0),
      fee: Number(row[6] || 0),
      pot: Number(row[7] || 0),
      sig: row[8] ? String(row[8]) : null,
      vrf,
      vrfLink: vrfPrimaryLink(vrf),
    });
  }
  return out;
}

export type PeriodKey = "hour" | "day" | "week";

export type BoardAssetStat = {
  assetId: string;
  symbol: string;
  name: string;
  logo: string;
  wins: number;
  avgPct: number | null;
  bestPct: number | null;
  worstPct: number | null;
  totalPot: number;
  totalPrize: number;
};

export type BoardPeriodBucket = {
  /** hour key, YYYY-MM-DD, or YYYY-Www */
  key: string;
  label: string;
  rounds: number;
  hit: BoardAssetStat | null;
  shit: BoardAssetStat | null;
  /** top bags this period (ranked by wins then pot) */
  topHit: BoardAssetStat[];
  topShit: BoardAssetStat[];
};

function isoWeekKey(isoDay: string): { key: string; label: string } {
  // isoDay: YYYY-MM-DD
  const d = new Date(`${isoDay}T12:00:00.000Z`);
  if (!Number.isFinite(d.getTime())) {
    return { key: isoDay, label: isoDay };
  }
  // ISO week
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  const y = t.getUTCFullYear();
  const key = `${y}-W${String(week).padStart(2, "0")}`;
  return { key, label: `Week ${week}, ${y}` };
}

function periodBucketKey(
  utcHour: string,
  period: PeriodKey
): { key: string; label: string } {
  // utcHour: YYYY-MM-DDTHH
  if (period === "hour") {
    return { key: utcHour, label: formatHourLabel(utcHour) };
  }
  const day = utcHour.slice(0, 10);
  if (period === "day") {
    return { key: day, label: day };
  }
  return isoWeekKey(day);
}

type RoundSideSnap = {
  assetId: string;
  pct: number | null;
  pot: number;
  prize: number;
  symbol: string;
  name: string;
  logo: string;
};

async function loadAssetMetaForRound(
  hour: string,
  assetId: string,
  cache: Map<string, { symbol: string; name: string; logo: string }>
): Promise<{ symbol: string; name: string; logo: string }> {
  const ck = `${hour}::${assetId}`;
  const hit = cache.get(ck);
  if (hit) return hit;
  const m = await tursoExecute(
    `SELECT name, symbol, logo FROM day_prices
     WHERE utc_day = ? AND asset_id = ?
     ORDER BY CASE phase WHEN 'close' THEN 0 ELSE 1 END
     LIMIT 1`,
    [hour, assetId]
  );
  const meta = m.rows[0]
    ? {
        name: String(m.rows[0][0] || ""),
        symbol: String(m.rows[0][1] || assetId),
        logo: String(m.rows[0][2] || ""),
      }
    : { name: assetId, symbol: assetId, logo: "" };
  cache.set(ck, meta);
  return meta;
}

function accumulate(
  map: Map<string, BoardAssetStat & { pctSum: number; pctN: number }>,
  snap: RoundSideSnap
) {
  const prev = map.get(snap.assetId);
  const pct = snap.pct != null && Number.isFinite(snap.pct) ? snap.pct : null;
  if (!prev) {
    map.set(snap.assetId, {
      assetId: snap.assetId,
      symbol: snap.symbol,
      name: snap.name,
      logo: snap.logo,
      wins: 1,
      avgPct: pct,
      bestPct: pct,
      worstPct: pct,
      totalPot: snap.pot,
      totalPrize: snap.prize,
      pctSum: pct ?? 0,
      pctN: pct != null ? 1 : 0,
    });
    return;
  }
  prev.wins += 1;
  prev.totalPot += snap.pot;
  prev.totalPrize += snap.prize;
  if (pct != null) {
    prev.pctSum += pct;
    prev.pctN += 1;
    prev.avgPct = prev.pctSum / prev.pctN;
    prev.bestPct =
      prev.bestPct == null ? pct : Math.max(prev.bestPct, pct);
    prev.worstPct =
      prev.worstPct == null ? pct : Math.min(prev.worstPct, pct);
  }
  if (!prev.logo && snap.logo) prev.logo = snap.logo;
  if (snap.symbol) prev.symbol = snap.symbol;
  if (snap.name) prev.name = snap.name;
}

function rankStats(
  map: Map<string, BoardAssetStat & { pctSum: number; pctN: number }>
): BoardAssetStat[] {
  return [...map.values()]
    .map(({ pctSum: _s, pctN: _n, ...rest }) => rest)
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.totalPot !== a.totalPot) return b.totalPot - a.totalPot;
      return (b.avgPct ?? -Infinity) - (a.avgPct ?? -Infinity);
    });
}

/**
 * HIT + SHIT boards for hour / day / week.
 * - hour: each settled round is its own bucket
 * - day / week: bags ranked by # of hours won in that period
 */
export async function getHitShitPeriodBoards(
  period: PeriodKey,
  limitBuckets = 24
): Promise<{
  period: PeriodKey;
  buckets: BoardPeriodBucket[];
  /** flat top bags across the whole window */
  overallHit: BoardAssetStat[];
  overallShit: BoardAssetStat[];
  roundsScanned: number;
}> {
  await ensureDayGameSchema();
  const lim = Math.min(
    period === "week" ? 336 : 720,
    Math.max(
      24,
      Math.floor(limitBuckets) *
        (period === "hour" ? 1 : period === "day" ? 24 : 48)
    )
  );
  const r = await tursoExecute(
    `SELECT utc_day, settled_at,
            hit_asset_id, hit_pct, hit_pot, hit_prize,
            shit_asset_id, shit_pct, shit_pot, shit_prize
     FROM day_rounds
     WHERE status = 'settled'
       AND (hit_asset_id IS NOT NULL OR shit_asset_id IS NOT NULL)
     ORDER BY utc_day DESC
     LIMIT ${lim}`,
    []
  );

  // Prefetch metas for all assets in one query when possible
  const hourIds = r.rows.map((row) => String(row[0] || "")).filter(Boolean);
  const metaCache = new Map<
    string,
    { symbol: string; name: string; logo: string }
  >();
  if (hourIds.length) {
    // chunk IN list
    const uniqHours = [...new Set(hourIds)].slice(0, 200);
    for (let i = 0; i < uniqHours.length; i += 40) {
      const chunk = uniqHours.slice(i, i + 40);
      const ph = chunk.map(() => "?").join(",");
      try {
        const mr = await tursoExecute(
          `SELECT utc_day, asset_id, name, symbol, logo, phase FROM day_prices
           WHERE utc_day IN (${ph})
             AND phase IN ('close', 'open')`,
          chunk
        );
        // prefer close over open
        const best = new Map<string, { phase: string; meta: { name: string; symbol: string; logo: string } }>();
        for (const row of mr.rows) {
          const h = String(row[0] || "");
          const id = String(row[1] || "");
          const phase = String(row[5] || "");
          const key = `${h}::${id}`;
          const meta = {
            name: String(row[2] || ""),
            symbol: String(row[3] || id),
            logo: String(row[4] || ""),
          };
          const prev = best.get(key);
          if (!prev || (phase === "close" && prev.phase !== "close")) {
            best.set(key, { phase, meta });
          }
        }
        for (const [k, v] of best) metaCache.set(k, v.meta);
      } catch {
        /* fall back to per-row */
      }
    }
  }

  type BucketAcc = {
    key: string;
    label: string;
    rounds: number;
    hitMap: Map<string, BoardAssetStat & { pctSum: number; pctN: number }>;
    shitMap: Map<string, BoardAssetStat & { pctSum: number; pctN: number }>;
  };

  const buckets = new Map<string, BucketAcc>();
  const overallHit = new Map<
    string,
    BoardAssetStat & { pctSum: number; pctN: number }
  >();
  const overallShit = new Map<
    string,
    BoardAssetStat & { pctSum: number; pctN: number }
  >();

  let roundsScanned = 0;
  for (const row of r.rows) {
    const hour = String(row[0] || "");
    if (!hour) continue;
    roundsScanned++;
    const { key, label } = periodBucketKey(hour, period);
    let b = buckets.get(key);
    if (!b) {
      if (buckets.size >= limitBuckets) continue;
      b = {
        key,
        label,
        rounds: 0,
        hitMap: new Map(),
        shitMap: new Map(),
      };
      buckets.set(key, b);
    }
    b.rounds += 1;

    const hitId = row[2] ? String(row[2]) : null;
    const shitId = row[6] ? String(row[6]) : null;

    if (hitId) {
      const meta = await loadAssetMetaForRound(hour, hitId, metaCache);
      const snap: RoundSideSnap = {
        assetId: hitId,
        pct: row[3] != null ? Number(row[3]) : null,
        pot: Number(row[4] || 0),
        prize: Number(row[5] || 0),
        ...meta,
      };
      accumulate(b.hitMap, snap);
      accumulate(overallHit, snap);
    }
    if (shitId) {
      const meta = await loadAssetMetaForRound(hour, shitId, metaCache);
      const snap: RoundSideSnap = {
        assetId: shitId,
        pct: row[7] != null ? Number(row[7]) : null,
        pot: Number(row[8] || 0),
        prize: Number(row[9] || 0),
        ...meta,
      };
      accumulate(b.shitMap, snap);
      accumulate(overallShit, snap);
    }
  }

  const bucketList: BoardPeriodBucket[] = [...buckets.values()].map((b) => {
    const topHit = rankStats(b.hitMap);
    const topShit = rankStats(b.shitMap);
    return {
      key: b.key,
      label: b.label,
      rounds: b.rounds,
      hit: topHit[0] || null,
      shit: topShit[0] || null,
      topHit: topHit.slice(0, 8),
      topShit: topShit.slice(0, 8),
    };
  });

  // hour period: already newest first from query; day/week map insertion is newest first
  return {
    period,
    buckets: bucketList,
    overallHit: rankStats(overallHit).slice(0, 15),
    overallShit: rankStats(overallShit).slice(0, 15),
    roundsScanned,
  };
}

/** Verify user sent DAY_STAKE_AMOUNT TOKENSHIT to play pot (escrow) */
export async function verifyStakeTransfer(opts: {
  signature: string;
  wallet: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { SHIT_MINT, shitToRaw } = await import("@/lib/shit-token");
  const need = shitToRaw(DAY_STAKE_AMOUNT).toString();
  try {
    const tx = await rpc<{
      meta?: {
        err?: unknown;
        postTokenBalances?: Array<{
          mint: string;
          owner?: string;
          uiTokenAmount?: { amount?: string };
        }>;
        preTokenBalances?: Array<{
          mint: string;
          owner?: string;
          uiTokenAmount?: { amount?: string };
        }>;
      };
      transaction?: {
        message?: { accountKeys?: Array<string | { pubkey: string }> };
      };
    }>("getTransaction", [
      opts.signature,
      {
        encoding: "jsonParsed",
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      },
    ]);
    if (!tx) return { ok: false, error: "Transaction not found yet — retry" };
    if (tx.meta?.err) return { ok: false, error: "Transaction failed on-chain" };

    const pre = tx.meta?.preTokenBalances || [];
    const post = tx.meta?.postTokenBalances || [];
    // Stakes MUST land on play pot (rev…). Claims treasury is not a valid sink.
    const sink = PLAY_POT_ADDRESS;

    const preT =
      pre.find((b) => b.mint === SHIT_MINT && b.owner === sink)
        ?.uiTokenAmount?.amount || "0";
    const postT =
      post.find((b) => b.mint === SHIT_MINT && b.owner === sink)
        ?.uiTokenAmount?.amount || "0";
    const potDelta = BigInt(postT) - BigInt(preT);
    if (potDelta < BigInt(need)) {
      const preU =
        pre.find((b) => b.mint === SHIT_MINT && b.owner === opts.wallet)
          ?.uiTokenAmount?.amount || "0";
      const postU =
        post.find((b) => b.mint === SHIT_MINT && b.owner === opts.wallet)
          ?.uiTokenAmount?.amount || "0";
      const userDelta = BigInt(preU) - BigInt(postU);
      if (userDelta < BigInt(need)) {
        return {
          ok: false,
          error: `Need ${DAY_STAKE_AMOUNT} $TOKENSHIT to play pot`,
        };
      }
      return {
        ok: false,
        error: `Play must send ${DAY_STAKE_AMOUNT} $TOKENSHIT to pot ${sink.slice(0, 8)}…`,
      };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function recordStake(opts: {
  utcDay: string;
  wallet: string;
  assetId: string;
  side: DaySide;
  signature?: string;
  twitter?: string | null;
}): Promise<
  | {
      ok: true;
      hitPot: number;
      shitPot: number;
      ticketCount: number;
      freePlay: boolean;
      picksUsed: number;
      maxPicks: number;
    }
  | { ok: false; error: string; status: number }
> {
  if (!DAY_GAME_ENABLED) {
    return { ok: false, error: "Day game paused", status: 503 };
  }
  await ensureRound(opts.utcDay);
  const hour = FREE_PLAY ? normalizeHourKey(opts.utcDay) : opts.utcDay;
  const round = await getRound(hour);
  if (!round || round.status !== "open") {
    return { ok: false, error: "Round not open for play", status: 400 };
  }

  if (FREE_PLAY) {
    const { fetchMajorsUniverse } = await import("@/lib/live-prices");
    const uni = await fetchMajorsUniverse();
    if (!uni.some((u) => u.assetId === opts.assetId)) {
      return {
        ok: false,
        error: "Play is majors only — pick a bag on the board",
        status: 400,
      };
    }
    const tw = (opts.twitter || "").replace(/^@/, "").trim();
    const [sideUsed, dup, bal, followOk] = await Promise.all([
      countWalletSidePicks(hour, opts.wallet, opts.side),
      tursoExecute(
        `SELECT id FROM day_stakes
         WHERE utc_day = ? AND lower(wallet) = lower(?) AND asset_id = ? LIMIT 1`,
        [hour, opts.wallet, opts.assetId]
      ),
      getWalletShitUi(opts.wallet),
      (async (): Promise<boolean> => {
        if (!PLAY_REQUIRE_FOLLOW) return true;
        if (!tw) return false;
        const { hasClaimed } = await import("@/lib/claims");
        if (await hasClaimed("x_follow", { twitter: tw, wallet: opts.wallet })) {
          return true;
        }
        // Live X only if they never claimed Follow — otherwise we wait on dead APIs
        try {
          const { checkXFollowsTokenshit } = await import("@/lib/x-data");
          const live = await Promise.race([
            checkXFollowsTokenshit(tw),
            new Promise<{ ok: boolean; following: boolean }>((resolve) =>
              setTimeout(() => resolve({ ok: false, following: false }), 2500)
            ),
          ]);
          return !!(live.ok && live.following);
        } catch {
          return false;
        }
      })(),
    ]);

    if (sideUsed >= PLAY_MAX_PER_SIDE) {
      const label = opts.side === "hit" ? "UP" : "DOWN";
      return {
        ok: false,
        error: `Already used your 1 ${label} this hour — pick the other side or wait for the next hour`,
        status: 400,
      };
    }
    if (dup.rows.length) {
      return {
        ok: false,
        error: "Already played this token this hour — pick another bag",
        status: 409,
      };
    }
    if (bal < PLAY_MIN_BALANCE) {
      return {
        ok: false,
        error: `Hold at least ${PLAY_MIN_BALANCE.toLocaleString()} $TOKENSHIT to play (have ${Math.floor(bal).toLocaleString()}). Claim or buy — don't dump.`,
        status: 403,
      };
    }
    if (PLAY_REQUIRE_FOLLOW && !followOk) {
      if (!tw) {
        return {
          ok: false,
          error: "Sign in with X and follow @Tokenshit_ to play",
          status: 403,
        };
      }
      return {
        ok: false,
        error:
          "Follow @Tokenshit_ and claim Follow on /claim first — required to Play",
        status: 403,
      };
    }

    // Open snap in background — do not block lock on live prices
    void ensureOpenSnapForAsset(hour, opts.assetId).catch(() => {});

    const signature =
      opts.signature?.trim() ||
      `free:${hour}:${opts.wallet.toLowerCase()}:${opts.assetId}:${opts.side}`;

    try {
      await tursoExecute(
        `INSERT INTO day_stakes (utc_day, wallet, asset_id, side, amount, signature, twitter)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          hour,
          opts.wallet,
          opts.assetId,
          opts.side,
          0,
          signature,
          opts.twitter || null,
        ]
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/unique|UNIQUE/i.test(msg)) {
        return { ok: false, error: "Already locked this pick", status: 409 };
      }
      return { ok: false, error: msg, status: 500 };
    }

    const prize = HOUR_PRIZE;
    const half = Math.floor(prize / 2);
    return {
      ok: true,
      hitPot: half,
      shitPot: prize - half,
      ticketCount: 1,
      freePlay: true,
      picksUsed: sideUsed + 1 + (opts.side === "hit" ? 0 : 0),
      maxPicks: PLAY_MAX_PICKS,
    };
  }

  // Freeze open price on first play of this bag (legacy paid)
  const openOk = await ensureOpenSnapForAsset(opts.utcDay, opts.assetId);
  if (!openOk) {
    return {
      ok: false,
      error: "Could not price this bag yet — try another or wait a moment",
      status: 400,
    };
  }

  // Legacy paid stake path (disabled when FREE_PLAY)
  if (!opts.signature || opts.signature.length < 40) {
    return { ok: false, error: "on-chain transfer signature required", status: 400 };
  }
  const ver = await verifyStakeTransfer({
    signature: opts.signature,
    wallet: opts.wallet,
  });
  if (!ver.ok) return { ok: false, error: ver.error, status: 400 };

  try {
    await tursoExecute(
      `INSERT INTO day_stakes (utc_day, wallet, asset_id, side, amount, signature, twitter)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        opts.utcDay,
        opts.wallet,
        opts.assetId,
        opts.side,
        1_000,
        opts.signature,
        opts.twitter || null,
      ]
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/unique|UNIQUE/i.test(msg)) {
      return { ok: false, error: "Signature already used", status: 409 };
    }
    return { ok: false, error: msg, status: 500 };
  }

  const col = opts.side === "hit" ? "hit_pot" : "shit_pot";
  await tursoExecute(
    `UPDATE day_rounds SET ${col} = ${col} + ? WHERE utc_day = ?`,
    [1_000, opts.utcDay]
  );
  const updated = await getRound(opts.utcDay);
  const tc = await tursoExecute(
    `SELECT COUNT(*) FROM day_stakes
     WHERE utc_day = ? AND wallet = ? AND asset_id = ? AND side = ?`,
    [opts.utcDay, opts.wallet, opts.assetId, opts.side]
  );
  return {
    ok: true,
    hitPot: updated?.hitPot || 0,
    shitPot: updated?.shitPot || 0,
    ticketCount: Number(tc.rows[0]?.[0] || 1),
    freePlay: false,
    picksUsed: await countWalletPicks(opts.utcDay, opts.wallet),
    maxPicks: 999,
  };
}

/** Lazy open snap — freeze price when bag is first played or entered. */
export async function ensureOpenSnapForAsset(
  utcDay: string,
  assetId: string
): Promise<boolean> {
  await ensureRound(utcDay);
  const existing = await tursoExecute(
    `SELECT price FROM day_prices WHERE utc_day = ? AND phase = 'open' AND asset_id = ? LIMIT 1`,
    [utcDay, assetId]
  );
  if (existing.rows.length) return true;

  const { priceAssetById } = await import("@/lib/live-prices");
  const priced = await priceAssetById(assetId);
  if (!priced || !(priced.price > 0)) return false;

  const now = new Date().toISOString();
  await tursoExecute(
    `INSERT INTO day_prices
      (utc_day, phase, asset_id, price, volume24h, name, symbol, logo, snapped_at)
     VALUES (?, 'open', ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(utc_day, phase, asset_id) DO NOTHING`,
    [
      utcDay,
      assetId,
      Number(priced.price),
      Number(priced.volume24h) || 0,
      priced.name,
      priced.symbol,
      priced.logo,
      now,
    ]
  );
  // mark open snap time if empty
  await tursoExecute(
    `UPDATE day_rounds SET open_snap_at = COALESCE(open_snap_at, ?) WHERE utc_day = ?`,
    [now, utcDay]
  );
  return true;
}

/** Per-wallet ticket counts this hour (multi-play). */

/** Plays = stake rows; players = unique wallets for the hour. */
export async function getHourPlayStats(utcHour: string): Promise<{
  plays: number;
  players: number;
  hitPlays: number;
  shitPlays: number;
  hitPlayers: number;
  shitPlayers: number;
}> {
  await ensureDayGameSchema();
  const r = await tursoExecute(
    `SELECT
       COUNT(*) as plays,
       COUNT(DISTINCT wallet) as players,
       SUM(CASE WHEN side = 'hit' THEN 1 ELSE 0 END) as hit_plays,
       SUM(CASE WHEN side = 'shit' THEN 1 ELSE 0 END) as shit_plays,
       COUNT(DISTINCT CASE WHEN side = 'hit' THEN wallet END) as hit_players,
       COUNT(DISTINCT CASE WHEN side = 'shit' THEN wallet END) as shit_players
     FROM day_stakes WHERE utc_day = ?`,
    [utcHour]
  );
  const row = r.rows[0] || [];
  return {
    plays: Number(row[0] || 0),
    players: Number(row[1] || 0),
    hitPlays: Number(row[2] || 0),
    shitPlays: Number(row[3] || 0),
    hitPlayers: Number(row[4] || 0),
    shitPlayers: Number(row[5] || 0),
  };
}

export async function getMyTickets(
  utcDay: string,
  wallet: string
): Promise<Array<{ assetId: string; side: DaySide; tickets: number }>> {
  if (!wallet) return [];
  const r = await tursoExecute(
    `SELECT asset_id, side, COUNT(*) as n
     FROM day_stakes
     WHERE utc_day = ? AND lower(wallet) = lower(?)
     GROUP BY asset_id, side
     ORDER BY n DESC`,
    [utcDay, wallet]
  );
  return (r.rows || []).map((row) => ({
    assetId: String(row[0]),
    side: String(row[1]) as DaySide,
    tickets: Number(row[2] || 0),
  }));
}

/**
 * Ticket counts per asset this hour (for bag badges).
 */
export async function getTicketHeat(
  utcDay: string
): Promise<Map<string, { hit: number; shit: number }>> {
  const r = await tursoExecute(
    `SELECT asset_id, side, COUNT(*) FROM day_stakes
     WHERE utc_day = ?
     GROUP BY asset_id, side`,
    [utcDay]
  );
  const m = new Map<string, { hit: number; shit: number }>();
  for (const row of r.rows || []) {
    const id = String(row[0]);
    const side = String(row[1]);
    const n = Number(row[2] || 0);
    const cur = m.get(id) || { hit: 0, shit: 0 };
    if (side === "hit") cur.hit = n;
    else if (side === "shit") cur.shit = n;
    m.set(id, cur);
  }
  return m;
}

type PriceRow = {
  assetId: string;
  price: number;
  volume24h: number;
  name: string;
  symbol: string;
  logo: string;
};

async function loadPhase(
  utcDay: string,
  phase: "open" | "close"
): Promise<Map<string, PriceRow>> {
  const r = await tursoExecute(
    `SELECT asset_id, price, volume24h, name, symbol, logo FROM day_prices
     WHERE utc_day = ? AND phase = ?`,
    [utcDay, phase]
  );
  const m = new Map<string, PriceRow>();
  for (const row of r.rows) {
    m.set(String(row[0]), {
      assetId: String(row[0]),
      price: Number(row[1]),
      volume24h: Number(row[2] || 0),
      name: String(row[3] || ""),
      symbol: String(row[4] || ""),
      logo: String(row[5] || ""),
    });
  }
  return m;
}

/** Bags from open snap when live price APIs are slow/down */
export async function majorsFromOpenSnap(
  utcHour: string
): Promise<MajorSnap[]> {
  const open = await loadPhase(utcHour, "open");
  const out: MajorSnap[] = [];
  for (const row of open.values()) {
    if (!(row.price > 0)) continue;
    out.push({
      assetId: row.assetId,
      price: row.price,
      volume24h: row.volume24h || 0,
      name: row.name || row.symbol || row.assetId,
      symbol: row.symbol || row.assetId,
      logo: row.logo || "",
      source: "open-snap",
    });
  }
  return out;
}

/** Tie-break: higher volume24h only (close snapshot volume). */
function pickExtreme(
  moves: Array<{ assetId: string; pct: number; volume24h: number }>,
  mode: "max" | "min"
): { assetId: string; pct: number } | null {
  if (!moves.length) return null;
  const sorted = [...moves].sort((a, b) => {
    if (mode === "max") {
      if (b.pct !== a.pct) return b.pct - a.pct;
    } else {
      if (a.pct !== b.pct) return a.pct - b.pct;
    }
    // volume only tie-break (higher volume wins)
    return b.volume24h - a.volume24h;
  });
  const top = sorted[0]!;
  return { assetId: top.assetId, pct: top.pct };
}

function pickWindow(
  moves: Array<{ assetId: string; pct: number; volume24h: number }>,
  mode: "max" | "min",
  n: number
): Array<{ assetId: string; pct: number }> {
  if (!moves.length || n <= 0) return [];
  const sorted = [...moves].sort((a, b) => {
    if (mode === "max") {
      if (b.pct !== a.pct) return b.pct - a.pct;
    } else {
      if (a.pct !== b.pct) return a.pct - b.pct;
    }
    return b.volume24h - a.volume24h;
  });
  return sorted.slice(0, n).map((m) => ({ assetId: m.assetId, pct: m.pct }));
}

/** Detect stale/flat price board (all majors frozen). */
export function isPriceBoardHealthy(
  moves: Array<{ pct: number }>
): { ok: boolean; nearZeroRatio: number; spread: number; n: number } {
  const n = moves.length;
  if (n < 3) return { ok: false, nearZeroRatio: 1, spread: 0, n };
  let nearZero = 0;
  let min = Infinity;
  let max = -Infinity;
  for (const m of moves) {
    if (Math.abs(m.pct) < 0.05) nearZero++;
    if (m.pct < min) min = m.pct;
    if (m.pct > max) max = m.pct;
  }
  const nearZeroRatio = nearZero / n;
  const spread = max - min;
  // Unhealthy if almost everything is flat OR total spread is noise
  const ok = !(nearZeroRatio >= 0.7 && spread < 0.25) && !(spread < 0.08 && n >= 5);
  return { ok, nearZeroRatio, spread, n };
}

function computeMovesFromSnaps(
  openM: Map<string, PriceRow>,
  closeM: Map<string, PriceRow>
): Array<{ assetId: string; pct: number; volume24h: number }> {
  const moves: Array<{ assetId: string; pct: number; volume24h: number }> = [];
  for (const [id, o] of openM) {
    const c = closeM.get(id);
    if (!c || o.price <= 0 || c.price <= 0) continue;
    // Guard absurd open/close ratio (bad pair / wrong mint)
    const ratio = c.price / o.price;
    if (!(ratio >= 0.35 && ratio <= 2.8)) {
      moves.push({
        assetId: id,
        pct: 0,
        volume24h: c.volume24h || o.volume24h || 0,
      });
      continue;
    }
    const pct = ((c.price - o.price) / o.price) * 100;
    moves.push({
      assetId: id,
      pct,
      volume24h: c.volume24h || o.volume24h || 0,
    });
  }
  return moves;
}

/**
 * Re-fetch close snapshot when board looks frozen.
 * Returns moves after retries.
 */
async function loadMovesWithCloseRetry(
  utcDay: string,
  openM: Map<string, PriceRow>
): Promise<{
  moves: Array<{ assetId: string; pct: number; volume24h: number }>;
  closeM: Map<string, PriceRow>;
  retries: number;
  healthy: ReturnType<typeof isPriceBoardHealthy>;
}> {
  let closeM = await loadPhase(utcDay, "close");
  if (closeM.size === 0) {
    await snapshotPrices(utcDay, "close");
    closeM = await loadPhase(utcDay, "close");
  }

  let moves = computeMovesFromSnaps(openM, closeM);
  let healthy = isPriceBoardHealthy(moves);
  let retries = 0;

  while (!healthy.ok && retries < 3) {
    retries++;
    await tursoExecute(
      `DELETE FROM day_prices WHERE utc_day = ? AND phase = 'close'`,
      [utcDay]
    );
    await tursoExecute(
      `UPDATE day_rounds SET close_snap_at = NULL WHERE utc_day = ?`,
      [utcDay]
    );
    // brief backoff via loop cost; CF has no sleep guarantee — snapshot is enough
    await snapshotPrices(utcDay, "close");
    closeM = await loadPhase(utcDay, "close");
    moves = computeMovesFromSnaps(openM, closeM);
    healthy = isPriceBoardHealthy(moves);
  }

  return { moves, closeM, retries, healthy };
}

export type LiveLeader = {
  assetId: string;
  name: string;
  symbol: string;
  logo: string;
  openPrice: number;
  price: number;
  pct: number;
  volume24h: number;
};

/**
 * Live HIT (best %) / SHIT (worst %) vs hour open snapshot.
 * Auto-takes open snap if missing.
 */
export async function getLiveLeaders(utcHour: string): Promise<{
  hitting: LiveLeader | null;
  shitting: LiveLeader | null;
  topHit: LiveLeader[];
  topShit: LiveLeader[];
  /** All compared majors with live hour % */
  moves: LiveLeader[];
  openCount: number;
  liveCount: number;
  compared: number;
}> {
  await ensureRound(utcHour);
  let openM = await loadPhase(utcHour, "open");
  if (openM.size === 0) {
    await snapshotPrices(utcHour, "open");
    openM = await loadPhase(utcHour, "open");
  }

  let live = await fetchRealMajorsLive();
  const liveById = new Map(live.map((m) => [m.assetId, m]));

  // If open snap is thin vs live universe (e.g. old 2-asset freeze), fill missing
  // assets at current live price as open (late joiners) OR full rebase if tiny.
  if (live.length >= 8 && openM.size > 0 && openM.size < Math.min(8, Math.floor(live.length * 0.35))) {
    // Full rebase — open was incomplete
    await tursoExecute(
      `DELETE FROM day_prices WHERE utc_day = ? AND phase = 'open'`,
      [utcHour]
    );
    await tursoExecute(
      `UPDATE day_rounds SET open_snap_at = NULL WHERE utc_day = ?`,
      [utcHour]
    );
    await snapshotPrices(utcHour, "open");
    openM = await loadPhase(utcHour, "open");
    live = await fetchRealMajorsLive();
    liveById.clear();
    for (const m of live) liveById.set(m.assetId, m);
  } else if (live.length > openM.size + 3) {
    // Insert-only fill for assets missing from open
    const now = new Date().toISOString();
    for (const m of live) {
      if (openM.has(m.assetId) || !(m.price > 0)) continue;
      await tursoExecute(
        `INSERT INTO day_prices
          (utc_day, phase, asset_id, price, volume24h, name, symbol, logo, snapped_at)
         VALUES (?, 'open', ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(utc_day, phase, asset_id) DO NOTHING`,
        [
          utcHour,
          m.assetId,
          m.price,
          m.volume24h || 0,
          m.name || "",
          m.symbol || "",
          m.logo || "",
          now,
        ]
      );
    }
    openM = await loadPhase(utcHour, "open");
  }

  // If open was frozen on bad external feeds while live has
  // real divergence (or vice versa: all flat while multi-source moved),
  // re-baseline open once this hour.
  if (openM.size > 0 && live.length > 0) {
    let compared = 0;
    let nearZero = 0;
    let bigDiv = 0;
    for (const [id, o] of openM) {
      const L = liveById.get(id);
      if (!L || o.price <= 0 || L.price <= 0) continue;
      compared++;
      const abs = Math.abs((L.price - o.price) / o.price) * 100;
      if (abs < 0.03) nearZero++;
      if (abs >= 0.05) bigDiv++;
    }
    const shouldRebase =
      compared >= 5 &&
      ((nearZero / compared >= 0.75 && bigDiv >= 2) ||
        nearZero / compared >= 0.95);
    if (shouldRebase) {
      await tursoExecute(
        `DELETE FROM day_prices WHERE utc_day = ? AND phase = 'open'`,
        [utcHour]
      );
      await tursoExecute(
        `UPDATE day_rounds SET open_snap_at = NULL WHERE utc_day = ?`,
        [utcHour]
      );
      await snapshotPrices(utcHour, "open");
      openM = await loadPhase(utcHour, "open");
      live = await fetchRealMajorsLive();
      liveById.clear();
      for (const m of live) liveById.set(m.assetId, m);
    }
  }

  type Move = LiveLeader;
  const moves: Move[] = [];
  for (const [id, o] of openM) {
    if (o.price <= 0) continue;
    const L = liveById.get(id);
    if (!L || L.price <= 0) continue;
    // Guard: reject live prices that are absurd vs open (bad Dex pair, etc.)
    // e.g. SOL open $75 live $0.008 → −99.99%
    const ratio = L.price / o.price;
    if (!(ratio >= 0.35 && ratio <= 2.8)) {
      // Prefer open as "flat" rather than crown a garbage SHIT leader
      moves.push({
        assetId: id,
        name: L.name || o.name || id,
        symbol: L.symbol || o.symbol || "",
        logo: L.logo || "",
        openPrice: o.price,
        price: o.price,
        pct: 0,
        volume24h: L.volume24h || o.volume24h || 0,
      });
      continue;
    }
    const pct = ((L.price - o.price) / o.price) * 100;
    moves.push({
      assetId: id,
      name: L.name || o.name || id,
      symbol: L.symbol || o.symbol || "",
      logo: L.logo || "",
      openPrice: o.price,
      price: L.price,
      pct,
      volume24h: L.volume24h || o.volume24h || 0,
    });
  }

  const byHit = [...moves].sort((a, b) => {
    if (b.pct !== a.pct) return b.pct - a.pct;
    return b.volume24h - a.volume24h;
  });
  const byShit = [...moves].sort((a, b) => {
    if (a.pct !== b.pct) return a.pct - b.pct;
    return b.volume24h - a.volume24h;
  });

  // Never show the same bag as both HIT and SHIT when the board is flat
  let hitting = byHit[0] || null;
  let shitting = byShit[0] || null;
  if (
    hitting &&
    shitting &&
    hitting.assetId === shitting.assetId &&
    byShit.length > 1
  ) {
    shitting = byShit[1];
  }
  if (
    hitting &&
    shitting &&
    hitting.assetId === shitting.assetId &&
    byHit.length > 1
  ) {
    hitting = byHit[1];
  }

  return {
    hitting,
    shitting,
    topHit: byHit.slice(0, 5),
    topShit: byShit.slice(0, 5),
    moves,
    openCount: openM.size,
    liveCount: live.length,
    compared: moves.length,
  };
}

export async function settleDay(
  utcDay: string,
  opts?: { force?: boolean }
): Promise<{
  ok: boolean;
  error?: string;
  result?: Record<string, unknown>;
}> {
  if (!DAY_GAME_ENABLED) return { ok: false, error: "Day game paused" };
  await ensureRound(utcDay);
  const round = await getRound(utcDay);
  if (!round) return { ok: false, error: "no round" };
  if (round.status === "settled") {
    // Allow force re-rank only when no prizes left the pot (safe retry)
    const paidOut =
      (round.hitPrize && round.hitPrize > 0 && round.hitWinner) ||
      (round.shitPrize && round.shitPrize > 0 && round.shitWinner);
    if (!opts?.force || paidOut) {
      return { ok: true, result: { already: true, utcDay, paidOut: !!paidOut } };
    }
    // Reset status for re-settle of bag winners only
    await tursoExecute(
      `UPDATE day_rounds SET status = 'open', settled_at = NULL,
         hit_asset_id = NULL, shit_asset_id = NULL, hit_pct = NULL, shit_pct = NULL,
         hit_winner = NULL, shit_winner = NULL, hit_prize = NULL, shit_prize = NULL,
         hit_fee = NULL, shit_fee = NULL, hit_sig = NULL, shit_sig = NULL,
         hit_fee_sig = NULL, shit_fee_sig = NULL, close_snap_at = NULL
       WHERE utc_day = ?`,
      [utcDay]
    );
    await tursoExecute(
      `DELETE FROM day_prices WHERE utc_day = ? AND phase = 'close'`,
      [utcDay]
    );
  }

  // Ensure snapshots
  let openM = await loadPhase(utcDay, "open");
  if (openM.size === 0) {
    await snapshotPrices(utcDay, "open");
    openM = await loadPhase(utcDay, "open");
  }

  const loaded = await loadMovesWithCloseRetry(utcDay, openM);
  const { fetchMajorsUniverse } = await import("@/lib/live-prices");
  const allowed = new Set((await fetchMajorsUniverse()).map((u) => u.assetId));
  const moves =
    allowed.size > 0
      ? loaded.moves.filter((m) => allowed.has(m.assetId))
      : loaded.moves;
  const priceRetries = loaded.retries;
  const boardHealth = loaded.healthy;

  const hitBag = pickExtreme(moves, "max");
  let shitBag = pickExtreme(moves, "min");
  // Flat board: don't crown the same asset HIT and SHIT
  if (hitBag && shitBag && hitBag.assetId === shitBag.assetId) {
    const sortedAsc = [...moves].sort((a, b) => {
      if (a.pct !== b.pct) return a.pct - b.pct;
      return b.volume24h - a.volume24h;
    });
    const alt = sortedAsc.find((m) => m.assetId !== hitBag.assetId);
    if (alt) shitBag = { assetId: alt.assetId, pct: alt.pct };
  }

  const hitWindow = pickWindow(moves, "max", PLAY_WIN_WINDOW);
  let shitWindow = pickWindow(moves, "min", PLAY_WIN_WINDOW);
  if (hitBag) {
    shitWindow = shitWindow.filter((w) => w.assetId !== hitBag.assetId);
  }
  const hitIds = new Set(hitWindow.map((w) => w.assetId));
  const shitIds = new Set(shitWindow.map((w) => w.assetId));

  const hitStakes = await listStakes(utcDay, "hit");
  const shitStakes = await listStakes(utcDay, "shit");

  // Tickets = each play on any bag in the top/bottom window
  const hitTickets = hitStakes
    .filter((s) => hitIds.has(s.assetId))
    .map((s) => s.wallet);
  const shitTickets = shitStakes
    .filter((s) => shitIds.has(s.assetId))
    .map((s) => s.wallet);

  // ——— FREE PLAY settle: one prize pool from SHTy, share all correct picks ———
  if (FREE_PLAY) {
    const pool = await getHourPrizePool(utcDay);
    const prizePool = pool.total;
    const allTickets = [...hitTickets, ...shitTickets];
    const { sendShitFromTreasury } = await import("@/lib/treasury");

    const counts = new Map<string, number>();
    for (const w of allTickets) {
      const key = String(w || "").trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const totalTickets = [...counts.values()].reduce((a, b) => a + b, 0);

    type W = {
      wallet: string;
      tickets: number;
      amount: number;
      sig: string | null;
    };
    const winners: W[] = [];
    let paidTotal = 0;
    let firstSig: string | null = null;
    let rolled = 0;

    if (totalTickets <= 0 || prizePool <= 0) {
      // No winners → roll jackpot to next hour
      rolled = prizePool > 0 ? prizePool : HOUR_PRIZE + pool.jackpot;
      const nextHour = (() => {
        const t = Date.parse(
          utcDay.includes("T") ? utcDay + ":00:00.000Z" : utcDay + "T00:00:00.000Z"
        );
        if (!Number.isFinite(t)) return utcDay;
        return new Date(t + ROUND_MS).toISOString().slice(0, 13);
      })();
      await setHourJackpot(nextHour, rolled, {
        rolledFrom: utcDay,
        rolledAmount: rolled,
      });
    } else {
      const entries = [...counts.entries()].sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return a[0].localeCompare(b[0]);
      });
      let allocated = 0;
      const shares: Array<{ wallet: string; tickets: number; amount: number }> =
        [];
      for (const [wallet, n] of entries) {
        const amount = Math.floor((prizePool * n) / totalTickets);
        shares.push({ wallet, tickets: n, amount });
        allocated += amount;
      }
      let rem = prizePool - allocated;
      let i = 0;
      while (rem > 0 && shares.length) {
        shares[i % shares.length]!.amount += 1;
        rem -= 1;
        i += 1;
      }
      for (const s of shares) {
        if (s.amount <= 0) {
          winners.push({ ...s, sig: null });
          continue;
        }
        try {
          const paid = await sendShitFromTreasury(s.wallet, s.amount);
          winners.push({ ...s, sig: paid.signature });
          paidTotal += s.amount;
          if (!firstSig) firstSig = paid.signature;
        } catch {
          winners.push({ ...s, sig: null });
        }
      }
    }

    const hitWinners = winners.filter((w) =>
      hitTickets.some((t) => t === w.wallet)
    );
    const shitWinners = winners.filter((w) =>
      shitTickets.some((t) => t === w.wallet)
    );

    const meta = JSON.stringify({
      freePlay: true,
      prizePool,
      base: pool.base,
      jackpotIn: pool.jackpot,
      rolledOut: rolled,
      totalCorrectPicks: totalTickets,
      winners,
      hitTickets: hitTickets.length,
      shitTickets: shitTickets.length,
      moveCount: moves.length,
      priceRetries,
      boardHealth,
      force: !!opts?.force,
      splitMode: true,
      winWindow: PLAY_WIN_WINDOW,
      hitWindow,
      shitWindow,
    });

    await tursoExecute(
      `UPDATE day_rounds SET
        status = 'settled',
        settled_at = datetime('now'),
        hit_asset_id = ?,
        shit_asset_id = ?,
        hit_pct = ?,
        shit_pct = ?,
        hit_winner = ?,
        shit_winner = ?,
        hit_prize = ?,
        shit_prize = ?,
        hit_fee = 0,
        shit_fee = 0,
        hit_sig = ?,
        shit_sig = ?,
        hit_pot = ?,
        shit_pot = ?,
        meta = ?
       WHERE utc_day = ?`,
      [
        hitBag?.assetId || null,
        shitBag?.assetId || null,
        hitBag != null ? Number(hitBag.pct) : null,
        shitBag != null ? Number(shitBag.pct) : null,
        hitWinners.length
          ? hitWinners.length === 1
            ? hitWinners[0]!.wallet
            : `SPLIT:${hitWinners.length}`
          : rolled
            ? "ROLL"
            : null,
        shitWinners.length
          ? shitWinners.length === 1
            ? shitWinners[0]!.wallet
            : `SPLIT:${shitWinners.length}`
          : rolled
            ? "ROLL"
            : null,
        hitWinners.reduce((a, w) => a + w.amount, 0),
        shitWinners.reduce((a, w) => a + w.amount, 0),
        firstSig,
        firstSig,
        Math.floor(prizePool / 2),
        prizePool - Math.floor(prizePool / 2),
        meta,
        utcDay,
      ]
    );

    return {
      ok: true,
      result: {
        utcDay,
        freePlay: true,
        prizePool,
        paidTotal,
        rolled,
        hitBag,
        shitBag,
        winners,
        hitTickets: hitTickets.length,
        shitTickets: shitTickets.length,
        priceRetries,
        boardHealth,
        force: !!opts?.force,
      },
    };
  }

  // re-read round pots after possible force reset
  const round2 = (await getRound(utcDay)) || round;
  const hitPot = round2.hitPot;
  const shitPot = round2.shitPot;

  async function settleSide(opts: {
    side: DaySide;
    pot: number;
    tickets: string[];
    bag: { assetId: string; pct: number } | null;
  }): Promise<{
    winner: string | null;
    winners: Array<{
      wallet: string;
      tickets: number;
      amount: number;
      sig: string | null;
    }>;
    prize: number;
    fee: number;
    prizeSig: string | null;
    feeSig: string | null;
    vrf: Record<string, unknown> | null;
    toTreasury: boolean;
  }> {
    const fee = Math.floor((opts.pot * DAY_HOUSE_FEE_BPS) / 10_000);
    let prize = Math.max(0, opts.pot - fee);
    let winner: string | null = null;
    let winners: Array<{
      wallet: string;
      tickets: number;
      amount: number;
      sig: string | null;
    }> = [];
    let prizeSig: string | null = null;
    let feeSig: string | null = null;
    let vrf: Record<string, unknown> | null = null;

    const { sendShitFromPlayPot } = await import("@/lib/treasury");
    const { PLAY_REV_ADDRESS: revWallet } = await import("@/lib/shit-token");

    // Play → pot. Settle: pot → ALL winning tickets (split) 75%; pot → rev 25%.
    // Weight = ticket count per wallet (multi-play). No single-wallet VRF.
    if (opts.tickets.length === 0 || prize <= 0 || !opts.bag) {
      return {
        winner: null,
        winners: [],
        prize: 0,
        fee: 0,
        prizeSig: null,
        feeSig: null,
        vrf: { empty: true, reason: "no tickets or bag", mode: "split" },
        toTreasury: false,
      };
    }

    try {
      const counts = new Map<string, number>();
      for (const w of opts.tickets) {
        const key = String(w || "").trim();
        if (!key) continue;
        counts.set(key, (counts.get(key) || 0) + 1);
      }
      const totalTickets = [...counts.values()].reduce((a, b) => a + b, 0);
      if (totalTickets <= 0) {
        return {
          winner: null,
          winners: [],
          prize: 0,
          fee: 0,
          prizeSig: null,
          feeSig: null,
          vrf: { empty: true, reason: "no valid tickets", mode: "split" },
          toTreasury: false,
        };
      }

      const entries = [...counts.entries()].sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return a[0].localeCompare(b[0]);
      });
      let allocated = 0;
      const shares: Array<{ wallet: string; tickets: number; amount: number }> =
        [];
      for (const [wallet, n] of entries) {
        const amount = Math.floor((prize * n) / totalTickets);
        shares.push({ wallet, tickets: n, amount });
        allocated += amount;
      }
      let rem = prize - allocated;
      let i = 0;
      while (rem > 0 && shares.length) {
        shares[i % shares.length]!.amount += 1;
        rem -= 1;
        i += 1;
      }

      vrf = {
        mode: "split",
        ticketCount: totalTickets,
        walletCount: shares.length,
        bag: opts.bag.assetId,
        side: opts.side,
        shares: shares.map((s) => ({
          wallet: s.wallet,
          tickets: s.tickets,
          amount: s.amount,
        })),
      };

      for (const s of shares) {
        if (s.amount <= 0) {
          winners.push({ ...s, sig: null });
          continue;
        }
        try {
          const paid = await sendShitFromPlayPot(s.wallet, s.amount);
          winners.push({ ...s, sig: paid.signature });
          if (!prizeSig) prizeSig = paid.signature;
        } catch (pe) {
          winners.push({ ...s, sig: null });
          vrf = {
            ...(vrf || {}),
            payError: pe instanceof Error ? pe.message : String(pe),
            payErrorWallet: s.wallet,
          };
        }
      }

      const paidWallets = winners.filter((w) => w.amount > 0);
      if (paidWallets.length === 1) {
        winner = paidWallets[0]!.wallet;
      } else if (paidWallets.length > 1) {
        winner = `SPLIT:${paidWallets.length}`;
      }

      if (fee > 0) {
        try {
          const feePaid = await sendShitFromPlayPot(revWallet, fee);
          feeSig = feePaid.signature;
          vrf = {
            ...(vrf || {}),
            houseFee: fee,
            houseSink: revWallet,
            houseMode: "pot_to_rev",
          };
        } catch (fe) {
          vrf = {
            ...(vrf || {}),
            feeError: fe instanceof Error ? fe.message : String(fe),
            houseSink: revWallet,
          };
        }
      }
    } catch (e) {
      vrf = {
        mode: "split",
        error: e instanceof Error ? e.message : String(e),
      };
      return {
        winner,
        winners,
        prize: winners.some((w) => w.sig) ? prize : 0,
        fee,
        prizeSig,
        feeSig,
        vrf,
        toTreasury: false,
      };
    }

    return {
      winner,
      winners,
      prize,
      fee,
      prizeSig,
      feeSig,
      vrf,
      toTreasury: false,
    };
  }

  const hitRes = await settleSide({
    side: "hit",
    pot: hitPot,
    tickets: hitTickets,
    bag: hitBag,
  });
  const shitRes = await settleSide({
    side: "shit",
    pot: shitPot,
    tickets: shitTickets,
    bag: shitBag,
  });

  const meta = JSON.stringify({
    hitVrf: hitRes.vrf,
    shitVrf: shitRes.vrf,
    hitWinners: hitRes.winners,
    shitWinners: shitRes.winners,
    hitTickets: hitTickets.length,
    shitTickets: shitTickets.length,
    moveCount: moves.length,
    priceRetries,
    boardHealth,
    force: !!opts?.force,
    splitMode: true,
  });

  await tursoExecute(
    `UPDATE day_rounds SET
      status = 'settled',
      settled_at = datetime('now'),
      hit_asset_id = ?,
      shit_asset_id = ?,
      hit_pct = ?,
      shit_pct = ?,
      hit_winner = ?,
      shit_winner = ?,
      hit_prize = ?,
      shit_prize = ?,
      hit_fee = ?,
      shit_fee = ?,
      hit_sig = ?,
      shit_sig = ?,
      meta = ?
     WHERE utc_day = ?`,
    [
      hitBag?.assetId || null,
      shitBag?.assetId || null,
      hitBag != null ? Number(hitBag.pct) : null,
      shitBag != null ? Number(shitBag.pct) : null,
      hitRes.winner,
      shitRes.winner,
      Number(hitRes.prize) || 0,
      Number(shitRes.prize) || 0,
      Number(hitRes.fee) || 0,
      Number(shitRes.fee) || 0,
      hitRes.prizeSig,
      shitRes.prizeSig,
      meta,
      utcDay,
    ]
  );

  return {
    ok: true,
    result: {
      utcDay,
      hitBag,
      shitBag,
      hit: hitRes,
      shit: shitRes,
      hitTickets: hitTickets.length,
      shitTickets: shitTickets.length,
      priceRetries,
      boardHealth,
      force: !!opts?.force,
    },
  };
}
