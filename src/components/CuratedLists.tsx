"use client";

import { useState, useEffect } from "react";
import TokenCard from "./TokenCard";
import { CURATED_LISTS } from "@/lib/lists";
import { EmojiIcon } from "@/components/EmojiIcon";

interface AssetItem {
  assetId: string;
  name: string;
  symbol: string;
  logo?: string;
  price?: number;
  priceChange24h?: number;
  marketCap?: number;
  volume24h?: number;
  mint?: string;
  isVariant?: boolean;
}

export default function CuratedLists({
  initialAssets,
  initialList = "majors",
}: {
  initialAssets?: AssetItem[];
  initialList?: string;
}) {
  const [active, setActive] = useState(initialList);
  const [assets, setAssets] = useState<AssetItem[]>(initialAssets ?? []);
  const [loading, setLoading] = useState(!initialAssets);
  const [count, setCount] = useState(initialAssets?.length ?? 0);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (active === initialList && initialAssets && initialAssets.length > 0) {
      setAssets(initialAssets);
      setCount(initialAssets.length);
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

        const items: AssetItem[] = raw.map((a) => ({
          assetId: a.assetId,
          name: a.name,
          symbol: a.symbol,
          logo: a.imageUrl || a.logo || a.primaryVariant?.market?.logoURI || undefined,
          price: a.stats?.price ?? a.price ?? undefined,
          priceChange24h:
            a.stats?.priceChange24hPercent ?? a.priceChange24h ?? undefined,
          marketCap: a.stats?.marketCap ?? a.marketCap ?? undefined,
          volume24h: a.stats?.volume24hUSD ?? a.volume24h ?? undefined,
          mint: a.mint,
          isVariant: a.isVariant,
        }));

        if (!cancelled) {
          setAssets(items);
          setCount(data.count ?? items.length);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setAssets([]);
          setCount(0);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active, initialAssets, initialList]);

  const shown = q.trim()
    ? assets.filter((a) => {
        const n = q.trim().toLowerCase();
        return (
          a.name.toLowerCase().includes(n) ||
          a.symbol.toLowerCase().includes(n) ||
          a.assetId.toLowerCase().includes(n)
        );
      })
    : assets;

  return (
    <section>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
        {CURATED_LISTS.map((l) => (
          <button
            key={l.key}
            type="button"
            onClick={() => setActive(l.key)}
            className={`shrink-0 min-h-12 rounded-lg px-4 py-2 text-sm font-medium transition-all inline-flex items-center gap-1.5 ${
              active === l.key
                ? "bg-neon text-black"
                : "bg-card border border-border text-zinc-400 hover:text-foreground hover:border-zinc-600"
            }`}
          >
            <EmojiIcon size={16}>{l.emoji}</EmojiIcon>
            {l.label}
          </button>
        ))}
      </div>
      <input
        className="mb-4 w-full max-w-md rounded-xl border border-border bg-zinc-950 px-3 py-3 text-base text-white outline-none focus:border-neon"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name or ticker"
        autoComplete="off"
      />
      {!loading && (
        <p className="text-xs text-zinc-600 mb-4">
          {shown.length}
          {q.trim() ? ` of ${count}` : ""} asset{count === 1 ? "" : "s"}
          {active === "lsts" ? " · expanded from Foundation LST registry" : ""}
        </p>
      )}
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
      ) : shown.length === 0 ? (
        <p className="text-center text-zinc-500 py-12">
          No tokens found for this list. Try another category.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {shown.map((a, i) => (
            <TokenCard
              key={`${a.assetId}-${a.mint || a.symbol}-${i}`}
              assetId={a.assetId}
              name={a.name}
              symbol={a.symbol}
              logo={a.logo}
              price={a.price}
              priceChange24h={a.priceChange24h}
              marketCap={a.marketCap}
              volume24h={a.volume24h}
              mint={a.mint}
              isVariant={a.isVariant}
            />
          ))}
        </div>
      )}
    </section>
  );
}
