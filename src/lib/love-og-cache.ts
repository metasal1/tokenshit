import { renderLoveOg } from "@/lib/love-og";

const MEM = new Map<string, { at: number; buf: ArrayBuffer }>();
const MEM_TTL_MS = 12 * 60 * 60 * 1000; // 12h
const MEM_MAX = 150;

/** Cold-gen budget for crawlers (FB ~3–5s). Over this → static fallback + bg bake. */
const COLD_BUDGET_MS = 2800;

const CACHE_HEADER =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";
const FALLBACK_HEADER =
  "public, max-age=60, s-maxage=120, stale-while-revalidate=86400";

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
      .slice(0, 40)
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

function pngResponse(buf: ArrayBuffer, via: string, header = CACHE_HEADER): Response {
  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": header,
      "X-Love-Og-Cache": via,
    },
  });
}

async function bake(ref: string): Promise<ArrayBuffer> {
  const img = await renderLoveOg(ref || null);
  return img.arrayBuffer();
}

let staticFallback: ArrayBuffer | null = null;
async function getStaticFallback(): Promise<ArrayBuffer | null> {
  if (staticFallback && staticFallback.byteLength > 64) return staticFallback;
  try {
    // Prefer same-origin static brand pack (instant on CDN)
    const urls = [
      "https://tokenshit.com/brand/og/love.png",
      "https://tokenshit.com/brand/og/default.png",
    ];
    for (const u of urls) {
      const res = await fetch(u, { next: { revalidate: 86400 } });
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();
      if (buf.byteLength > 64) {
        staticFallback = buf;
        return buf;
      }
    }
  } catch {
    /* */
  }
  return null;
}

/**
 * Love OG PNG — crawler-safe:
 * 1) memory  2) CF cache  3) generate within budget  4) static fallback + bg bake
 */
export async function getLoveOgPngResponse(
  rawRef?: string | null,
  requestUrl?: string
): Promise<Response> {
  const ref = normRef(rawRef);
  const key = `love-og:v4:${ref || "_"}`;
  const cacheUrl =
    requestUrl ||
    `https://tokenshit.com/api/love/og?ref=${encodeURIComponent(ref)}&k=${key}`;
  const cacheReq = new Request(cacheUrl.split("&v=")[0] || cacheUrl, {
    method: "GET",
  });

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

  // Race generation vs crawler budget
  const gen = bake(ref).then((buf) => {
    if (buf.byteLength > 64) {
      memSet(key, buf);
      const res = pngResponse(buf, "miss");
      void cfCachePut(cacheReq, res.clone());
    }
    return buf;
  });

  const budget = new Promise<"timeout">((r) =>
    setTimeout(() => r("timeout"), COLD_BUDGET_MS)
  );

  const raced = await Promise.race([
    gen.then((buf) => ({ kind: "ok" as const, buf })),
    budget.then(() => ({ kind: "timeout" as const })),
  ]);

  if (raced.kind === "ok" && raced.buf.byteLength > 64) {
    return pngResponse(raced.buf, "miss");
  }

  // Over budget — return static NOW; keep baking into cache in background
  void gen.catch(() => {});
  const fallback = await getStaticFallback();
  if (fallback) {
    return pngResponse(fallback, "fallback-static", FALLBACK_HEADER);
  }

  // Last resort: wait for full gen (better than 500)
  try {
    const buf = await gen;
    if (buf.byteLength > 64) return pngResponse(buf, "miss-slow");
  } catch {
    /* */
  }
  return new Response("og unavailable", { status: 503 });
}
