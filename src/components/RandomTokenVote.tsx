"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import VoteButtons from "./VoteButtons";
import SkipNextButton from "./SkipNextButton";

interface TokenInfo {
  assetId: string;
  name: string;
  symbol: string;
  logo: string;
}

export default function RandomTokenVote() {
  const [token, setToken] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRandom = () => {
    setLoading(true);
    fetch("/api/random-token-detail")
      .then((r) => r.json())
      .then((d) => {
        if (d.assetId) setToken(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRandom();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-zinc-500 text-sm">
          Sniffing the chain for something unserious...
        </p>
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {token.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={token.logo}
              alt={token.symbol}
              className="w-10 h-10 rounded-full bg-zinc-800 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-400 shrink-0">
              {token.symbol?.slice(0, 2)}
            </div>
          )}
          <div className="min-w-0">
            <Link
              href={`/token/${token.assetId}`}
              className="font-bold text-foreground hover:text-neon-blue transition-colors truncate block"
            >
              {token.name}
            </Link>
            <p className="text-xs text-zinc-500 font-mono">{token.symbol}</p>
          </div>
        </div>
        <SkipNextButton
          variant="chip"
          label="Next case"
          sublabel="shuffle"
          onClick={fetchRandom}
          disabled={loading}
        />
      </div>
      <div className="p-4 pt-3">
        <VoteButtons assetId={token.assetId} symbol={token.symbol} />
      </div>
    </div>
  );
}
