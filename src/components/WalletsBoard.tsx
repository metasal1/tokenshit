"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EmojiIcon } from "@/components/EmojiIcon";
import {
  PLAY_POT_ADDRESS,
  SHIT_SYMBOL,
  TREASURY_ADDRESS,
} from "@/lib/shit-token";
import { HOUR_PRODUCT } from "@/lib/hour-product";

type Winner = {
  utcHour: string;
  hourLabel: string;
  winner: string | null;
  prize: number;
  symbol: string;
  pct: number | null;
  sig: string | null;
};

function short(w: string) {
  if (w.length < 12) return w;
  return `${w.slice(0, 4)}…${w.slice(-4)}`;
}

function fmtPct(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export default function WalletsBoard() {
  const [hit, setHit] = useState<Winner[]>([]);
  const [shit, setShit] = useState<Winner[]>([]);
  const [pot, setPot] = useState<{ shit?: number; sol?: number } | null>(null);
  const [treasury, setTreasury] = useState<{ shit?: number; sol?: number } | null>(
    null
  );
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [h, s, t] = await Promise.all([
          fetch("/api/day/winners?side=hit&limit=24", { cache: "no-store" }).then(
            (r) => r.json()
          ),
          fetch("/api/day/winners?side=shit&limit=24", {
            cache: "no-store",
          }).then((r) => r.json()),
          fetch("/api/treasury", { cache: "no-store" }).then((r) => r.json()),
        ]);
        if (cancelled) return;
        setHit((h.winners || []).filter((w: Winner) => w.winner));
        setShit((s.winners || []).filter((w: Winner) => w.winner));
        setPot(t.pot || null);
        setTreasury({ shit: t.shit, sol: t.sol });
      } catch (e) {
        if (!cancelled)
          setErr(e instanceof Error ? e.message : "load failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = [
    ...hit.map((w) => ({ ...w, side: "hit" as const })),
    ...shit.map((w) => ({ ...w, side: "shit" as const })),
  ].sort((a, b) => String(b.utcHour).localeCompare(String(a.utcHour)));

  // unique wallets with last prize
  const byWallet = new Map<
    string,
    { last: (typeof rows)[0]; total: number; wins: number }
  >();
  for (const r of rows) {
    if (!r.winner) continue;
    const cur = byWallet.get(r.winner);
    if (!cur) {
      byWallet.set(r.winner, { last: r, total: r.prize || 0, wins: 1 });
    } else {
      cur.total += r.prize || 0;
      cur.wins += 1;
      if (String(r.utcHour) > String(cur.last.utcHour)) cur.last = r;
    }
  }
  const wallets = [...byWallet.entries()].sort(
    (a, b) => b[1].total - a[1].total
  );

  return (
    <div className="mx-auto w-full max-w-lg px-3 sm:px-4 pt-4 pb-12 space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <EmojiIcon size={28}>👛</EmojiIcon>
          <div>
            <p className="text-[10px] font-orbitron uppercase tracking-[0.2em] text-neon">
              {HOUR_PRODUCT.name}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-orbitron tracking-wide">
              Wallets
            </h1>
          </div>
        </div>
        <p className="text-sm text-zinc-400">
          Prize winners + pot / house wallets. On-chain. Receipt or it didn&apos;t
          happen.
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link href="/play" className="text-neon hover:underline">
            Play
          </Link>
          <Link href="/winners" className="text-neon-blue hover:underline">
            Winners
          </Link>
          <a
            href={`https://solscan.io/account/${PLAY_POT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-300 hover:underline"
          >
            Pot on Solscan
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <a
          href={`https://solscan.io/account/${PLAY_POT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 hover:border-amber-400/50 transition"
        >
          <p className="text-[10px] font-orbitron uppercase tracking-wider text-amber-300">
            Play pot
          </p>
          <p className="font-mono text-[11px] text-zinc-400 break-all mt-1">
            {PLAY_POT_ADDRESS}
          </p>
          <p className="mt-2 text-lg font-mono font-bold text-amber-200">
            {(pot?.shit ?? 0).toLocaleString()} ${SHIT_SYMBOL}
          </p>
          <p className="text-xs text-zinc-500">
            {(pot?.sol ?? 0).toFixed(4)} SOL gas
          </p>
        </a>
        <a
          href={`https://solscan.io/account/${TREASURY_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-neon/25 bg-neon/5 p-4 hover:border-neon/50 transition"
        >
          <p className="text-[10px] font-orbitron uppercase tracking-wider text-neon">
            House / claims
          </p>
          <p className="font-mono text-[11px] text-zinc-400 break-all mt-1">
            {TREASURY_ADDRESS}
          </p>
          <p className="mt-2 text-lg font-mono font-bold text-white">
            {(treasury?.shit ?? 0).toLocaleString()} ${SHIT_SYMBOL}
          </p>
          <p className="text-xs text-zinc-500">
            {(treasury?.sol ?? 0).toFixed(4)} SOL gas
          </p>
        </a>
      </div>

      {err && (
        <p className="text-sm text-red-400 border border-red-900/40 rounded-xl px-3 py-2">
          {err}
        </p>
      )}

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <EmojiIcon size={18}>🏆</EmojiIcon>
          <h2 className="text-sm font-orbitron uppercase tracking-wide text-white">
            Winner wallets
          </h2>
        </div>
        {!wallets.length ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-600">
            No paid winners yet — play an hour and cook.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-900">
            {wallets.map(([addr, info]) => {
              const r = info.last;
              const hitSide = r.side === "hit";
              return (
                <li key={addr} className="px-4 py-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <a
                      href={`https://solscan.io/account/${addr}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-neon hover:underline break-all"
                    >
                      {addr}
                    </a>
                    <span className="shrink-0 font-mono text-xs text-zinc-300">
                      {info.total.toLocaleString()} ${SHIT_SYMBOL}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-500">
                    <span
                      className={
                        hitSide ? "text-green-400" : "text-red-400"
                      }
                    >
                      {hitSide ? "🎯 HIT" : "💀 SHIT"} ${r.symbol}{" "}
                      {fmtPct(r.pct)}
                    </span>
                    <span>·</span>
                    <span>{info.wins} win{info.wins === 1 ? "" : "s"}</span>
                    <span>·</span>
                    <Link
                      href={`/play/${encodeURIComponent(r.utcHour)}`}
                      className="text-neon-blue hover:underline"
                    >
                      {r.hourLabel || r.utcHour}
                    </Link>
                    {r.sig && (
                      <>
                        <span>·</span>
                        <a
                          href={`https://solscan.io/tx/${r.sig}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neon-blue hover:underline"
                        >
                          payout {short(r.sig)}
                        </a>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
