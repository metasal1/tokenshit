"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SHIT_SYMBOL } from "@/lib/shit-token";
import { BalanceSkeleton, PulseDot, SpinLoader } from "@/components/StatLoader";

type Payload = {
  shit?: number;
};

function fmt(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return null;
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
 * Scrolling header ticker — treasury · holders · users · online.
 */
export default function HeaderTicker() {
  const [data, setData] = useState<Payload | null>(null);
  const [online, setOnline] = useState<number | null>(null);
  const [users, setUsers] = useState<number | null>(null);
  const [holders, setHolders] = useState<number | null>(null);
  const [treasuryLoading, setTreasuryLoading] = useState(true);
  const [onlineLoading, setOnlineLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [holdersLoading, setHoldersLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const loadTreasury = () => {
      fetch("/api/treasury")
        .then((r) => r.json())
        .then((d: Payload) => {
          if (alive) setData(d);
        })
        .catch(() => {})
        .finally(() => {
          if (alive) setTreasuryLoading(false);
        });
    };
    const loadUsers = () => {
      fetch("/api/signup/count", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (alive && typeof d.users === "number") setUsers(d.users);
        })
        .catch(() => {})
        .finally(() => {
          if (alive) setUsersLoading(false);
        });
    };
    const loadHolders = () => {
      fetch("/api/token/holders", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (alive && typeof d.holders === "number") setHolders(d.holders);
        })
        .catch(() => {})
        .finally(() => {
          if (alive) setHoldersLoading(false);
        });
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
        .catch(() => {})
        .finally(() => {
          if (alive) setOnlineLoading(false);
        });
    };
    loadTreasury();
    loadUsers();
    loadHolders();
    ping();
    const a = setInterval(loadTreasury, 30_000);
    const b = setInterval(ping, 30_000);
    const c = setInterval(loadUsers, 45_000);
    const d = setInterval(loadHolders, 120_000);

    const onSignup = () => {
      setUsers((n) => (typeof n === "number" ? n + 1 : n));
      window.setTimeout(loadUsers, 1500);
    };
    window.addEventListener("tokenshit:signup", onSignup);

    return () => {
      alive = false;
      clearInterval(a);
      clearInterval(b);
      clearInterval(c);
      clearInterval(d);
      window.removeEventListener("tokenshit:signup", onSignup);
    };
  }, []);

  const bal = fmt(data?.shit);
  const usersLabel = fmt(users);
  const holdersLabel = fmt(holders);

  const items = [
    {
      key: "bal",
      node: (
        <Link
          href="/claim"
          className="inline-flex items-center gap-1.5 hover:text-neon transition-colors"
        >
          <span className="text-zinc-500">Treasury</span>
          {treasuryLoading || bal == null ? (
            <BalanceSkeleton />
          ) : (
            <span className="text-neon font-semibold">
              {bal} ${SHIT_SYMBOL}
            </span>
          )}
        </Link>
      ),
    },
    {
      key: "holders",
      node: (
        <Link
          href="/swap"
          className="inline-flex items-center gap-1.5 hover:text-neon transition-colors"
          title={`$${SHIT_SYMBOL} token accounts`}
        >
          <span className="text-zinc-500">Holders</span>
          {holdersLoading || holdersLabel == null ? (
            <BalanceSkeleton />
          ) : (
            <span className="text-white font-semibold">{holdersLabel}</span>
          )}
        </Link>
      ),
    },
    {
      key: "users",
      node: (
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 hover:text-neon transition-colors"
          title="Privy accounts"
        >
          <span className="text-zinc-500">Users</span>
          {usersLoading || usersLabel == null ? (
            <BalanceSkeleton />
          ) : (
            <span className="text-white font-semibold">{usersLabel}</span>
          )}
        </Link>
      ),
    },
    {
      key: "online",
      node: (
        <span className="inline-flex items-center gap-1.5">
          {onlineLoading ? (
            <>
              <SpinLoader size={10} label="Online loading" />
              <span className="text-zinc-500">online</span>
            </>
          ) : (
            <>
              <PulseDot />
              <span className="text-zinc-300">{online ?? 0} online</span>
            </>
          )}
        </span>
      ),
    },
  ];

  const loop = [...items, ...items, ...items];

  return (
    <div
      className="relative w-full overflow-hidden border-b border-border/60 bg-zinc-950/90"
      style={{ height: 28 }}
    >
      <div
        className="header-ticker-track absolute left-0 top-0 flex h-full items-center gap-0 whitespace-nowrap font-mono text-[11px] sm:text-xs text-zinc-400"
        aria-label="Treasury, holders, users, and online ticker"
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
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />
    </div>
  );
}
