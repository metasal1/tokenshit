import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import { formatPrice, formatLargeNumber, formatPercent, percentColor, riskColor, riskBg, hitScoreRoast, hitScoreEmoji } from "@/lib/format";
import VoteButtons from "@/components/VoteButtons";
import TokenPageWrapper from "@/components/TokenPageWrapper";
import CollapsibleSection from "@/components/CollapsibleSection";

interface Props {
  params: Promise<{ assetId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { assetId } = await params;
  try {
    const data = await apiFetch(`/assets/${encodeURIComponent(assetId)}`);
    const name = data?.asset?.name || data?.name || assetId;
    const symbol = data?.asset?.symbol || data?.symbol || "";
    return {
      title: `${name} (${symbol}) — TokenShit`,
      description: `Check the shit score for ${name}. Price, risk, markets, and more.`,
    };
  } catch {
    return { title: `Token — TokenShit` };
  }
}

export default async function TokenPage({ params }: Props) {
  const { assetId } = await params;

  let data: Record<string, unknown> = {};
  let riskData: Record<string, unknown> = {};
  let markets: Record<string, unknown>[] = [];
  let variants: Record<string, unknown>[] = [];

  try {
    const [assetRes, riskRes, marketsRes, variantsRes] = await Promise.allSettled([
      apiFetch(`/assets/${encodeURIComponent(assetId)}?include=profile,risk,ohlcv,markets`),
      apiFetch(`/assets/${encodeURIComponent(assetId)}/risk-details`),
      apiFetch(`/assets/${encodeURIComponent(assetId)}/markets?limit=10`),
      apiFetch(`/assets/${encodeURIComponent(assetId)}/variants`),
    ]);

    if (assetRes.status === "fulfilled") data = assetRes.value;
    if (riskRes.status === "fulfilled") riskData = riskRes.value;
    // Prefer markets from includes (has source field) over standalone endpoint
    if (assetRes.status === "fulfilled") {
      const incMarkets = (assetRes.value?.includes?.markets as Record<string, unknown>) || {};
      if (incMarkets.ok) {
        const mData = (incMarkets.data as Record<string, unknown>) || {};
        markets = (mData.markets as Record<string, unknown>[]) || [];
      }
    }
    if (markets.length === 0 && marketsRes.status === "fulfilled") {
      const mr = marketsRes.value;
      markets = Array.isArray(mr)
        ? mr
        : (mr as Record<string, unknown>).markets as Record<string, unknown>[]
          || (mr as Record<string, unknown>).results as Record<string, unknown>[]
          || [];
    }
    if (variantsRes.status === "fulfilled") {
      const vr = variantsRes.value;
      variants = Array.isArray(vr) ? vr : (vr as Record<string, unknown>).variants as Record<string, unknown>[] || (vr as Record<string, unknown>).results as Record<string, unknown>[] || [];
    }
  } catch {
    // continue with defaults
  }

  // Map the nested API response structure
  const asset = (data.asset || data) as Record<string, unknown>;
  const includes = (data.includes || {}) as Record<string, Record<string, unknown>>;
  const profileInclude = includes.profile || {};
  const profileData = (profileInclude.ok ? profileInclude.data : profileInclude) as Record<string, unknown> || {};
  const riskInclude = includes.risk || {};
  const riskIncludeData = (riskInclude.ok ? riskInclude.data : riskInclude) as Record<string, unknown> || {};
  const stats = (asset.stats || {}) as Record<string, unknown>;
  const primaryVariant = (asset.primaryVariant || {}) as Record<string, unknown>;
  const primaryMarket = (primaryVariant.market || {}) as Record<string, unknown>;

  const name = (asset.name || assetId) as string;
  const symbol = (asset.symbol || "") as string;
  const logo = (asset.imageUrl || primaryMarket.logoURI || "") as string;
  const description = (profileData.description || "") as string;

  const price = (stats.price ?? primaryMarket.price ?? null) as number | null;
  const marketCap = (profileData.marketCap ?? stats.marketCap ?? null) as number | null;
  const volume24h = (profileData.volume24h ?? stats.volume24hUSD ?? null) as number | null;
  const liquidity = (stats.liquidity ?? primaryMarket.liquidity ?? null) as number | null;
  const fdv = (profileData.fdv ?? null) as number | null;
  const priceChange24h = (stats.priceChange24hPercent ?? profileData.priceChange24h ?? null) as number | null;
  const priceChange1h = (stats.priceChange1hPercent ?? null) as number | null;

  // Risk score from includes or separate risk call
  const marketScore = (riskIncludeData.marketScore || riskData.marketScore || {}) as Record<string, unknown>;
  const riskScore = (marketScore.score ?? null) as number | null;
  const riskLevel = (marketScore.label ?? marketScore.grade ?? null) as string | null;
  const riskComponents = (marketScore.components || {}) as Record<string, Record<string, unknown>>;
  const riskFactors = Object.entries(riskComponents).map(([key, val]) => ({
    name: key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
    score: val.score as number,
    description: val.status as string,
  }));

  return (
    <TokenPageWrapper assetId={assetId}>
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
        <div className="flex items-center gap-4">
          {logo ? (
            <img src={logo} alt={symbol} className="h-16 w-16 rounded-full bg-zinc-800" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center text-2xl font-bold text-zinc-400">
              {symbol?.slice(0, 2)}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-black text-foreground">{name}</h1>
            <p className="text-zinc-500 uppercase text-sm font-mono">{symbol}</p>
          </div>
        </div>
        <div className="sm:ml-auto flex items-end gap-4">
          <div className="text-right">
            <p className="text-3xl font-mono font-bold text-foreground">
              {formatPrice(price)}
            </p>
            <div className="flex gap-3 justify-end mt-1">
              {priceChange1h != null && (
                <span className={`text-sm font-mono ${percentColor(priceChange1h)}`}>
                  1h: {formatPercent(priceChange1h)}
                </span>
              )}
              {priceChange24h != null && (
                <span className={`text-sm font-mono ${percentColor(priceChange24h)}`}>
                  24h: {formatPercent(priceChange24h)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Market Cap", value: formatLargeNumber(marketCap) },
          { label: "24h Volume", value: formatLargeNumber(volume24h) },
          { label: "Liquidity", value: formatLargeNumber(liquidity) },
          { label: "FDV", value: formatLargeNumber(fdv) },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="text-xs text-zinc-500 mb-1">{s.label}</div>
            <div className="text-lg font-mono font-semibold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Vote */}
      <div className="mb-8">
        <VoteButtons assetId={assetId} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Chart + Markets */}
        <div className="lg:col-span-2 space-y-8">

          {/* Markets */}
          {markets.length > 0 && (
            <CollapsibleSection title="Markets & Pools" count={markets.length}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-zinc-500 text-xs border-b border-border">
                      <th className="text-left px-4 py-2 font-medium">DEX</th>
                      <th className="text-left px-4 py-2 font-medium">Pair</th>
                      <th className="text-right px-4 py-2 font-medium">Price</th>
                      <th className="text-right px-4 py-2 font-medium">Volume 24h</th>
                      <th className="text-right px-4 py-2 font-medium">Liquidity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {markets.map((m, i) => (
                      <tr
                        key={i}
                        className="border-b border-border last:border-0 hover:bg-card-hover transition-colors"
                      >
                        <td className="px-4 py-3 font-medium">
                          {(m.source || m.dexName || m.dex || "Unknown") as string}
                        </td>
                        <td className="px-4 py-3 text-zinc-400 font-mono text-xs">
                          {((m.base as Record<string, unknown>)?.symbol || m.baseSymbol || m.name || "") as string}
                          /
                          {((m.quote as Record<string, unknown>)?.symbol || m.quoteSymbol || "") as string}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {formatPrice(m.price as number)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {formatLargeNumber(m.volume24h as number)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {formatLargeNumber(m.liquidity as number)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleSection>
          )}

          {/* Variants */}
          {variants.length > 0 && (
            <CollapsibleSection title="Token Variants" count={variants.length}>
              <div className="divide-y divide-border">
                {variants.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3 hover:bg-card-hover transition-colors"
                  >
                    <div>
                      <span className="font-medium text-foreground">
                        {(v.name || v.symbol || "Variant") as string}
                      </span>
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple">
                        {(v.kind || "unknown") as string}
                      </span>
                      {v.chain ? (
                        <span className="ml-2 text-xs text-zinc-500">
                          {String(v.chain)}
                        </span>
                      ) : null}
                    </div>
                    {v.mint ? (
                      <code className="text-xs text-zinc-600 font-mono truncate max-w-[200px]">
                        {String(v.mint).slice(0, 8)}...{String(v.mint).slice(-4)}
                      </code>
                    ) : null}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}
        </div>

        {/* Right column: $HIT Score + Risk */}
        <div className="space-y-6">
          {/* $HIT Score */}
          <div className={`rounded-xl border border-border p-6 ${riskBg(riskScore)}`}>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{hitScoreEmoji(riskScore)}</div>
              <h3 className="text-lg font-bold text-foreground">$HIT Score</h3>
            </div>
            <div className="flex items-center justify-center mb-4">
              <div className={`text-5xl font-black font-mono ${riskColor(riskScore)}`}>
                {riskScore != null ? riskScore : "?"}
              </div>
              <span className="text-zinc-500 text-lg ml-1">/100</span>
            </div>
            {riskLevel && (
              <div className="text-center mb-3">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${riskColor(riskScore)} ${riskBg(riskScore)}`}
                >
                  {riskLevel}
                </span>
              </div>
            )}
            <p className="text-sm text-zinc-400 text-center italic">
              &ldquo;{hitScoreRoast(riskScore)}&rdquo;
            </p>
          </div>

          {/* Risk Factors */}
          {riskFactors.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground">Risk Breakdown</h3>
              </div>
              <div className="divide-y divide-border">
                {riskFactors.map((f, i) => (
                  <div key={i} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {f.name as string}
                      </span>
                      <span
                        className={`text-sm font-mono ${riskColor(f.score as number)}`}
                      >
                        {Number(f.score)}/100
                      </span>
                    </div>
                    {f.description ? (
                      <p className="text-xs text-zinc-500">
                        {String(f.description)}
                      </p>
                    ) : null}
                    <div className="mt-2 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          (f.score as number) >= 70
                            ? "bg-green-500"
                            : (f.score as number) >= 40
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${f.score as number}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-semibold text-foreground mb-2">About</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </TokenPageWrapper>
  );
}
