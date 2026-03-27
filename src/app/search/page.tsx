import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import SearchBar from "@/components/SearchBar";
import TokenCard from "@/components/TokenCard";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `"${q}" — TokenShit Search` : "Search — TokenShit",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;

  let results: Record<string, unknown>[] = [];
  let error = "";

  if (q) {
    try {
      const data = await apiFetch(
        `/assets/search?q=${encodeURIComponent(q)}&limit=40`
      );
      results = Array.isArray(data)
        ? data
        : (data.results || data.assets || []);
    } catch (e) {
      error = String(e);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="max-w-2xl mx-auto mb-8">
        <SearchBar big />
      </div>

      {q && (
        <h1 className="text-2xl font-bold mb-6">
          Results for &ldquo;<span className="text-neon">{q}</span>&rdquo;
          <span className="text-zinc-500 text-base font-normal ml-2">
            ({results.length} found)
          </span>
        </h1>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 mb-6">
          <p className="text-red-400 text-sm">Search failed. Try again.</p>
        </div>
      )}

      {!q && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">💩</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Search for a token
          </h2>
          <p className="text-zinc-500">
            Enter a name, symbol, or contract address above.
          </p>
        </div>
      )}

      {q && results.length === 0 && !error && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🤷</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            No tokens found
          </h2>
          <p className="text-zinc-500">
            Try a different search term. Maybe the token is too shit to index.
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((r) => (
            <TokenCard
              key={r.assetId as string}
              assetId={r.assetId as string}
              name={r.name as string}
              symbol={r.symbol as string}
              logo={r.logo as string | undefined}
              price={r.price as number | undefined}
              priceChange24h={r.priceChange24h as number | undefined}
              marketCap={r.marketCap as number | undefined}
              volume24h={r.volume24h as number | undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
