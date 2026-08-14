"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { EmojiIcon } from "@/components/EmojiIcon";
import {
  fmtHold,
  fmtTokenAmount,
  shortAddr,
  solnewPortfolio,
  solscanAccount,
} from "@/lib/whales";
import { SHIT_SYMBOL } from "@/lib/shit-token";

type Holder = {
  rank: number;
  owner: string;
  tokenAccount: string;
  amount: number;
  pctSupply: number;
  label: string | null;
  isYou: boolean;
  isTreasury: boolean;
  isPool: boolean;
  delta: number | null;
  holdSecAvg: number | null;
  holdLabel: string | null;
  acqMix: string | null;
  firstAcquiredTs: number | null;
};

type Board = {
  ok?: boolean;
  supply?: number;
  holders?: Holder[];
  movements?: {
    owner: string;
    label: string | null;
    delta: number;
    amount: number;
    pctSupply: number;
  }[];
  updatedAt?: string;
  source?: string;
  tradesFeed?: string;
  error?: string;
};

export default function WhalesBoard() {
  const [data, setData] = useState<Board | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback((refresh = false) => {
    setLoading(true);
    setErr(null);
    const q = refresh ? "?refresh=1&limit=20" : "?limit=20";
    fetch(`/api/token/whales${q}`, { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok && !j.holders) throw new Error(j.error || `HTTP ${r.status}`);
        setData(j);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(false);
    const t = window.setInterval(() => load(false), 90_000);
    return () => window.clearInterval(t);
  }, [load]);

  const holders = data?.holders || [];
  const movements = data?.movements || [];

  return (
    <div className="mx-auto w-full max-w-4xl px-3 sm:px-4 pt-4 sm:pt-6 pb-16 space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-orbitron uppercase tracking-[0.22em] text-neon">
            Watch
          </p>
          <h1 className="text-2xl sm:text-3xl font-monoton leading-none">
            <span className="neon-text">WHALE</span>
            <span className="neon-dollar">$</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1.5 max-w-lg">
            Top ${SHIT_SYMBOL} holders · how long they&apos;ve held · moves vs last
            snapshot.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => load(true)}
            disabled={loading}
            className="min-h-10 rounded-full border border-border bg-card px-4 text-xs font-orbitron uppercase tracking-wider text-zinc-300 hover:border-neon/50 disabled:opacity-50"
          >
            {loading ? "…" : "Refresh"}
          </button>
          {data?.tradesFeed && (
            <a
              href={data.tradesFeed}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-10 inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-4 text-xs font-orbitron uppercase tracking-wider text-sky-300 hover:bg-sky-500/20"
            >
              Live TG
            </a>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat
          label="Supply"
          value={
            data?.supply != null ? fmtTokenAmount(data.supply) : loading ? "…" : "—"
          }
        />
        <Stat
          label="Tracked"
          value={holders.length ? String(holders.length) : loading ? "…" : "—"}
        />
        <Stat
          label="Moves"
          value={
            movements.length ? String(movements.length) : loading ? "…" : "0"
          }
        />
        <Stat
          label="Updated"
          value={
            data?.updatedAt
              ? new Date(data.updatedAt).toLocaleTimeString()
              : loading
                ? "…"
                : "—"
          }
        />
      </div>

      {err && (
        <p className="text-sm text-red-400 border border-red-900/40 rounded-xl px-3 py-2">
          {err}
        </p>
      )}

      {/* Movements */}
      <section className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-3 sm:px-4 py-2.5 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-orbitron uppercase tracking-wide text-white">
            Movements
          </h2>
          <span className="text-[10px] text-zinc-600">vs last snapshot</span>
        </div>
        {loading && !movements.length ? (
          <div className="flex justify-center py-10">
            <EmojiIcon size={28} className="animate-spin">
              💫
            </EmojiIcon>
          </div>
        ) : !movements.length ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-600">
            No size moves since last check. Refresh after a few minutes.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {movements.slice(0, 12).map((m) => {
              const up = m.delta > 0;
              return (
                <li
                  key={m.owner}
                  className="flex items-center gap-3 px-3 sm:px-4 py-2.5 text-sm"
                >
                  <span
                    className={`font-mono font-bold tabular-nums w-20 shrink-0 ${
                      up ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {up ? "+" : ""}
                    {fmtTokenAmount(m.delta)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-white truncate">
                      {m.label || shortAddr(m.owner, 6)}
                    </div>
                    <a
                      href={solnewPortfolio(m.owner)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-zinc-500 hover:text-neon-blue"
                    >
                      {shortAddr(m.owner, 6)}
                    </a>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
                    {m.pctSupply.toFixed(2)}%
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Holders table */}
      <section className="rounded-2xl border border-neon/30 bg-card overflow-hidden">
        <div className="px-3 sm:px-4 py-2.5 border-b border-neon/20 bg-neon/5 flex items-center justify-between gap-2">
          <h2 className="text-sm font-orbitron uppercase tracking-wide text-white">
            Holders
          </h2>
          <span className="text-[10px] text-zinc-500">
            Hold time via trade history
          </span>
        </div>

        {loading && !holders.length ? (
          <div className="flex justify-center py-16">
            <EmojiIcon size={32} className="animate-spin">
              💫
            </EmojiIcon>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[10px] font-orbitron uppercase tracking-wider text-zinc-500 border-b border-border">
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Wallet</th>
                  <th className="px-3 py-2 font-medium text-right">Amount</th>
                  <th className="px-3 py-2 font-medium text-right hidden sm:table-cell">
                    %
                  </th>
                  <th className="px-3 py-2 font-medium text-right">Held</th>
                  <th className="px-3 py-2 font-medium text-right hidden md:table-cell">
                    Δ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {holders.map((h) => (
                  <tr
                    key={h.owner}
                    className={`hover:bg-zinc-900/50 ${
                      h.isYou
                        ? "bg-neon/5"
                        : h.isTreasury
                          ? "bg-sky-500/5"
                          : h.isPool
                            ? "bg-zinc-900/40"
                            : ""
                    }`}
                  >
                    <td className="px-3 py-2.5 font-mono text-zinc-500 text-xs">
                      {h.rank}
                    </td>
                    <td className="px-3 py-2.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <a
                          href={solnewPortfolio(h.owner)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-white hover:text-neon truncate max-w-[11rem] sm:max-w-none"
                        >
                          {h.label || shortAddr(h.owner, 5)}
                        </a>
                        {h.isYou && (
                          <span className="text-[9px] font-orbitron uppercase tracking-wider text-black bg-neon rounded px-1.5 py-0.5">
                            you
                          </span>
                        )}
                        {h.isTreasury && (
                          <span className="text-[9px] font-orbitron uppercase tracking-wider text-sky-200 bg-sky-500/20 rounded px-1.5 py-0.5">
                            treasury
                          </span>
                        )}
                        {h.isPool && (
                          <span className="text-[9px] font-orbitron uppercase tracking-wider text-zinc-400 border border-border rounded px-1.5 py-0.5">
                            pool
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-0.5">
                        <a
                          href={solscanAccount(h.owner)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-mono text-zinc-600 hover:text-neon-blue"
                        >
                          {shortAddr(h.owner, 4)}
                        </a>
                        {h.holdLabel && (
                          <span
                            className="text-[10px] text-zinc-600 truncate max-w-[12rem]"
                            title={h.holdLabel}
                          >
                            {h.holdLabel}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-white">
                      {fmtTokenAmount(h.amount)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-zinc-400 hidden sm:table-cell">
                      {h.pctSupply >= 0.01
                        ? `${h.pctSupply.toFixed(2)}%`
                        : "<0.01%"}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-zinc-300">
                      {fmtHold(h.holdSecAvg)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums hidden md:table-cell">
                      {h.delta == null ? (
                        <span className="text-zinc-700">—</span>
                      ) : (
                        <span
                          className={
                            h.delta > 0
                              ? "text-green-400"
                              : h.delta < 0
                                ? "text-red-400"
                                : "text-zinc-600"
                          }
                        >
                          {h.delta > 0 ? "+" : ""}
                          {fmtTokenAmount(h.delta)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-center text-[11px] text-zinc-600 space-x-2">
        <Link href="/play" className="text-neon-blue hover:underline">
          Play
        </Link>
        <span>·</span>
        <Link href="/swap" className="text-neon-blue hover:underline">
          Swap
        </Link>
        <span>·</span>
        <Link href="/" className="hover:text-zinc-400">
          Home
        </Link>
        {data?.source && (
          <>
            <span>·</span>
            <span className="font-mono">{data.source}</span>
          </>
        )}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5">
      <div className="text-[9px] font-orbitron uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div className="text-sm sm:text-base font-mono font-semibold text-white tabular-nums mt-0.5">
        {value}
      </div>
    </div>
  );
}
