/**
 * KOL nominations — community scouts suggest CT handles for /kols roster.
 * Pay-on-accept later; v1 = store + review only.
 * Require ≥10k followers via X lookup at nominate time.
 */
import { tursoExecute } from "@/lib/turso";
import { fetchXUserPublic } from "@/lib/x-data";

import { MIN_KOL_FOLLOWERS as MIN_KOL } from "@/lib/shit-token";
export const MIN_KOL_FOLLOWERS = MIN_KOL;

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
  // soft migrations
  for (const sql of [
    `ALTER TABLE kol_nominations ADD COLUMN followers INTEGER`,
    `ALTER TABLE kol_nominations ADD COLUMN display_name TEXT`,
    `ALTER TABLE kol_nominations ADD COLUMN avatar_url TEXT`,
    `ALTER TABLE kol_nominations ADD COLUMN source TEXT`,
  ]) {
    await tursoExecute(sql).catch(() => {});
  }
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

export type KolLookup =
  | {
      ok: true;
      handle: string;
      followers: number;
      displayName: string | null;
      avatarUrl: string | null;
      verified: boolean;
      meetsMin: boolean;
      minFollowers: number;
    }
  | { ok: false; error: string; code?: string };

/** Live X profile lookup for KOL recommend */
export async function lookupKolProfile(raw: string): Promise<KolLookup> {
  const handle = normalizeKolHandle(raw);
  if (!handle) {
    return { ok: false, error: "Enter a valid X handle or profile URL", code: "bad_handle" };
  }
  const x = await fetchXUserPublic(handle);
  if (!x.ok) {
    return {
      ok: false,
      error: x.error || `Could not find @${handle} on X`,
      code: "lookup_failed",
    };
  }
  const followers = Number(x.followers || 0);
  return {
    ok: true,
    handle,
    followers,
    displayName: x.name ? String(x.name) : null,
    avatarUrl: x.profileImageUrl || null,
    verified: !!x.verified || !!x.premium,
    meetsMin: followers >= MIN_KOL_FOLLOWERS,
    minFollowers: MIN_KOL_FOLLOWERS,
  };
}

export type NomResult =
  | {
      ok: true;
      id: number;
      handle: string;
      already?: boolean;
      followers?: number;
      displayName?: string | null;
      avatarUrl?: string | null;
    }
  | { ok: false; error: string; code?: string; followers?: number };

export async function insertKolNomination(opts: {
  handle: string;
  note?: string | null;
  byX?: string | null;
  byWallet?: string | null;
  ip?: string | null;
  source?: string | null;
  /** skip live lookup if already validated */
  profile?: {
    followers: number;
    displayName?: string | null;
    avatarUrl?: string | null;
  } | null;
}): Promise<NomResult> {
  await ensureKolNomSchema();
  const handle = normalizeKolHandle(opts.handle);
  if (!handle) {
    return { ok: false, error: "Invalid X handle", code: "bad_handle" };
  }

  let followers = opts.profile?.followers ?? null;
  let displayName = opts.profile?.displayName ?? null;
  let avatarUrl = opts.profile?.avatarUrl ?? null;

  if (followers == null) {
    const look = await lookupKolProfile(handle);
    if (!look.ok) {
      return { ok: false, error: look.error, code: look.code };
    }
    followers = look.followers;
    displayName = look.displayName;
    avatarUrl = look.avatarUrl;
  }

  if ((followers ?? 0) < MIN_KOL_FOLLOWERS) {
    return {
      ok: false,
      error: `@${handle} has ${Number(followers).toLocaleString()} followers — need ${MIN_KOL_FOLLOWERS.toLocaleString()}+`,
      code: "low_followers",
      followers: followers ?? 0,
    };
  }

  const note = (opts.note || "").trim().slice(0, 280) || null;
  const byX = opts.byX
    ? normalizeKolHandle(opts.byX) ||
      String(opts.byX).replace(/^@/, "").toLowerCase()
    : null;
  const byWallet = opts.byWallet ? String(opts.byWallet).slice(0, 64) : null;
  const ip = opts.ip ? String(opts.ip).slice(0, 64) : null;
  const source = (opts.source || "claim").slice(0, 32);

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
      followers: followers ?? undefined,
      displayName,
      avatarUrl,
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
        followers: followers ?? undefined,
        displayName,
        avatarUrl,
      };
    }
  }

  // Soft rate: max 5 pending per day per scout; IP anon max 3
  const dayKey = new Date().toISOString().slice(0, 10);
  if (byX) {
    const c = await tursoExecute(
      `SELECT COUNT(*) FROM kol_nominations
       WHERE lower(COALESCE(by_x,'')) = ?
         AND date(created_at) = date(?)
         AND status = 'pending'`,
      [byX, dayKey]
    );
    if (Number(c.rows[0]?.[0] || 0) >= 5) {
      return {
        ok: false,
        error: "Daily nomination limit (5). Try tomorrow.",
        code: "rate_scout",
      };
    }
  } else if (ip && ip !== "unknown") {
    const c = await tursoExecute(
      `SELECT COUNT(*) FROM kol_nominations
       WHERE ip = ? AND date(created_at) = date(?) AND status = 'pending'`,
      [ip, dayKey]
    );
    if (Number(c.rows[0]?.[0] || 0) >= 3) {
      return {
        ok: false,
        error: "Daily limit reached. Login with X required.",
        code: "rate_ip",
      };
    }
  }

  // Require scout X (API also enforces)
  if (!byX) {
    return {
      ok: false,
      error: "Sign in with X to nominate",
      code: "x_required",
    };
  }

  // Global: max 3 pending rows for same handle (stops mass-spam same KOL)
  const pendingSame = await tursoExecute(
    `SELECT COUNT(*) FROM kol_nominations WHERE handle = ? AND status = 'pending'`,
    [handle]
  );
  if (Number(pendingSame.rows[0]?.[0] || 0) >= 3) {
    return {
      ok: true,
      id: 0,
      handle,
      already: true,
      followers: followers ?? undefined,
      displayName,
      avatarUrl,
    };
  }

  await tursoExecute(
    `INSERT INTO kol_nominations
       (handle, note, by_x, by_wallet, ip, status, followers, display_name, avatar_url, source)
     VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
    [
      handle,
      note,
      byX,
      byWallet,
      ip,
      followers,
      displayName,
      avatarUrl,
      source,
    ]
  );
  const idR = await tursoExecute(`SELECT last_insert_rowid()`);
  const id = Number(idR.rows[0]?.[0] || 0);
  return {
    ok: true,
    id,
    handle,
    followers: followers ?? undefined,
    displayName,
    avatarUrl,
  };
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
  followers: number | null;
  displayName: string | null;
  avatarUrl: string | null;
  source: string | null;
};

function mapRow(row: unknown[]): KolNomRow {
  return {
    id: Number(row[0]),
    handle: String(row[1] || ""),
    note: row[2] != null ? String(row[2]) : null,
    byX: row[3] != null ? String(row[3]) : null,
    byWallet: row[4] != null ? String(row[4]) : null,
    ip: row[5] != null ? String(row[5]) : null,
    status: String(row[6] || "pending"),
    createdAt: String(row[7] || ""),
    followers: row[8] != null ? Number(row[8]) : null,
    displayName: row[9] != null ? String(row[9]) : null,
    avatarUrl: row[10] != null ? String(row[10]) : null,
    source: row[11] != null ? String(row[11]) : null,
  };
}

const SELECT_COLS = `id, handle, note, by_x, by_wallet, ip, status, created_at,
  followers, display_name, avatar_url, source`;

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
          `SELECT ${SELECT_COLS}
           FROM kol_nominations WHERE status = ?
           ORDER BY id DESC LIMIT ?`,
          [status, limit]
        )
      : await tursoExecute(
          `SELECT ${SELECT_COLS}
           FROM kol_nominations ORDER BY id DESC LIMIT ?`,
          [limit]
        );
  return r.rows.map((row) => mapRow(row as unknown[]));
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
    `SELECT ${SELECT_COLS}
     FROM kol_nominations WHERE id = ? LIMIT 1`,
    [id]
  );
  if (!r.rows.length) return { ok: false, error: "not found" };
  return { ok: true, row: mapRow(r.rows[0] as unknown[]) };
}
