/**
 * KOL nominations — community scouts suggest CT handles for /kols roster.
 * Pay-on-accept later; v1 = store + review only.
 */
import { tursoExecute } from "@/lib/turso";

let schemaReady = false;

export async function ensureKolNomSchema() {
  if (schemaReady) return;
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS kol_nominations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      handle TEXT NOT NULL,
      note TEXT,
      by_x TEXT,
      by_wallet TEXT,
      ip TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    )`
  );
  await tursoExecute(
    `CREATE INDEX IF NOT EXISTS idx_kol_noms_handle ON kol_nominations(handle)`
  );
  await tursoExecute(
    `CREATE INDEX IF NOT EXISTS idx_kol_noms_status ON kol_nominations(status)`
  );
  await tursoExecute(
    `CREATE INDEX IF NOT EXISTS idx_kol_noms_by_x ON kol_nominations(by_x)`
  );
  schemaReady = true;
}

/** Normalize @Handle → handle (lowercase, no @) */
export function normalizeKolHandle(raw: string): string | null {
  let h = String(raw || "").trim();
  if (!h) return null;
  h = h.replace(/^@+/, "");
  // strip x.com / twitter profile URLs
  const m = h.match(
    /(?:x\.com|twitter\.com)\/(?:#!\/)?@?([A-Za-z0-9_]{1,15})(?:\/|$|\?)/i
  );
  if (m) h = m[1];
  h = h.split(/[/?#\s]/)[0] || "";
  h = h.replace(/^@+/, "").trim();
  if (!/^[A-Za-z0-9_]{1,15}$/.test(h)) return null;
  return h.toLowerCase();
}

export type NomResult =
  | { ok: true; id: number; handle: string; already?: boolean }
  | { ok: false; error: string; code?: string };

export async function insertKolNomination(opts: {
  handle: string;
  note?: string | null;
  byX?: string | null;
  byWallet?: string | null;
  ip?: string | null;
}): Promise<NomResult> {
  await ensureKolNomSchema();
  const handle = normalizeKolHandle(opts.handle);
  if (!handle) {
    return { ok: false, error: "Invalid X handle", code: "bad_handle" };
  }

  const note = (opts.note || "").trim().slice(0, 280) || null;
  const byX = opts.byX
    ? normalizeKolHandle(opts.byX) || String(opts.byX).replace(/^@/, "").toLowerCase()
    : null;
  const byWallet = opts.byWallet ? String(opts.byWallet).slice(0, 64) : null;
  const ip = opts.ip ? String(opts.ip).slice(0, 64) : null;

  // Already accepted / live
  const live = await tursoExecute(
    `SELECT id, status FROM kol_nominations
     WHERE handle = ? AND status IN ('accepted','live')
     ORDER BY id ASC LIMIT 1`,
    [handle]
  );
  if (live.rows.length) {
    return {
      ok: true,
      id: Number(live.rows[0][0]),
      handle,
      already: true,
    };
  }

  // Same scout already pending this handle
  if (byX) {
    const dup = await tursoExecute(
      `SELECT id FROM kol_nominations
       WHERE handle = ? AND lower(COALESCE(by_x,'')) = ? AND status = 'pending'
       LIMIT 1`,
      [handle, byX]
    );
    if (dup.rows.length) {
      return {
        ok: true,
        id: Number(dup.rows[0][0]),
        handle,
        already: true,
      };
    }
  }

  // Soft rate: max 8 pending per day per scout or IP
  const dayKey = new Date().toISOString().slice(0, 10);
  if (byX) {
    const c = await tursoExecute(
      `SELECT COUNT(*) FROM kol_nominations
       WHERE lower(COALESCE(by_x,'')) = ?
         AND date(created_at) = date(?)
         AND status = 'pending'`,
      [byX, dayKey]
    );
    if (Number(c.rows[0]?.[0] || 0) >= 8) {
      return {
        ok: false,
        error: "Daily nomination limit (8). Try tomorrow.",
        code: "rate_scout",
      };
    }
  } else if (ip && ip !== "unknown") {
    const c = await tursoExecute(
      `SELECT COUNT(*) FROM kol_nominations
       WHERE ip = ? AND date(created_at) = date(?) AND status = 'pending'`,
      [ip, dayKey]
    );
    if (Number(c.rows[0]?.[0] || 0) >= 5) {
      return {
        ok: false,
        error: "Daily limit reached. Login with X for more.",
        code: "rate_ip",
      };
    }
  }

  await tursoExecute(
    `INSERT INTO kol_nominations (handle, note, by_x, by_wallet, ip, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    [handle, note, byX, byWallet, ip]
  );
  const idR = await tursoExecute(`SELECT last_insert_rowid()`);
  const id = Number(idR.rows[0]?.[0] || 0);
  return { ok: true, id, handle };
}


export type KolNomRow = {
  id: number;
  handle: string;
  note: string | null;
  byX: string | null;
  byWallet: string | null;
  ip: string | null;
  status: string;
  createdAt: string;
};

export async function listKolNominations(opts?: {
  status?: string;
  limit?: number;
}): Promise<KolNomRow[]> {
  await ensureKolNomSchema();
  const limit = Math.min(Math.max(opts?.limit ?? 200, 1), 500);
  const status = opts?.status?.trim().toLowerCase();
  const r =
    status && status !== "all"
      ? await tursoExecute(
          `SELECT id, handle, note, by_x, by_wallet, ip, status, created_at
           FROM kol_nominations WHERE status = ?
           ORDER BY id DESC LIMIT ?`,
          [status, limit]
        )
      : await tursoExecute(
          `SELECT id, handle, note, by_x, by_wallet, ip, status, created_at
           FROM kol_nominations ORDER BY id DESC LIMIT ?`,
          [limit]
        );
  return r.rows.map((row) => ({
    id: Number(row[0]),
    handle: String(row[1] || ""),
    note: row[2] != null ? String(row[2]) : null,
    byX: row[3] != null ? String(row[3]) : null,
    byWallet: row[4] != null ? String(row[4]) : null,
    ip: row[5] != null ? String(row[5]) : null,
    status: String(row[6] || "pending"),
    createdAt: String(row[7] || ""),
  }));
}

export async function setKolNominationStatus(
  id: number,
  status: "pending" | "accepted" | "rejected" | "live"
): Promise<{ ok: boolean; error?: string; row?: KolNomRow }> {
  await ensureKolNomSchema();
  if (!Number.isFinite(id) || id <= 0) {
    return { ok: false, error: "bad id" };
  }
  const allowed = new Set(["pending", "accepted", "rejected", "live"]);
  if (!allowed.has(status)) return { ok: false, error: "bad status" };

  await tursoExecute(`UPDATE kol_nominations SET status = ? WHERE id = ?`, [
    status,
    id,
  ]);
  const r = await tursoExecute(
    `SELECT id, handle, note, by_x, by_wallet, ip, status, created_at
     FROM kol_nominations WHERE id = ? LIMIT 1`,
    [id]
  );
  if (!r.rows.length) return { ok: false, error: "not found" };
  const row = r.rows[0];
  return {
    ok: true,
    row: {
      id: Number(row[0]),
      handle: String(row[1] || ""),
      note: row[2] != null ? String(row[2]) : null,
      byX: row[3] != null ? String(row[3]) : null,
      byWallet: row[4] != null ? String(row[4]) : null,
      ip: row[5] != null ? String(row[5]) : null,
      status: String(row[6] || ""),
      createdAt: String(row[7] || ""),
    },
  };
}
