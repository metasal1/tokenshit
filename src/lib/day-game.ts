/**
 * Hit / Shit of the Hour — stakes, snapshots, settlement.
 * Round key = UTC hour `YYYY-MM-DDTHH` (stored in day_* tables as utc_day).
 */
import { tursoExecute } from "@/lib/turso";
import { pickWinnerWallet } from "@/lib/day-vrf";
import { TREASURY_ADDRESS, PLAY_POT_ADDRESS } from "@/lib/shit-token";
import { rpc } from "@/lib/treasury";

export const DAY_STAKE_AMOUNT = 1_000;
export const DAY_HOUSE_FEE_BPS = 2_500; // 25%
export const DAY_GAME_ENABLED = process.env.DAY_GAME_ENABLED !== "0";

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

export type MajorSnap = {
  assetId: string;
  price: number;
  volume24h: number;
  name: string;
  symbol: string;
  logo: string;
  source?: string;
};

/**
 * Live majors with multi-source USD prices.
 * Universe/metadata: Tokens.xyz. Price truth: Jupiter → CoinGecko → Tokens.xyz fallback.
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
  winner: string | null; // null = treasury
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
    // Accept play pot (current) or legacy treasury deposit during migration
    const sinks = [PLAY_POT_ADDRESS, TREASURY_ADDRESS];

    let potOk = false;
    for (const sink of sinks) {
      const preT =
        pre.find((b) => b.mint === SHIT_MINT && b.owner === sink)
          ?.uiTokenAmount?.amount || "0";
      const postT =
        post.find((b) => b.mint === SHIT_MINT && b.owner === sink)
          ?.uiTokenAmount?.amount || "0";
      const delta = BigInt(postT) - BigInt(preT);
      if (delta >= BigInt(need)) {
        potOk = true;
        break;
      }
    }
    if (!potOk) {
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
  signature: string;
  twitter?: string | null;
}): Promise<
  | { ok: true; hitPot: number; shitPot: number; ticketCount: number }
  | { ok: false; error: string; status: number }
> {
  if (!DAY_GAME_ENABLED) {
    return { ok: false, error: "Day game paused", status: 503 };
  }
  await ensureRound(opts.utcDay);
  const round = await getRound(opts.utcDay);
  if (!round || round.status !== "open") {
    return { ok: false, error: "Round not open for play", status: 400 };
  }

  // Freeze open price on first play of this bag (lazy open snap)
  const openOk = await ensureOpenSnapForAsset(opts.utcDay, opts.assetId);
  if (!openOk) {
    return {
      ok: false,
      error: "Could not price this bag yet — try another or wait a moment",
      status: 400,
    };
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
        DAY_STAKE_AMOUNT,
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
    [DAY_STAKE_AMOUNT, opts.utcDay]
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
};

async function loadPhase(
  utcDay: string,
  phase: "open" | "close"
): Promise<Map<string, PriceRow>> {
  const r = await tursoExecute(
    `SELECT asset_id, price, volume24h, name, symbol FROM day_prices
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
    });
  }
  return m;
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

  // If open was frozen on stale Tokens.xyz prices (every move ≈ 0) but
  // multi-source live has real divergence, re-baseline open once this hour.
  // Also rebase when live is fresh multi-source but open looks like rounded txyz stats
  // (integer-ish majors like BTC 63009 while live is 629xx).
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
    const fresh = live.filter((m) => m.source && m.source !== "tokens.xyz");
    const freshRatio = live.length ? fresh.length / live.length : 0;
    const shouldRebase =
      compared >= 5 &&
      ((nearZero / compared >= 0.75 && bigDiv >= 2 && freshRatio >= 0.3) ||
        (nearZero / compared >= 0.95 && freshRatio >= 0.5));
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

export async function settleDay(utcDay: string): Promise<{
  ok: boolean;
  error?: string;
  result?: Record<string, unknown>;
}> {
  if (!DAY_GAME_ENABLED) return { ok: false, error: "Day game paused" };
  await ensureRound(utcDay);
  const round = await getRound(utcDay);
  if (!round) return { ok: false, error: "no round" };
  if (round.status === "settled") {
    return { ok: true, result: { already: true, utcDay } };
  }

  // Ensure snapshots
  let openM = await loadPhase(utcDay, "open");
  if (openM.size === 0) {
    await snapshotPrices(utcDay, "open");
    openM = await loadPhase(utcDay, "open");
  }
  let closeM = await loadPhase(utcDay, "close");
  if (closeM.size === 0) {
    await snapshotPrices(utcDay, "close");
    closeM = await loadPhase(utcDay, "close");
  }

  const moves: Array<{ assetId: string; pct: number; volume24h: number }> = [];
  for (const [id, o] of openM) {
    const c = closeM.get(id);
    if (!c || o.price <= 0 || c.price <= 0) continue;
    const pct = ((c.price - o.price) / o.price) * 100;
    moves.push({
      assetId: id,
      pct,
      volume24h: c.volume24h || o.volume24h || 0,
    });
  }

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

  const hitStakes = await listStakes(utcDay, "hit");
  const shitStakes = await listStakes(utcDay, "shit");

  // Tickets = each play (same wallet can hold many tickets on the winning bag)
  const hitTickets = hitBag
    ? hitStakes
        .filter((s) => s.assetId === hitBag.assetId)
        .map((s) => s.wallet)
    : [];
  const shitTickets = shitBag
    ? shitStakes
        .filter((s) => s.assetId === shitBag.assetId)
        .map((s) => s.wallet)
    : [];

  const hitPot = round.hitPot;
  const shitPot = round.shitPot;

  async function settleSide(opts: {
    side: DaySide;
    pot: number;
    tickets: string[];
    bag: { assetId: string; pct: number } | null;
  }): Promise<{
    winner: string | null;
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
    let prizeSig: string | null = null;
    let feeSig: string | null = null;
    let vrf: Record<string, unknown> | null = null;
    let toTreasury = false;

    const { sendShitFromPlayPot } = await import("@/lib/treasury");
    const { TREASURY_ADDRESS: house } = await import("@/lib/shit-token");

    // Stakes sit in play pot. Prize from pot → winner; house fee pot → SHTy treasury.
    // IMPORTANT: never sweep "DB pot" amount if on-chain is lower / prizes unpaid.
    if (opts.tickets.length === 0 || prize <= 0 || !opts.bag) {
      toTreasury = true;
      prize = 0;
      // empty side: leave tokens for the other side's prize — do NOT sweep full DB pot
      return {
        winner: null,
        prize: 0,
        fee: 0,
        prizeSig: null,
        feeSig: null,
        vrf: { empty: true, reason: "no tickets or bag" },
        toTreasury: true,
      };
    }

    try {
      const draw = await pickWinnerWallet({
        tickets: opts.tickets,
        label: `day:${utcDay}:${opts.side}:${opts.bag.assetId}`,
      });
      winner = draw.winner;
      vrf = {
        provider: draw.provider,
        seed: draw.seed,
        verificationHash: draw.verificationHash,
        winnerIndex: draw.winnerIndex,
        entriesHash: draw.entriesHash,
        slot: draw.slot,
        blockhash: draw.blockhash,
        proofnetworkId: draw.proofnetworkId,
        ticketCount: draw.tickets.length,
      };

      if (prize > 0) {
        const paid = await sendShitFromPlayPot(winner, prize);
        prizeSig = paid.signature;
      }
      if (fee > 0) {
        try {
          feeSig = (await sendShitFromPlayPot(house, fee)).signature;
        } catch (fe) {
          vrf = {
            ...(vrf || {}),
            feeError: fe instanceof Error ? fe.message : String(fe),
          };
        }
      }
    } catch (e) {
      // fail → do NOT destroy pot; leave for manual retry
      toTreasury = false;
      vrf = {
        error: e instanceof Error ? e.message : String(e),
      };
      // keep winner if draw succeeded before pay fail
      return {
        winner,
        prize: winner ? prize : 0,
        fee,
        prizeSig: null,
        feeSig,
        vrf,
        toTreasury: false,
      };
    }

    return {
      winner,
      prize,
      fee,
      prizeSig,
      feeSig,
      vrf,
      toTreasury,
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
    hitTickets: hitTickets.length,
    shitTickets: shitTickets.length,
    moveCount: moves.length,
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
    },
  };
}
