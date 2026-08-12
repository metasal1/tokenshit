"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import VoteButtons from "./VoteButtons";
import SkipNextButton from "./SkipNextButton";
import { getVoterId } from "@/lib/privy-identity";
import { usePrivy } from "@privy-io/react-auth";

interface TokenInfo {
  assetId: string;
  name: string;
  symbol: string;
  logo: string;
  list?: string;
}

const RECENT_KEY = "tokenshit_recent_cases";
const RECENT_MAX = 24;

function readRecent(): string[] {
  try {
    const raw = sessionStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.map(String).slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

function pushRecent(id: string) {
  try {
    const cur = readRecent().filter((x) => x !== id);
    cur.unshift(id);
    sessionStorage.setItem(
      RECENT_KEY,
      JSON.stringify(cur.slice(0, RECENT_MAX))
    );
  } catch {
    /* ignore */
  }
}

export default function RandomTokenVote() {
  const { user } = usePrivy();
  const [token, setToken] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const currentId = useRef<string | null>(null);

  const fetchRandom = useCallback(() => {
    setLoading(true);
    const recent = readRecent();
    const voter = getVoterId(user);
    const params = new URLSearchParams();
    if (currentId.current) params.set("exclude", currentId.current);
    if (recent.length) params.set("excludeIds", recent.join(","));
    if (voter) params.set("username", voter);

    fetch(`/api/random-token-detail?${params.toString()}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.assetId) {
          currentId.current = d.assetId;
          pushRecent(d.assetId);
          setToken(d);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    fetchRandom();
  }, [fetchRandom]);

  if (loading && !token) {
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
            <p className="text-xs text-zinc-500 font-mono">
              {token.symbol}
              {token.list ? (
                <span className="text-zinc-600"> · {token.list}</span>
              ) : null}
            </p>
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
