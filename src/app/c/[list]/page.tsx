import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { CATEGORIES, getCategory } from "@/lib/categories";
import TokenCard from "@/components/TokenCard";

export const revalidate = 60;

async function getCount(key: string): Promise<number> {
  try {
    const data = await apiFetch(`/assets/curated?list=${key}&groupBy=asset`);
    const assets = data?.assets || data?.results || data?.items || [];
    return Array.isArray(assets) ? assets.length : 0;
  } catch {
    return 0;
  }
}

interface Props {
  params: Promise<{ list: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { list } = await params;
  const cat = getCategory(list);
  if (!cat) return { title: "TOKENSHIT" };
  return {
    title: `${cat.label} — TOKENSHIT`,
    description: cat.description,
  };
}

interface RawAsset {
  assetId?: string;
  id?: string;
  name?: string;
  symbol?: string;
  imageUrl?: string;
  primaryVariant?: { market?: { logoURI?: string } };
  stats?: {
    price?: number;
    priceChange24hPercent?: number;
    marketCap?: number;
    volume24hUSD?: number;
  };
}

export default async function CategoryPage({ params }: Props) {
  const { list } = await params;
  const cat = getCategory(list);
  if (!cat) notFound();

  // Fetch this list's assets + counts for every other list (for the tab strip)
  // in parallel. Each /assets/curated response is cached for 60s by Next.js.
  const [assets, ...siblingCounts] = await Promise.all([
    (async (): Promise<RawAsset[]> => {
      try {
        const data = await apiFetch(`/assets/curated?list=${cat.key}&groupBy=asset`);
        return (data?.assets || data?.results || data?.items || []) as RawAsset[];
      } catch {
        return [];
      }
    })(),
    ...CATEGORIES.filter((c) => c.key !== cat.key).map((c) => getCount(c.key)),
  ]);

  const countMap: Record<string, number> = { [cat.key]: assets.length };
  CATEGORIES.filter((c) => c.key !== cat.key).forEach((c, i) => {
    countMap[c.key] = siblingCounts[i];
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-monoton mb-2">
          <span className="neon-text">{cat.label.toUpperCase()}</span>
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base">{cat.description}</p>
        <p className="text-xs text-zinc-600 mt-1 font-mono">{assets.length} tokens</p>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 -mx-4 px-4 scrollbar-none">
        {CATEGORIES.map((c) => {
          const isActive = c.key === cat.key;
          return (
            <Link
              key={c.key}
              href={`/c/${c.key}`}
              className={`shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all flex items-center gap-2 ${
                isActive
                  ? "bg-neon text-black"
                  : "bg-card border border-border text-zinc-400 hover:text-foreground hover:border-zinc-600"
              }`}
            >
              <span>{c.label}</span>
              <span className={`text-[11px] font-mono tabular-nums ${isActive ? "text-black/60" : "text-zinc-600"}`}>
                {countMap[c.key] ?? 0}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Grid */}
      {assets.length === 0 ? (
        <p className="text-center text-zinc-500 py-12">No tokens found in this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {assets.map((a) => {
            const assetId = (a.assetId || a.id) as string;
            return (
              <TokenCard
                key={assetId}
                assetId={assetId}
                name={a.name || "Unknown"}
                symbol={a.symbol || ""}
                logo={a.imageUrl || a.primaryVariant?.market?.logoURI}
                price={a.stats?.price}
                priceChange24h={a.stats?.priceChange24hPercent}
                marketCap={a.stats?.marketCap}
                volume24h={a.stats?.volume24hUSD}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
