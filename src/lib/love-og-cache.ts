import { renderLoveOg } from "@/lib/love-og";

const MEM = new Map<string, { at: number; buf: ArrayBuffer }>();
const MEM_TTL_MS = 6 * 60 * 60 * 1000; // 6h
const MEM_MAX = 120;

const CACHE_HEADER =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

function normRef(raw?: string | null): string {
  const h = (raw || "").replace(/^@/, "").trim().toLowerCase();
  if (!h || !/^[a-z0-9_]{1,15}$/.test(h)) return "";
  return h;
}

function memGet(key: string): ArrayBuffer | null {
  const hit = MEM.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > MEM_TTL_MS) {
    MEM.delete(key);
    return null;
  }
  return hit.buf;
}

function memSet(key: string, buf: ArrayBuffer) {
  if (MEM.size >= MEM_MAX) {
    const keys = [...MEM.entries()]
      .sort((a, b) => a[1].at - b[1].at)
      .slice(0, 30)
      .map(([k]) => k);
    for (const k of keys) MEM.delete(k);
  }
  MEM.set(key, { at: Date.now(), buf });
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
    /* */
  }
}

function pngResponse(buf: ArrayBuffer, via: string): Response {
  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": CACHE_HEADER,
      "X-Love-Og-Cache": via,
    },
  });
}

/**
 * Fast path for love OG PNG:
 * 1) memory  2) Cache API  3) generate once → store both
 */
export async function getLoveOgPngResponse(
  rawRef?: string | null,
  requestUrl?: string
): Promise<Response> {
  const ref = normRef(rawRef);
  const key = `love-og:v2:${ref || "_"}`;
  const cacheUrl =
    requestUrl ||
    `https://tokenshit.com/api/love/og?ref=${encodeURIComponent(ref)}&k=${key}`;
  const cacheReq = new Request(cacheUrl, { method: "GET" });

  const mem = memGet(key);
  if (mem) return pngResponse(mem, "memory");

  const cached = await cfCacheMatch(cacheReq);
  if (cached && cached.ok) {
    const buf = await cached.arrayBuffer();
    if (buf.byteLength > 64) {
      memSet(key, buf);
      return pngResponse(buf, "cf");
    }
  }

  const img = await renderLoveOg(ref || null);
  const buf = await img.arrayBuffer();
  if (buf.byteLength > 64) memSet(key, buf);

  const res = pngResponse(buf, "miss");
  void cfCachePut(cacheReq, res.clone());
  return res;
}
