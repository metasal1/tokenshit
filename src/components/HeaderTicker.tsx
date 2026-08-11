"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  GLOBAL_TREASURY_DAILY_DROP,
  SHIT_SYMBOL,
  formatCountdown,
  treasurySolscanUrl,
} from "@/lib/shit-token";

type Payload = {
  shit?: number;
  sol?: number;
  global?: {
    nextDropAtMs?: number;
    dropAmount?: number;
    serverNowMs?: number;
    droppedToday?: boolean;
  };
};

function fmt(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function getDeviceId(): string {
  try {
    let id = localStorage.getItem("tokenshit_device_id");
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "x-" + Math.random().toString(36).slice(2);
      localStorage.setItem("tokenshit_device_id", id);
    }
    return id;
  } catch {
    return "anon-" + Math.random().toString(36).slice(2);
  }
}

/**
 * Scrolling header ticker: treasury balance · countdown · online · drop size
 */
export default function HeaderTicker() {
  const [data, setData] = useState<Payload | null>(null);
  const [online, setOnline] = useState<number | null>(null);
  const [skew, setSkew] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let alive = true;
    const loadTreasury = () => {
      const t0 = Date.now();
      fetch("/api/treasury")
        .then((r) => r.json())
        .then((d: Payload) => {
          if (!alive) return;
          const sn = d.global?.serverNowMs;
          if (typeof sn === "number") {
            setSkew(sn + (Date.now() - t0) / 2 - Date.now());
          }
          setData(d);
        })
        .catch(() => {});
    };
    const ping = () => {
      fetch("/api/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: getDeviceId() }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (alive && typeof d.online === "number") setOnline(d.online);
        })
        .catch(() => {});
    };
    loadTreasury();
    ping();
    const a = setInterval(loadTreasury, 30_000);
    const b = setInterval(ping, 30_000);
    const c = setInterval(() => setNow(Date.now() + skew), 250);
    return () => {
      alive = false;
      clearInterval(a);
      clearInterval(b);
      clearInterval(c);
    };
  }, [skew]);

  const targetMs = useMemo(() => {
    if (data?.global?.nextDropAtMs) return data.global.nextDropAtMs;
    const n = new Date(now);
    const d = new Date(n.getTime());
    d.setUTCHours(0, 0, 0, 0);
    if (d.getTime() <= n.getTime()) d.setUTCDate(d.getUTCDate() + 1);
    return d.getTime();
  }, [data, now]);

  const cd = formatCountdown(Math.max(0, targetMs - (now + skew)));
  const drop = data?.global?.dropAmount ?? GLOBAL_TREASURY_DAILY_DROP;

  const items = [
    {
      key: "bal",
      node: (
        <Link
          href="/claim"
          className="inline-flex items-center gap-1.5 hover:text-neon transition-colors"
        >
          <span className="text-zinc-500">Treasury</span>
          <span className="text-neon font-semibold">
            {fmt(data?.shit)} ${SHIT_SYMBOL}
          </span>
        </Link>
      ),
    },
    {
      key: "cd",
      node: (
        <span className="inline-flex items-center gap-1.5">
          <span className="text-zinc-500">Drop</span>
          <span className="text-zinc-200 tabular-nums">
            {cd.h}:{cd.m}:{cd.s}
          </span>
          <span className="text-zinc-600">UTC</span>
        </span>
      ),
    },
    {
      key: "plus",
      node: (
        <span className="inline-flex items-center gap-1.5">
          <span className="text-zinc-500">Daily</span>
          <span className="text-neon">+{fmt(drop)}</span>
        </span>
      ),
    },
    {
      key: "online",
      node: (
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-neon shadow-[0_0_6px_#39ff14]"
            aria-hidden
          />
          <span className="text-zinc-300">
            {online == null ? "…" : online} online
          </span>
        </span>
      ),
    },
    {
      key: "sol",
      node: (
        <a
          href={treasurySolscanUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-neon-blue transition-colors"
        >
          <span className="text-zinc-500">Gas</span>
          <span className="text-zinc-300">
            {data?.sol != null ? `${data.sol.toFixed(3)} SOL` : "—"}
          </span>
        </a>
      ),
    },
  ];

  // duplicate for seamless loop
  const loop = [...items, ...items, ...items];

  return (
    <div
      className="relative w-full overflow-hidden border-b border-border/60 bg-zinc-950/90"
      style={{ height: 28 }}
    >
      <div
        className="header-ticker-track absolute left-0 top-0 flex h-full items-center gap-0 whitespace-nowrap font-mono text-[11px] sm:text-xs text-zinc-400"
        aria-label="Treasury and live stats ticker"
      >
        {loop.map((it, i) => (
          <span key={`${it.key}-${i}`} className="inline-flex items-center">
            <span className="px-4 sm:px-5">{it.node}</span>
            <span className="text-zinc-700 select-none" aria-hidden>
              ◆
            </span>
          </span>
        ))}
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />
    </div>
  );
}
