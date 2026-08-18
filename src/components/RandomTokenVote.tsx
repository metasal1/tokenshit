"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import VoteButtons from "./VoteButtons";
import SkipNextButton from "./SkipNextButton";
import RandomTokenSkeleton, { FunLoadTicker } from "./RandomTokenSkeleton";
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
    return <RandomTokenSkeleton />;
  }

  if (!token) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card">
      {loading ? (
        <div className="border-b border-neon/20">
          <FunLoadTicker />
        </div>
      ) : null}

      <div
        className={`flex items-center justify-between gap-3 border-b border-border p-4 transition-opacity ${
          loading ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          {token.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={token.logo}
              alt={token.symbol}
              className="h-10 w-10 shrink-0 rounded-full bg-zinc-800"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-zinc-400">
              {token.symbol?.slice(0, 2)}
            </div>
          )}
          <div className="min-w-0">
            <Link
              href={`/token/${token.assetId}`}
              className="block truncate font-bold text-foreground transition-colors hover:text-neon-blue"
            >
              {token.name}
            </Link>
            <p className="font-mono text-xs text-zinc-500">
              {token.symbol}
              {token.list ? (
                <span className="text-zinc-600"> · {token.list}</span>
              ) : null}
            </p>
          </div>
        </div>
        <SkipNextButton
          variant="chip"
          label={loading ? "Loading…" : "Next bag"}
          sublabel="shuffle"
          onClick={fetchRandom}
          disabled={loading}
        />
      </div>

      {loading ? (
        <div className="space-y-3 p-4">
          <FunLoadTicker compact />
          <div className="grid grid-cols-2 gap-3 opacity-40">
            <div className="skeleton h-24 rounded-xl" />
            <div className="skeleton h-24 rounded-xl" />
          </div>
        </div>
      ) : (
        <div className="p-4 pt-3">
          <VoteButtons assetId={token.assetId} symbol={token.symbol} />
        </div>
      )}
    </div>
  );
}
