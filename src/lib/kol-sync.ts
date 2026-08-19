/**
 * Auto-populate KOLs from an X list + pre-warm OG PNGs.
 *
 * Env:
 *   KOL_X_LIST_ID=2089701277962031475
 *   TWITTERAPI_IO_KEY=...
 *   KOL_SYNC_MIN_FOLLOWERS=10000 (optional)
 *   KOL_SYNC_STATUS=live|accepted (default live)
 *   SITE_URL=https://tokenshit.com
 */
import { tursoExecute } from "@/lib/turso";
import { ensureKolNomSchema, listApprovedKols } from "@/lib/kol-noms";

const DEFAULT_LIST = "2089701277962031475";

export type ListMember = {
  userName: string;
  name?: string;
  followers?: number;
  profilePicture?: string;
  isBlueVerified?: boolean;
};

function ioKey(): string {
  return (
    process.env.TWITTERAPI_IO_KEY ||
    process.env.TWITTER_API_IO_KEY ||
    ""
  ).trim();
}

export async function fetchXListMembers(
  listId: string,
  maxPages = 20
): Promise<ListMember[]> {
  const key = ioKey();
  if (!key) throw new Error("TWITTERAPI_IO_KEY missing");

  const out: ListMember[] = [];
  let cursor: string | null = null;
  for (let i = 0; i < maxPages; i++) {
    const url = new URL("https://api.twitterapi.io/twitter/list/members");
    url.searchParams.set("list_id", listId);
    if (cursor) url.searchParams.set("cursor", cursor);
    const res = await fetch(url.toString(), {
      headers: { "X-API-Key": key },
      cache: "no-store",
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`list members ${res.status}: ${t.slice(0, 200)}`);
    }
    const data = (await res.json()) as {
      members?: ListMember[];
      has_next_page?: boolean;
      next_cursor?: string;
    };
    const batch = data.members || [];
    out.push(...batch);
    if (!data.has_next_page || !data.next_cursor) break;
    cursor = data.next_cursor;
  }
  // dedupe
  const seen = new Set<string>();
  return out.filter((m) => {
    const h = (m.userName || "").replace(/^@/, "").toLowerCase();
    if (!h || seen.has(h)) return false;
    seen.add(h);
    return true;
  });
}

export async function upsertListMemberAsLive(m: ListMember): Promise<{
  handle: string;
  action: "insert" | "update" | "skip";
}> {
  await ensureKolNomSchema();
  const handle = (m.userName || "").replace(/^@/, "").toLowerCase();
  if (!handle) return { handle: "", action: "skip" };
  const min = Number(process.env.KOL_SYNC_MIN_FOLLOWERS || 10_000);
  const followers = Number(m.followers || 0);
  if (Number.isFinite(min) && min > 0 && followers < min) {
    return { handle, action: "skip" };
  }
  const status = (process.env.KOL_SYNC_STATUS || "live").toLowerCase() ===
    "accepted"
    ? "accepted"
    : "live";
  const name = m.name || handle;
  const avatar = (m.profilePicture || "")
    .replace("_normal", "_400x400")
    .replace("_bigger", "_400x400") || null;
  const note = `X list ${process.env.KOL_X_LIST_ID || DEFAULT_LIST} auto-sync`;

  const existing = await tursoExecute(
    `SELECT id, status FROM kol_nominations WHERE lower(handle)=lower(?) ORDER BY id ASC LIMIT 1`,
    [handle]
  );
  if (existing.rows[0]) {
    const id = Number(existing.rows[0][0]);
    await tursoExecute(
      `UPDATE kol_nominations SET
         status = ?,
         followers = ?,
         display_name = ?,
         avatar_url = COALESCE(?, avatar_url),
         source = CASE
           WHEN source IS NULL OR source = '' THEN 'x_list'
           WHEN source LIKE '%x_list%' THEN source
           ELSE source || ',x_list'
         END,
         note = CASE
           WHEN note IS NULL OR note = '' THEN ?
           WHEN note LIKE '%auto-sync%' OR note LIKE '%list%' THEN note
           ELSE note || ' | auto-sync'
         END
       WHERE id = ?`,
      [status, followers, name, avatar, note, id]
    );
    return { handle, action: "update" };
  }
  await tursoExecute(
    `INSERT INTO kol_nominations
       (handle, note, by_x, by_wallet, ip, status, followers, display_name, avatar_url, source)
     VALUES (?, ?, 'auto-sync', NULL, 'cron-kols-sync', ?, ?, ?, ?, 'x_list')`,
    [handle, note, status, followers, name, avatar]
  );
  return { handle, action: "insert" };
}

/** Bake OG into memory cache (direct call — no self-HTTP / CF loop). */
export async function prewarmKolOg(handle: string): Promise<{
  handle: string;
  ok: boolean;
  ms: number;
  status?: number;
  cache?: string | null;
}> {
  const h = handle.replace(/^@/, "").toLowerCase();
  const t0 = Date.now();
  try {
    const { getKolOgPngResponse } = await import("@/lib/kol-og-cache");
    const res = await getKolOgPngResponse(h);
    const buf = await res.arrayBuffer();
    const ok = res.ok && buf.byteLength > 64;
    return {
      handle: h,
      ok,
      ms: Date.now() - t0,
      status: res.status,
      cache: res.headers.get("x-kol-og-cache") || (ok ? "baked" : "empty"),
    };
  } catch (e) {
    return {
      handle: h,
      ok: false,
      ms: Date.now() - t0,
      cache: String(e).slice(0, 120),
    };
  }
}

export async function syncKolXListAndPrewarm(opts?: {
  prewarm?: boolean;
  prewarmLimit?: number;
}): Promise<{
  listId: string;
  fetched: number;
  inserted: number;
  updated: number;
  skipped: number;
  prewarmed: { handle: string; ok: boolean; ms: number }[];
}> {
  const listId = (process.env.KOL_X_LIST_ID || DEFAULT_LIST).trim();
  const members = await fetchXListMembers(listId);
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const handles: string[] = [];
  for (const m of members) {
    const r = await upsertListMemberAsLive(m);
    if (r.action === "insert") inserted++;
    else if (r.action === "update") updated++;
    else skipped++;
    if (r.handle) handles.push(r.handle);
  }

  const prewarmed: { handle: string; ok: boolean; ms: number }[] = [];
  if (opts?.prewarm !== false) {
    // Prefer newly touched, then rest of approved roster
    const approved = await listApprovedKols(300);
    const queue = [
      ...handles,
      ...approved.map((a) => a.handle).filter((h) => !handles.includes(h)),
    ];
    const limit = Math.min(opts?.prewarmLimit ?? 40, queue.length);
    // sequential to avoid hammering worker
    for (let i = 0; i < limit; i++) {
      const r = await prewarmKolOg(queue[i]!);
      prewarmed.push({ handle: r.handle, ok: r.ok, ms: r.ms });
    }
  }

  return {
    listId,
    fetched: members.length,
    inserted,
    updated,
    skipped,
    prewarmed,
  };
}
