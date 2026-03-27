"use client";

import { useState, useEffect } from "react";
import TokenCard from "./TokenCard";

const LISTS = [
  { key: "majors", label: "Majors" },
  { key: "lsts", label: "LSTs" },
  { key: "currencies", label: "Currencies" },
  { key: "rwas", label: "RWAs" },
  { key: "stocks", label: "Stocks" },
  { key: "metals", label: "Metals" },
  { key: "etfs", label: "ETFs" },
];

interface AssetItem {
  assetId: string;
  name: string;
  symbol: string;
  logo?: string;
  price?: number;
  priceChange24h?: number;
  marketCap?: number;
  volume24h?: number;
  mints?: string[];
  variants?: Array<{ mint?: string }>;
}

export default function CuratedLists({
  initialAssets,
}: {
  initialAssets?: AssetItem[];
}) {
  const [active, setActive] = useState("majors");
  const [assets, setAssets] = useState<AssetItem[]>(initialAssets ?? []);
  const [loading, setLoading] = useState(!initialAssets);

  useEffect(() => {
    // Skip fetch for initial "majors" tab if we already have server data
    if (active === "majors" && initialAssets) {
      setAssets(initialAssets);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/curated?list=${active}&groupBy=asset`);
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw: any[] = Array.isArray(data)
          ? data
          : data.assets || data.results || data.items || [];

        if (cancelled) return;

        // Map API shape to our AssetItem shape
        const items: AssetItem[] = raw.map((a) => ({
          assetId: a.assetId,
          name: a.name,
          symbol: a.symbol,
          logo: a.imageUrl || a.primaryVariant?.market?.logoURI || a.logo || undefined,
          price: a.stats?.price ?? a.price ?? undefined,
          priceChange24h: a.stats?.priceChange24hPercent ?? a.priceChange24h ?? undefined,
          marketCap: a.stats?.marketCap ?? a.marketCap ?? undefined,
          volume24h: a.stats?.volume24hUSD ?? a.volume24h ?? undefined,
        }));

        if (!cancelled) {
          setAssets(items);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setAssets([]);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active, initialAssets]);

  return (
    <section>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {LISTS.map((l) => (
          <button
            key={l.key}
            onClick={() => setActive(l.key)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              active === l.key
                ? "bg-neon text-black"
                : "bg-card border border-border text-zinc-400 hover:text-foreground hover:border-zinc-600"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="skeleton h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <div className="skeleton h-4 w-24 mb-1" />
                  <div className="skeleton h-3 w-12" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="skeleton h-8 w-full" />
                <div className="skeleton h-8 w-full" />
                <div className="skeleton h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : assets.length === 0 ? (
        <p className="text-center text-zinc-500 py-12">
          No tokens found for this list. Try another category.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {assets.map((a) => (
            <TokenCard
              key={a.assetId}
              assetId={a.assetId}
              name={a.name}
              symbol={a.symbol}
              logo={a.logo}
              price={a.price}
              priceChange24h={a.priceChange24h}
              marketCap={a.marketCap}
              volume24h={a.volume24h}
            />
          ))}
        </div>
      )}
    </section>
  );
}
