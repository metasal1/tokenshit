"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EmojiIcon } from "@/components/EmojiIcon";
import { SHIT_SYMBOL } from "@/lib/shit-token";

type Winner = {
  utcHour: string;
  hourLabel: string;
  settledAt: string | null;
  assetId: string | null;
  symbol: string;
  name: string;
  logo: string;
  pct: number | null;
  winner: string | null;
  prize: number;
  fee: number;
  pot: number;
  sig: string | null;
};

function fmtPct(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function shortAddr(w: string | null) {
  if (!w) return "Treasury";
  if (w.length < 12) return w;
  return `${w.slice(0, 4)}…${w.slice(-4)}`;
}

export default function WinnersBoard({ side }: { side: "hit" | "shit" }) {
  const hit = side === "hit";
  const [rows, setRows] = useState<Winner[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/day/winners?side=${side}&limit=60`, { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "load failed");
        if (!cancelled) setRows(d.winners || []);
      })
      .catch((e) => {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [side]);

  return (
    <div className="mx-auto w-full max-w-lg px-3 sm:px-4 pt-4 pb-10 space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2">
        <div className="flex items-center gap-2">
          <EmojiIcon size={28}>{hit ? "🎯" : "💀"}</EmojiIcon>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {hit ? "Hitters" : "Shitters"}
          </h1>
        </div>
        <p className="text-xs text-zinc-500">
          Past hour {hit ? "HIT" : "SHIT"} bags + wallet winners (or treasury).
          Newest first.
        </p>
        <div className="flex gap-3 text-xs">
          <Link
            href={hit ? "/shitters" : "/hitters"}
            className="text-neon-blue hover:underline"
          >
            {hit ? "See Shitters →" : "← See Hitters"}
          </Link>
          <Link href="/hour" className="text-zinc-500 hover:text-white">
            Play this hour
          </Link>
        </div>
      </div>

      {err && (
        <p className="text-sm text-red-400 border border-red-900/40 rounded-lg px-3 py-2">
          {err}
        </p>
      )}

      {!rows && !err && (
        <div className="flex justify-center py-12">
          <EmojiIcon size={32} className="animate-spin opacity-80" label="Loading">
            💫
          </EmojiIcon>
        </div>
      )}

      {rows && rows.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-zinc-500">
          No settled {hit ? "HIT" : "SHIT"} winners yet. Stake this hour.
        </div>
      )}

      <div className="space-y-2">
        {rows?.map((w, i) => (
          <Link
            key={w.utcHour}
            href={`/day/${encodeURIComponent(w.utcHour)}`}
            className={`block rounded-xl border p-3 sm:p-4 transition-colors hover:bg-zinc-900/80 ${
              hit
                ? "border-green-900/40 bg-green-950/20"
                : "border-red-900/40 bg-red-950/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-xs font-mono text-zinc-600 w-6 shrink-0">
                #{i + 1}
              </div>
              {w.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={w.logo}
                  alt=""
                  className="h-10 w-10 rounded-full bg-zinc-800 shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-zinc-800 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-white truncate">
                    {w.symbol}
                  </span>
                  <span
                    className={`font-mono text-sm shrink-0 ${
                      hit ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {fmtPct(w.pct)}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 truncate">
                  {w.hourLabel || w.utcHour}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-mono text-neon">
                  {shortAddr(w.winner)}
                </div>
                <div className="text-[10px] text-zinc-500">
                  {w.prize > 0
                    ? `${w.prize.toLocaleString()} $${SHIT_SYMBOL}`
                    : "treasury"}
                </div>
              </div>
            </div>
            {w.winner && (
              <div className="mt-2 pt-2 border-t border-white/5 text-[10px] font-mono text-zinc-600 break-all">
                {w.winner}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
