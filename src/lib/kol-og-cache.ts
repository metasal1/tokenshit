import { renderKolLoveOg } from "@/lib/kol-og";
import { normalizeKolHandle } from "@/lib/kol-noms";

const MEM = new Map<string, { at: number; buf: ArrayBuffer }>();
const MEM_TTL_MS = 60 * 60 * 1000;
const MEM_MAX = 80;

const CACHE_HEADER =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

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
      .slice(0, 20)
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
      "X-Kol-Og-Cache": via,
    },
  });
}

export async function getKolOgPngResponse(
  rawHandle: string,
  requestUrl?: string
): Promise<Response> {
  const handle = normalizeKolHandle(rawHandle);
  if (!handle) {
    return new Response("bad handle", { status: 400 });
  }

  const key = `kol-og:v11:${handle}`;
  const cacheUrl =
    requestUrl ||
    `https://tokenshit.com/api/kols/card/${encodeURIComponent(handle)}?k=${key}`;
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

  const img = await renderKolLoveOg(handle);
  const buf = await img.arrayBuffer();
  if (buf.byteLength > 64) memSet(key, buf);

  const res = pngResponse(buf, "miss");
  void cfCachePut(cacheReq, res.clone());
  return res;
}
