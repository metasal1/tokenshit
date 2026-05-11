"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import VoteButtons from "./VoteButtons";
import RandomTokenSkeleton from "./RandomTokenSkeleton";
import { sfx } from "@/lib/sfx";

interface TokenInfo {
  assetId: string;
  name: string;
  symbol: string;
  logo: string;
}

export default function RandomTokenVote() {
  const { user } = usePrivy();
  const [token, setToken] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const username = user?.twitter?.username?.toLowerCase() || null;

  const fetchRandom = (currentAssetId?: string | null) => {
    sfx.whoosh();
    setLoading(true);
    const params = new URLSearchParams();
    if (username) params.set("username", username);
    if (currentAssetId) params.set("exclude", currentAssetId);
    const qs = params.toString();
    fetch(`/api/random-token-detail${qs ? `?${qs}` : ""}`)
      .then(r => r.json())
      .then(d => {
        if (d.assetId) setToken(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRandom(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [username]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        fetchRandom(token?.assetId);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [token?.assetId, username]);

  if (loading) return <RandomTokenSkeleton />;

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
          onClick={() => fetchRandom(token.assetId)}
          title="Random token (R)"
          className="text-xs px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors flex items-center gap-1.5"
        >
          <span>Skip</span>
          <kbd className="hidden sm:inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-[11px] font-mono font-bold text-zinc-300 bg-zinc-800 border border-zinc-700 border-b-2 rounded">R</kbd>
        </button>
      </div>
      <div className="p-4">
        <VoteButtons assetId={token.assetId} name={token.name} symbol={token.symbol} />
      </div>
    </div>
  );
}
