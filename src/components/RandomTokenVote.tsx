"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import VoteButtons from "./VoteButtons";

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
      .then(r => r.json())
      .then(d => {
        if (d.assetId) setToken(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRandom(); }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-zinc-500 text-sm">Loading random token...</p>
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          {token.logo ? (
            <img src={token.logo} alt={token.symbol} className="w-10 h-10 rounded-full bg-zinc-800" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-400">
              {token.symbol?.slice(0, 2)}
            </div>
          )}
          <div>
            <Link href={`/token/${token.assetId}`} className="font-bold text-foreground hover:text-neon-blue transition-colors">
              {token.name}
            </Link>
            <p className="text-xs text-zinc-500 font-mono">{token.symbol}</p>
          </div>
        </div>
        <button
          onClick={fetchRandom}
          className="text-xs px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
        >
          🎲 Skip
        </button>
      </div>
      <div className="p-4">
        <VoteButtons assetId={token.assetId} />
      </div>
    </div>
  );
}
