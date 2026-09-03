import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import {
  formatPrice,
  formatLargeNumber,
  formatPercent,
  percentColor,
  riskColor,
  riskBg,
  hitScoreRoast,
  hitScoreEmoji,
} from "@/lib/format";
import TokenPageWrapper from "@/components/TokenPageWrapper";
import CollapsibleSection from "@/components/CollapsibleSection";
import TokenNews from "@/components/TokenNews";
import { isSolanaMint } from "@/lib/lists";
import { extractMint, resolveAssetMeta } from "@/lib/resolveMeta";
import { redirect } from "next/navigation";
import Link from "next/link";
import CopyableAddress from "@/components/CopyableAddress";
import { TokenMark } from "@/components/TokenMark";
import { knownLogo } from "@/lib/asset-logos";
import { fetchRealMajorsLive } from "@/lib/day-game";

interface Props {
  params: Promise<{ assetId: string }>;
  searchParams: Promise<{ mint?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { assetId } = await params;
  const meta = await resolveAssetMeta(assetId);
  const name = meta.name || assetId;
  const symbol = meta.symbol || "";
  return {
    title: symbol ? `${name} (${symbol})` : name,
    description: `${name} on TOKEN$HIT. Play FOR PRIZES.`,
  };
}

async function jupiterPrice(mint: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.jup.ag/price/v3?ids=${encodeURIComponent(mint)}`,
      {
        headers: {
          "x-api-key":
            process.env.JUP_API_KEY ||
            process.env.JUPITER_API_KEY ||
            "",
        },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    const d = await res.json();
    const p = d?.[mint]?.usdPrice ?? d?.data?.[mint]?.price;
    return typeof p === "number" ? p : p != null ? Number(p) : null;
  } catch {
    return null;
  }
}

export default async function TokenPage({ params, searchParams }: Props) {
  const { assetId } = await params;
  const sp = await searchParams;
  let mintParam = sp.mint || extractMint(assetId) || "";

  if (isSolanaMint(assetId) && !assetId.startsWith("solana-")) {
    mintParam = assetId;
    try {
      const resolved = await apiFetch(
        `/assets/resolve?mint=${encodeURIComponent(assetId)}`
      );
      const canon = resolved.assetId || resolved.asset?.assetId;
      if (canon && canon !== assetId) {
        redirect(
          `/token/${encodeURIComponent(canon)}?mint=${encodeURIComponent(mintParam)}`
        );
      }
    } catch {
      /* fall through */
    }
  }

  let data: Record<string, unknown> = {};
  let riskData: Record<string, unknown> = {};
  let markets: Record<string, unknown>[] = [];
  let variants: Record<string, unknown>[] = [];

  try {
    const [assetRes, riskRes, marketsRes, variantsRes] = await Promise.allSettled([
      apiFetch(
        `/assets/${encodeURIComponent(assetId)}?include=profile,risk,ohlcv,markets`
      ),
      apiFetch(`/assets/${encodeURIComponent(assetId)}/risk-details`),
      apiFetch(`/assets/${encodeURIComponent(assetId)}/markets?limit=10`),
      apiFetch(`/assets/${encodeURIComponent(assetId)}/variants`),
    ]);

    if (assetRes.status === "fulfilled") data = assetRes.value;
    if (riskRes.status === "fulfilled") riskData = riskRes.value;
    if (assetRes.status === "fulfilled") {
      const incMarkets =
        (assetRes.value?.includes?.markets as Record<string, unknown>) || {};
      if (incMarkets.ok) {
        const mData = (incMarkets.data as Record<string, unknown>) || {};
        markets = (mData.markets as Record<string, unknown>[]) || [];
      }
    }
    if (markets.length === 0 && marketsRes.status === "fulfilled") {
      const mr = marketsRes.value;
      markets = Array.isArray(mr)
        ? mr
        : ((mr as Record<string, unknown>).markets as Record<string, unknown>[]) ||
          ((mr as Record<string, unknown>).results as Record<string, unknown>[]) ||
          [];
    }
    if (variantsRes.status === "fulfilled") {
      const vr = variantsRes.value;
      variants = Array.isArray(vr)
        ? vr
        : ((vr as Record<string, unknown>).variants as Record<
            string,
            unknown
          >[]) ||
          ((vr as Record<string, unknown>).results as Record<string, unknown>[]) ||
          [];
    }
  } catch {
    /* defaults */
  }

  const asset = (data.asset || data) as Record<string, unknown>;
  const includes = (data.includes || {}) as Record<
    string,
    Record<string, unknown>
  >;
  const profileInclude = includes.profile || {};
  const profileData =
    ((profileInclude.ok ? profileInclude.data : profileInclude) as Record<
      string,
      unknown
    >) || {};
  const riskInclude = includes.risk || {};
  const riskIncludeData =
    ((riskInclude.ok ? riskInclude.data : riskInclude) as Record<
      string,
      unknown
    >) || {};
  const stats = (asset.stats || {}) as Record<string, unknown>;
  const primaryVariant = (asset.primaryVariant || {}) as Record<string, unknown>;
  const primaryMarket = (primaryVariant.market || {}) as Record<string, unknown>;

  const displayMeta = await resolveAssetMeta(assetId);
  const name = (displayMeta.name ||
    (asset.name as string) ||
    assetId) as string;
  const symbol = (displayMeta.symbol ||
    (asset.symbol as string) ||
    "") as string;
  let logo = (displayMeta.logo ||
    (asset.imageUrl as string) ||
    (primaryMarket.logoURI as string) ||
    "") as string;
  if (mintParam && (!logo || logo.includes("j7tracker"))) {
    logo = `https://dd.dexscreener.com/ds-data/tokens/solana/${mintParam}.png`;
  }
  const description = (profileData.description || "") as string;

  let price = (stats.price ?? primaryMarket.price ?? null) as number | null;
  if (price == null && mintParam) {
    price = await jupiterPrice(mintParam);
  }
  let marketCap = (profileData.marketCap ??
    stats.marketCap ??
    null) as number | null;
  let volume24h = (profileData.volume24h ??
    stats.volume24hUSD ??
    null) as number | null;
  let liquidity = (stats.liquidity ??
    primaryMarket.liquidity ??
    null) as number | null;
  let fdv = (profileData.fdv ?? null) as number | null;
  let priceChange24h = (stats.priceChange24hPercent ??
    profileData.priceChange24h ??
    null) as number | null;
  let priceChange1h = (stats.priceChange1hPercent ?? null) as number | null;

  logo =
    knownLogo(symbol) ||
    knownLogo(name) ||
    (logo && String(logo).startsWith("http") ? logo : "") ||
    "";

  if (
    price == null ||
    volume24h == null ||
    marketCap == null ||
    !logo
  ) {
    try {
      const majors = await fetchRealMajorsLive();
      const u = (symbol || name || "").toUpperCase();
      const hit = majors.find(
        (m) =>
          m.assetId === assetId ||
          m.symbol.toUpperCase() === u ||
          m.name.toUpperCase() === u ||
          (u === "RIPPLE" && m.symbol.toUpperCase() === "XRP")
      );
      if (hit) {
        if (price == null && Number.isFinite(hit.price)) price = hit.price;
        if (volume24h == null && hit.volume24h) volume24h = hit.volume24h;
        if (!logo && hit.logo) logo = hit.logo;
        if (priceChange1h == null && hit.change1h != null)
          priceChange1h = hit.change1h;
      }
    } catch {
      /* majors miss */
    }
  }

  const marketScore = (riskIncludeData.marketScore ||
    riskData.marketScore ||
    {}) as Record<string, unknown>;
  const riskScore = (marketScore.score ?? null) as number | null;
  const riskLevel = (marketScore.label ??
    marketScore.grade ??
    null) as string | null;
  const riskComponents = (marketScore.components || {}) as Record<
    string,
    Record<string, unknown>
  >;
  const riskFactors = Object.entries(riskComponents).map(([key, val]) => ({
    name: key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
    score: val.score as number,
    description: val.status as string,
  }));

  const grade = hitScoreEmoji(riskScore);

  return (
    <TokenPageWrapper assetId={assetId}>
      <div className="mx-auto max-w-3xl px-3 sm:px-4 pt-3 sm:pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4 sm:space-y-5">
        {/* Compact token header */}
        <header className="rounded-2xl border border-border bg-card p-3.5 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <TokenMark
              logo={logo}
              symbol={symbol || name}
              assetId={assetId}
              mint={mintParam || null}
              size={64}
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-black text-foreground truncate leading-tight">
                {name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                {symbol ? (
                  <span className="text-sm font-mono text-zinc-400 uppercase">
                    ${symbol}
                  </span>
                ) : null}
                <span className="text-lg sm:text-xl font-mono font-bold text-white">
                  {formatPrice(price)}
                </span>
                {priceChange24h != null && (
                  <span
                    className={`text-xs font-mono ${percentColor(priceChange24h)}`}
                  >
                    24h {formatPercent(priceChange24h)}
                  </span>
                )}
                {priceChange1h != null && (
                  <span
                    className={`text-xs font-mono ${percentColor(priceChange1h)}`}
                  >
                    1h {formatPercent(priceChange1h)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stat chips */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "MCap", value: formatLargeNumber(marketCap) },
              { label: "Vol 24h", value: formatLargeNumber(volume24h) },
              { label: "Liq", value: formatLargeNumber(liquidity) },
              { label: "FDV", value: formatLargeNumber(fdv) },
            ]
              .filter((s) => s.value !== "—")
              .map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-border/80 bg-zinc-950/70 px-2.5 py-2"
              >
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  {s.label}
                </div>
                <div className="text-sm font-mono font-semibold text-zinc-100 truncate">
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {mintParam ? (
            <div className="mt-3">
              <CopyableAddress
                address={mintParam}
                label="Mint"
                explorer={`https://solscan.io/token/${mintParam}`}
              />
            </div>
          ) : null}
        </header>

        <Link
          href="/play"
          className="block rounded-2xl border border-neon/40 bg-neon/10 px-4 py-3 text-center font-orbitron text-sm font-bold uppercase tracking-wide text-neon hover:bg-neon/20"
        >
          Play FOR PRIZES
        </Link>

        {/* Score + noise */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className={`rounded-2xl border border-border p-5 ${riskBg(riskScore)}`}
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-zinc-500 text-center">
              $HIT score
            </p>
            <div className="flex items-end justify-center gap-1 mt-2">
              <span
                className={`text-5xl font-black font-mono ${riskColor(riskScore)}`}
              >
                {riskScore != null ? riskScore : "—"}
              </span>
              <span className="text-zinc-500 text-base mb-1.5">/100</span>
            </div>
            <div className="text-center mt-2">
              <span
                className={`inline-block px-2.5 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider ${riskColor(riskScore)} border border-current/20`}
              >
                {grade}
                {riskLevel ? ` · ${riskLevel}` : ""}
              </span>
            </div>
            <p className="text-xs text-zinc-400 text-center mt-3 leading-relaxed">
              {hitScoreRoast(riskScore)}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-1 min-h-[140px]">
            <TokenNews assetId={assetId} symbol={symbol} name={name} />
          </div>
        </div>

        {/* Secondary research */}
        {markets.length > 0 && (
          <CollapsibleSection title="Markets" count={markets.length}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider border-b border-border">
                    <th className="text-left px-3 py-2 font-medium">DEX</th>
                    <th className="text-left px-3 py-2 font-medium">Pair</th>
                    <th className="text-right px-3 py-2 font-medium">Price</th>
                    <th className="text-right px-3 py-2 font-medium">Vol</th>
                  </tr>
                </thead>
                <tbody>
                  {markets.slice(0, 8).map((m, i) => (
                    <tr
                      key={i}
                      className="border-b border-border last:border-0 hover:bg-card-hover"
                    >
                      <td className="px-3 py-2.5 font-medium text-xs">
                        {(m.source || m.dexName || m.dex || "—") as string}
                      </td>
                      <td className="px-3 py-2.5 text-zinc-400 font-mono text-[11px]">
                        {(
                          (m.base as Record<string, unknown>)?.symbol ||
                          m.baseSymbol ||
                          m.name ||
                          ""
                        ) as string}
                        /
                        {(
                          (m.quote as Record<string, unknown>)?.symbol ||
                          m.quoteSymbol ||
                          ""
                        ) as string}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs">
                        {formatPrice(m.price as number)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs">
                        {formatLargeNumber(m.volume24h as number)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleSection>
        )}

        {riskFactors.length > 0 && (
          <CollapsibleSection title="Risk breakdown" count={riskFactors.length}>
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
                    <p className="text-xs text-zinc-500">{String(f.description)}</p>
                  ) : null}
                  <div className="mt-2 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        (f.score as number) >= 70
                          ? "bg-neon"
                          : (f.score as number) >= 40
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(100, Number(f.score) || 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {variants.length > 0 && (
          <CollapsibleSection title="Variants" count={variants.length}>
            <div className="divide-y divide-border">
              {variants.slice(0, 12).map((v, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <span className="font-medium text-sm text-foreground">
                      {(v.name || v.symbol || "Variant") as string}
                    </span>
                    <span className="ml-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                      {(v.kind || "unknown") as string}
                    </span>
                  </div>
                  {v.mint ? (
                    <code className="text-[10px] text-zinc-600 font-mono">
                      {String(v.mint).slice(0, 4)}…{String(v.mint).slice(-4)}
                    </code>
                  ) : null}
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {description ? (
          <CollapsibleSection title="About">
            <div className="p-4">
              <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
            </div>
          </CollapsibleSection>
        ) : null}

        <p className="text-center text-[11px] text-zinc-600 pb-2">
          <Link href="/play" className="text-neon-blue hover:underline">
            Play FOR PRIZES
          </Link>
          {" · "}
          swipe for next bag
        </p>
      </div>
    </TokenPageWrapper>
  );
}
