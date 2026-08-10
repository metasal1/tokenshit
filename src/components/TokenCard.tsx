import Link from "next/link";
import { formatPrice, formatLargeNumber, formatPercent, percentColor } from "@/lib/format";

interface TokenCardProps {
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

export default function TokenCard({
  assetId,
  name,
  symbol,
  logo,
  price,
  priceChange24h,
  marketCap,
  volume24h,
  mint,
  isVariant,
}: TokenCardProps) {
  const href = mint
    ? `/token/${encodeURIComponent(assetId)}?mint=${encodeURIComponent(mint)}`
    : `/token/${encodeURIComponent(assetId)}`;

  return (
    <Link
      href={href}
      className="block rounded-xl border border-border bg-card p-4 hover:bg-card-hover card-glow transition-all group"
    >
      <div className="flex items-center gap-3 mb-3">
        {logo ? (
          <img
            src={logo}
            alt={symbol}
            className="h-10 w-10 rounded-full bg-zinc-800"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-400">
            {symbol?.slice(0, 2)}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground truncate group-hover:text-neon transition-colors">
            {name}
          </h3>
          <p className="text-xs text-zinc-500 uppercase">
            {symbol}
            {isVariant && mint ? (
              <span className="ml-1 normal-case text-zinc-600 font-mono">
                {mint.slice(0, 4)}…{mint.slice(-4)}
              </span>
            ) : null}
          </p>
        </div>
        {priceChange24h != null && (
          <span
            className={`ml-auto text-sm font-mono font-medium ${percentColor(priceChange24h)}`}
          >
            {formatPercent(priceChange24h)}
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="text-zinc-500">Price</div>
          <div className="font-mono font-medium">{formatPrice(price)}</div>
        </div>
        <div>
          <div className="text-zinc-500">{isVariant ? "Kind" : "MCap"}</div>
          <div className="font-mono font-medium">
            {isVariant ? "LST" : formatLargeNumber(marketCap)}
          </div>
        </div>
        <div>
          <div className="text-zinc-500">{isVariant ? "Mint" : "Vol 24h"}</div>
          <div className="font-mono font-medium truncate">
            {isVariant && mint
              ? `${mint.slice(0, 4)}…`
              : formatLargeNumber(volume24h)}
          </div>
        </div>
      </div>
    </Link>
  );
}
