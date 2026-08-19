import { renderKolLoveOg } from "@/lib/kol-og";
import { normalizeKolHandle } from "@/lib/kol-noms";

/** Isolate memory — free warm hits on the same worker */
const MEM = new Map<string, { at: number; bytes: Uint8Array }>();
const MEM_TTL_MS = 60 * 60 * 1000; // 1h
const MEM_MAX = 80;

const CACHE_HEADER =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

function memGet(key: string): Uint8Array | null {
  const hit = MEM.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > MEM_TTL_MS) {
    MEM.delete(key);
    return null;
  }
  return hit.bytes;
}

function memSet(key: string, bytes: Uint8Array) {
  if (MEM.size >= MEM_MAX) {
    // drop oldest ~20
    const keys = [...MEM.entries()]
      .sort((a, b) => a[1].at - b[1].at)
      .slice(0, 20)
      .map(([k]) => k);
    for (const k of keys) MEM.delete(k);
  }
  MEM.set(key, { at: Date.now(), bytes });
}

async function cfCacheMatch(req: Request): Promise<Response | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = (globalThis as any).caches?.default as Cache | undefined;
    if (!c) return null;
    return (await c.match(req)) || null;
  } catch {
    return null;
  }
}

async function cfCachePut(req: Request, res: Response): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = (globalThis as any).caches?.default as Cache | undefined;
    if (!c) return;
    await c.put(req, res.clone());
  } catch {
    /* ignore */
  }
}

/**
 * Fast path for KOL OG PNG:
 * 1) memory  2) Cache API  3) generate once → store both
 */
export async function getKolOgPngResponse(
  rawHandle: string,
  requestUrl?: string
): Promise<Response> {
  const handle = normalizeKolHandle(rawHandle);
  if (!handle) {
    return new Response("bad handle", { status: 400 });
  }

  const key = `kol-og:v8:${handle}`;
  const cacheUrl =
    requestUrl ||
    `https://tokenshit.com/api/kols/card/${encodeURIComponent(handle)}?cache=${key}`;
  const cacheReq = new Request(cacheUrl, { method: "GET" });

  // 1) memory
  const mem = memGet(key);
  if (mem) {
    return new Response(mem, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": CACHE_HEADER,
        "X-Kol-Og-Cache": "memory",
      },
    });
  }

  // 2) CF Cache API
  const cached = await cfCacheMatch(cacheReq);
  if (cached) {
    const ab = new Uint8Array(await cached.arrayBuffer());
    if (ab.byteLength > 64) {
      memSet(key, ab);
      const headers = new Headers(cached.headers);
      headers.set("Cache-Control", CACHE_HEADER);
      headers.set("X-Kol-Og-Cache", "cf");
      headers.set("Content-Type", "image/png");
      return new Response(ab, { status: 200, headers });
    }
  }

  // 3) generate
  const img = await renderKolLoveOg(handle);
  const buf = new Uint8Array(await img.arrayBuffer());
  if (buf.byteLength > 64) memSet(key, buf);

  const res = new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": CACHE_HEADER,
      "X-Kol-Og-Cache": "miss",
    },
  });
  void cfCachePut(cacheReq, res.clone());
  return res;
}
