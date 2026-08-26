import { fetchCuratedList } from "@/lib/curatedAssets";

export const dynamic = "force-dynamic";

const LANES = [
  { key: "stocks", label: "Stocks" },
  { key: "majors", label: "Majors" },
  { key: "metals", label: "Metals" },
  { key: "rwas", label: "RWA" },
] as const;

const PER_LANE = 14;
const CACHE_MS = 2 * 60_000;

type Item = {
  assetId: string;
  symbol: string;
  pct: number | null;
};

type Lane = {
  key: string;
  label: string;
  count: number;
  items: Item[];
};

let cache: { at: number; lanes: Lane[] } | null = null;

async function loadLane(key: string, label: string): Promise<Lane> {
  try {
    const assets = await Promise.race([
      fetchCuratedList(key),
      new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error("timeout")), 8_000)
      ),
    ]);
    const scored = assets
      .map((a) => ({
        assetId: a.assetId,
        symbol: (a.symbol || a.name || a.assetId || "").slice(0, 12),
        pct:
          typeof a.priceChange24h === "number" && Number.isFinite(a.priceChange24h)
            ? a.priceChange24h
            : null,
      }))
      .filter((a) => a.symbol);
    scored.sort((a, b) => {
      const aa = a.pct == null ? -1 : Math.abs(a.pct);
      const bb = b.pct == null ? -1 : Math.abs(b.pct);
      return bb - aa;
    });
    return {
      key,
      label,
      count: assets.length,
      items: scored.slice(0, PER_LANE),
    };
  } catch {
    return { key, label, count: 0, items: [] };
  }
}

export async function GET() {
  if (cache && Date.now() - cache.at < CACHE_MS) {
    return Response.json(
      { lanes: cache.lanes },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  }
  const lanes = await Promise.all(LANES.map((l) => loadLane(l.key, l.label)));
  cache = { at: Date.now(), lanes };
  return Response.json(
    { lanes },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
