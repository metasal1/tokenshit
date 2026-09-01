"use client";

import { useState } from "react";
import Link from "next/link";
import { knownLogo, orbLogo } from "@/lib/asset-logos";

export function TokenMark({
  logo,
  symbol,
  mint,
  assetId,
  size = 28,
  href,
}: {
  logo?: string | null;
  symbol?: string | null;
  mint?: string | null;
  assetId?: string | null;
  size?: number;
  href?: string | null;
}) {
  const letter = (symbol || "?").replace(/^\$/, "").slice(0, 1).toUpperCase();
  const first =
    knownLogo(symbol) ||
    (logo && logo.startsWith("http") && !/orbmarkets/i.test(logo) ? logo : "") ||
    orbLogo(mint || assetId, symbol) ||
    (logo && logo.startsWith("http") ? logo : "") ||
    "";
  const [src, setSrc] = useState(first);
  const [broken, setBroken] = useState(!first);
  const dim = `${size}px`;

  const mark =
    src && !broken ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={symbol || ""}
        width={size}
        height={size}
        className="shrink-0 rounded-full bg-zinc-900 object-cover ring-1 ring-white/10"
        style={{ width: dim, height: dim }}
        onError={() => {
          const k = knownLogo(symbol);
          if (k && k !== src) {
            setSrc(k);
            return;
          }
          setBroken(true);
        }}
      />
    ) : (
      <div
        className="flex shrink-0 items-center justify-center rounded-full bg-zinc-800 font-orbitron font-bold text-neon ring-1 ring-white/10"
        style={{ width: dim, height: dim, fontSize: Math.max(11, size * 0.38) }}
        aria-hidden
      >
        {letter}
      </div>
    );

  const to = href || (assetId ? `/token/${encodeURIComponent(assetId)}` : "");
  if (!to) return mark;
  return (
    <Link
      href={to}
      className="shrink-0 rounded-full hover:ring-2 hover:ring-neon/60"
      aria-label={symbol || "token"}
    >
      {mark}
    </Link>
  );
}
