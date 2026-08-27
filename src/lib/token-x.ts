import { tursoExecute } from "@/lib/turso";
import {
  knownTokenX,
  normalizeXHandle,
} from "@/lib/token-x-copy";

export {
  hourSettleTweet,
  knownTokenX,
  normalizeXHandle,
} from "@/lib/token-x-copy";

let tableReady = false;

async function ensureAssetX(): Promise<void> {
  if (tableReady) return;
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS asset_x (
      asset_id TEXT PRIMARY KEY,
      symbol TEXT,
      handle TEXT NOT NULL,
      source TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )`
  );
  tableReady = true;
}

export async function upsertAssetX(opts: {
  assetId: string;
  symbol?: string | null;
  handle: string;
  source?: string;
}): Promise<string> {
  const handle = normalizeXHandle(opts.handle);
  const id = String(opts.assetId || "").trim();
  if (!id || !handle) return "";
  await ensureAssetX();
  await tursoExecute(
    `INSERT INTO asset_x (asset_id, symbol, handle, source, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'))
     ON CONFLICT(asset_id) DO UPDATE SET
       symbol = COALESCE(excluded.symbol, asset_x.symbol),
       handle = excluded.handle,
       source = excluded.source,
       updated_at = datetime('now')`,
    [id, opts.symbol || null, handle, opts.source || "known"]
  );
  return handle;
}

export async function getAssetX(
  assetId?: string | null,
  symbol?: string | null
): Promise<string> {
  const known = knownTokenX(assetId, symbol);
  const id = String(assetId || "").trim();
  try {
    await ensureAssetX();
    if (id) {
      const r = await tursoExecute(
        `SELECT handle FROM asset_x WHERE lower(asset_id) = lower(?) LIMIT 1`,
        [id]
      );
      const stored = normalizeXHandle(
        r.rows[0] ? String(r.rows[0][0] || "") : ""
      );
      if (stored) return stored;
    }
  } catch {
    /* turso miss → known */
  }
  if (known && id) {
    try {
      await upsertAssetX({
        assetId: id,
        symbol,
        handle: known,
        source: "known",
      });
    } catch {
      /* ignore */
    }
  }
  return known;
}

export async function getAssetXMap(
  rows: { assetId?: string | null; symbol?: string | null }[]
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const ids = [
    ...new Set(rows.map((r) => String(r.assetId || "").trim()).filter(Boolean)),
  ];
  let stored = new Map<string, string>();
  try {
    await ensureAssetX();
    if (ids.length) {
      const ph = ids.map(() => "?").join(",");
      const r = await tursoExecute(
        `SELECT asset_id, handle FROM asset_x WHERE asset_id IN (${ph})`,
        ids
      );
      for (const row of r.rows) {
        const h = normalizeXHandle(String(row[1] || ""));
        if (h) stored.set(String(row[0]), h);
      }
    }
  } catch {
    stored = new Map();
  }
  for (const row of rows) {
    const id = String(row.assetId || "").trim();
    if (!id) continue;
    const h = stored.get(id) || knownTokenX(id, row.symbol) || "";
    if (h) out.set(id, h);
  }
  return out;
}

/** Seed known majors into Turso (idempotent). */
export async function seedKnownAssetX(): Promise<number> {
  const { TOKEN_X_BY_ID } = await import("@/lib/token-x-known");
  let n = 0;
  for (const [assetId, handle] of Object.entries(TOKEN_X_BY_ID)) {
    const ok = await upsertAssetX({
      assetId,
      handle,
      source: "known",
    });
    if (ok) n += 1;
  }
  return n;
}
