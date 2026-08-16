"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GLOBAL_TREASURY_DAILY_DROP,
  PLAY_POT_ADDRESS,
  SHIT_SYMBOL,
  TREASURY_ADDRESS,
  formatCountdown,
  playPotPortfolioUrl,
  treasurySolscanUrl,
} from "@/lib/shit-token";
import { BalanceSkeleton } from "@/components/StatLoader";

type GlobalPayload = {
  shit?: number;
  sol?: number;
  pot?: { shit?: number; sol?: number; address?: string };
  global?: {
    nextDropAt?: string;
    nextDropAtMs?: number;
    msRemaining?: number;
    dropAmount?: number;
    droppedToday?: boolean;
    serverNowMs?: number;
    lastDrop?: {
      amount: number;
      signature: string | null;
      droppedAt: string | null;
      utcDay: string | null;
    } | null;
  };
};

function useUtcCountdown(targetMs: number | null, serverSkewMs: number) {
  // null until client mount — Date.now() in useState caused React #418 (SSR ≠ client)
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now() + serverSkewMs);
    const t = setInterval(() => setNow(Date.now() + serverSkewMs), 250);
    return () => clearInterval(t);
  }, [serverSkewMs, targetMs]);

  if (now == null || targetMs == null) {
    return { h: "--", m: "--", s: "--", totalMs: 0 };
  }
  const ms = Math.max(0, targetMs - now);
  return { ...formatCountdown(ms), totalMs: ms };
}

function Digit({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center min-w-[2.75rem] sm:min-w-[3.25rem]">
      <span className="font-mono text-xl sm:text-3xl font-black tabular-nums text-white tracking-tight leading-none">
        {value}
      </span>
      <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-500 mt-1">
        {label}
      </span>
    </div>
  );
}

function fmtBal(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function GlobalTreasuryBanner({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const [data, setData] = useState<GlobalPayload | null>(null);
  const [skew, setSkew] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = () => {
      const t0 = Date.now();
      fetch("/api/treasury")
        .then((r) => r.json())
        .then((d: GlobalPayload) => {
          if (!alive) return;
          const serverNow = d.global?.serverNowMs;
          if (typeof serverNow === "number") {
            const rtt = (Date.now() - t0) / 2;
            setSkew(serverNow + rtt - Date.now());
          }
          setData(d);
        })
        .catch(() => {})
        .finally(() => {
          if (alive) setLoading(false);
        });
    };
    load();
    const t = setInterval(load, 30_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const targetMs = useMemo(() => {
    if (data?.global?.nextDropAtMs) return data.global.nextDropAtMs;
    // Don't compute UTC midnight during SSR/hydration — Date differs server vs client
    return null;
  }, [data]);

  // Client-only fallback once mounted if API slow
  const [fallbackTarget, setFallbackTarget] = useState<number | null>(null);
  useEffect(() => {
    if (targetMs != null) {
      setFallbackTarget(null);
      return;
    }
    const n = Date.now();
    const d = new Date(n);
    d.setUTCHours(0, 0, 0, 0);
    if (d.getTime() <= n) d.setUTCDate(d.getUTCDate() + 1);
    setFallbackTarget(d.getTime());
  }, [targetMs]);

  const cd = useUtcCountdown(targetMs ?? fallbackTarget, skew);
  const dropAmt =
    data?.global?.dropAmount ?? GLOBAL_TREASURY_DAILY_DROP;
  const droppedToday = Boolean(data?.global?.droppedToday);
  const shit = data?.shit;
  const sol = data?.sol;

  if (compact) {
    return (
      <a
        href="/claim"
        className={`flex items-center gap-2 sm:gap-3 rounded-lg border border-neon/30 bg-neon/5 px-2.5 py-1.5 hover:border-neon/60 transition-colors ${className}`}
        title="Global treasury · next drop UTC 00:00"
      >
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 hidden sm:inline">
          Treasury
        </span>
        <span className="font-mono text-neon text-xs sm:text-sm font-bold tabular-nums">
          {loading || shit == null ? (
            <BalanceSkeleton className="h-3.5 w-12 align-middle" />
          ) : (
            fmtBal(shit)
          )}
        </span>
        <span className="text-zinc-600">·</span>
        <span className="font-mono text-xs text-zinc-300 tabular-nums">
          {cd.h}:{cd.m}:{cd.s}
        </span>
        <span className="text-[10px] text-zinc-600 hidden md:inline">UTC</span>
      </a>
    );
  }

  return (
    <section
      className={`rounded-xl border border-neon/40 bg-gradient-to-br from-neon/10 via-card to-card p-4 sm:p-5 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-white">
              Global treasury
            </h2>
            {droppedToday ? (
              <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-neon/20 text-neon border border-neon/40">
                Dropped today
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                Next @ 00:00 UTC
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 leading-snug">
            Daily top-up{" "}
            <span className="text-neon font-mono font-semibold">
              +{dropAmt.toLocaleString()} ${SHIT_SYMBOL}
            </span>{" "}
            every 24h at UTC midnight.
          </p>
          <a
            href={treasurySolscanUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[11px] font-mono text-zinc-500 hover:text-neon-blue break-all"
            title={TREASURY_ADDRESS}
          >
            Treasury {TREASURY_ADDRESS.slice(0, 8)}…{TREASURY_ADDRESS.slice(-6)}
          </a>
          <span className="text-zinc-700 text-[11px]">·</span>
          <a
            href={playPotPortfolioUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[11px] font-mono text-amber-500/80 hover:text-amber-300 break-all"
            title={PLAY_POT_ADDRESS}
          >
            Pot {PLAY_POT_ADDRESS.slice(0, 8)}…{PLAY_POT_ADDRESS.slice(-6)}
            {data?.pot?.shit != null
              ? ` · ${fmtBal(data.pot.shit)} $${SHIT_SYMBOL}`
              : ""}
          </a>
        </div>

        <div className="flex items-end justify-between sm:justify-end gap-4 sm:gap-6">
          <div className="text-left sm:text-right">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
              Balance
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-black text-neon tabular-nums leading-none min-h-[1.75rem] flex items-center sm:justify-end">
              {loading || shit == null ? (
                <BalanceSkeleton wide className="h-7 w-28" />
              ) : (
                fmtBal(shit)
              )}
            </div>
            <div className="text-[11px] text-zinc-500 font-mono mt-1">
              ${SHIT_SYMBOL}
              {loading
                ? null
                : sol != null && sol > 0
                  ? ` · ${sol.toFixed(3)} SOL`
                  : ""}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 pl-2 border-l border-zinc-700/80">
            <Digit label="hrs" value={cd.h} />
            <span className="text-zinc-600 font-mono text-xl pb-3">:</span>
            <Digit label="min" value={cd.m} />
            <span className="text-zinc-600 font-mono text-xl pb-3">:</span>
            <Digit label="sec" value={cd.s} />
          </div>
        </div>
      </div>

      {data?.global?.lastDrop?.droppedAt && (
        <p className="mt-3 text-[11px] text-zinc-600 font-mono">
          Last drop {data.global.lastDrop.utcDay}:{" "}
          {Number(data.global.lastDrop.amount).toLocaleString()} $
          {SHIT_SYMBOL}
          {data.global.lastDrop.signature && (
            <>
              {" · "}
              <a
                href={`https://solscan.io/tx/${data.global.lastDrop.signature}`}
                className="text-neon-blue hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                tx
              </a>
            </>
          )}
        </p>
      )}
    </section>
  );
}
