"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useWallets,
  useSignAndSendTransaction,
} from "@privy-io/react-auth/solana";
import { pickSolanaAddress } from "@/lib/privy-identity";
import { useSafeLogin } from "@/hooks/useSafeLogin";
import { SHIT_SYMBOL } from "@/lib/shit-token";
import {
  b64ToBytes,
  encodeSigBs58,
  friendlySolanaSendError,
} from "@/lib/solana-send";
import Link from "next/link";
import { EmojiIcon } from "@/components/EmojiIcon";
import HourCelebrate, { useHourCelebrate } from "@/components/HourCelebrate";
import { HOUR_PRODUCT } from "@/lib/hour-product";

type Major = {
  assetId: string;
  name: string;
  symbol: string;
  logo: string;
  price: number;
};

type Leader = {
  assetId: string;
  name: string;
  symbol: string;
  logo: string;
  openPrice: number;
  price: number;
  pct: number;
  volume24h: number;
};

type DayStatus = {
  enabled: boolean;
  cadence?: string;
  utcDay: string;
  utcHour?: string;
  hourLabel?: string;
  msToClose: number;
  nextCloseAt: string;
  stakeAmount: number;
  houseFeeBps: number;
  treasury: string;
  mint: string;
  round: {
    hitPot: number;
    shitPot: number;
    status: string;
  } | null;
  stats: {
    hitStakes: number;
    shitStakes: number;
    hitTickets: number;
    shitTickets: number;
  };
  leaders?: {
    hitting: Leader | null;
    shitting: Leader | null;
    topHit?: Leader[];
    topShit?: Leader[];
    stakesOnHitting?: number;
    stakesOnShitting?: number;
    compared?: number;
  } | null;
  majors: Major[];
  majorsCount: number;
};

function fmtPct(n: number) {
  const s = n >= 0 ? `+${n.toFixed(2)}` : n.toFixed(2);
  return `${s}%`;
}

function TokenMark({
  logo,
  symbol,
  size = 28,
}: {
  logo?: string | null;
  symbol?: string;
  size?: number;
}) {
  const [broken, setBroken] = useState(false);
  const letter = (symbol || "?").replace(/^\$/, "").slice(0, 1).toUpperCase();
  const dim = `${size}px`;
  if (logo && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt=""
        width={size}
        height={size}
        className="rounded-full bg-zinc-900 object-cover shrink-0 ring-1 ring-white/10"
        style={{ width: dim, height: dim }}
        onError={() => setBroken(true)}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-zinc-900 ring-1 ring-white/10 flex items-center justify-center shrink-0 font-orbitron font-bold text-neon"
      style={{ width: dim, height: dim, fontSize: Math.max(11, size * 0.38) }}
      aria-hidden
    >
      {letter}
    </div>
  );
}

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function fmtCountdown(ms: number) {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((x) => String(x).padStart(2, "0")).join(":");
}

async function fetchTransferTx(wallet: string): Promise<string> {
  const res = await fetch("/api/day/build-transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet }),
  });
  const data = await res.json();
  if (!res.ok || !data.transaction) {
    throw new Error(data.error || "Could not build play transfer");
  }
  return data.transaction as string;
}

export default function DayGamePanel({
  compactTitle = false,
  dense = false,
}: {
  /** Hide big H1 when page already has product brand */
  compactTitle?: boolean;
  /** Tighter padding on play page / home card */
  dense?: boolean;
} = {}) {
  const { ready, authenticated, getAccessToken, user } = usePrivy();
  const { safeLogin } = useSafeLogin();
  const { wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const wallet = useMemo(
    () => pickSolanaAddress(wallets, user),
    [wallets, user]
  );

  const [status, setStatus] = useState<DayStatus | null>(null);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Major | null>(null);
  const [side, setSide] = useState<"hit" | "shit">("hit");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);

  const celebrate = useHourCelebrate({
    nextCloseAt: status?.nextCloseAt,
    currentHour: status?.utcHour || status?.utcDay,
    enabled: true,
  });

  const load = useCallback(() => {
    fetch("/api/day", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setStatus(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMounted(true);
    load();
    const a = setInterval(load, 20_000);
    const b = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, [load]);

  const countdown = useMemo(() => {
    if (!mounted || !status?.nextCloseAt) return "—:—:—";
    const ms = Date.parse(status.nextCloseAt) - Date.now();
    return fmtCountdown(ms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.nextCloseAt, tick, mounted]);

  const filtered = useMemo(() => {
    const list = status?.majors || [];
    const s = q.trim().toLowerCase();
    if (!s) return list.slice(0, 50);
    return list
      .filter(
        (m) =>
          m.symbol.toLowerCase().includes(s) ||
          m.name.toLowerCase().includes(s) ||
          m.assetId.toLowerCase().includes(s)
      )
      .slice(0, 50);
  }, [status?.majors, q]);

  async function play() {
    setErr(null);
    setMsg(null);
    if (!authenticated) {
      safeLogin();
      return;
    }
    if (!wallet) {
      setErr("Need a Solana wallet linked to X");
      return;
    }
    if (!selected) {
      setErr("Pick a bag first");
      return;
    }
    setBusy(true);
    try {
      const rawTx = await fetchTransferTx(wallet);
      const txBytes = b64ToBytes(rawTx);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const walletObj =
        (wallets as any[])?.find((w) => w?.address === wallet) ||
        (wallets as any[])?.[0];
      if (!walletObj) throw new Error("No wallet object");

      const result = await signAndSendTransaction({
        transaction: txBytes,
        wallet: walletObj,
        chain: "solana:mainnet",
        options: {
          sponsor: true,
          uiOptions: {
            showWalletUIs: true,
            description: `Play 1,000 $${SHIT_SYMBOL} · ${side.toUpperCase()} ${selected.symbol || selected.name}`,
          },
        },
      });
      let signature: string | null = null;
      if (result?.signature instanceof Uint8Array) {
        signature = encodeSigBs58(result.signature);
      } else if (typeof result?.signature === "string") {
        signature = result.signature;
      }
      if (!signature) throw new Error("No signature from wallet");

      const token = await getAccessToken();
      const res = await fetch("/api/day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-privy-token": token || "",
        },
        body: JSON.stringify({
          wallet,
          assetId: selected.assetId,
          side,
          signature,
          accessToken: token,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Play failed");
      setMsg(
        `In · ${side.toUpperCase()} ${selected.symbol || selected.name} · pot ${fmt(
          side === "hit" ? data.hitPot : data.shitPot
        )}`
      );
      load();
    } catch (e) {
      setErr(friendlySolanaSendError(e));
    } finally {
      setBusy(false);
    }
  }

  if (!ready || !status) {
    return (
      <div className="rounded-2xl border border-border bg-card h-28 flex items-center justify-center">
        <EmojiIcon size={28} className="animate-spin opacity-80" label="Loading">
          💫
        </EmojiIcon>
      </div>
    );
  }

  const hitPot = status.round?.hitPot || 0;
  const shitPot = status.round?.shitPot || 0;
  const hitting = status.leaders?.hitting;
  const shitting = status.leaders?.shitting;

  const cta = busy
    ? "Confirming…"
    : !authenticated
      ? "Login to play"
      : !selected
        ? "1 · Pick a bag below"
        : `Play 1,000 · ${side.toUpperCase()} ${selected.symbol || selected.name}`;

  return (
    <div className="space-y-3">
      <section
        className={`rounded-2xl border border-neon/30 bg-card ${
          dense ? "p-3.5 sm:p-4" : "p-4 sm:p-5"
        } space-y-4`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {!compactTitle ? (
              <>
                <p className="text-[10px] font-orbitron uppercase tracking-[0.2em] text-neon">
                  {HOUR_PRODUCT.name}
                </p>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  Play 1,000 ${SHIT_SYMBOL}
                </h2>
              </>
            ) : (
              <h2 className="text-sm font-orbitron uppercase tracking-wider text-zinc-300">
                Play 1,000 ${SHIT_SYMBOL}
              </h2>
            )}
            <p className="text-[11px] text-zinc-500 mt-1">
              Pick HIT or SHIT on a major · winner takes pot · hourly UTC
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[9px] uppercase text-zinc-500 font-orbitron tracking-wider">
              Closes
            </div>
            <div className="text-xl font-mono font-bold text-neon tabular-nums leading-none mt-0.5">
              {countdown}
            </div>
          </div>
        </div>

        {/* Pots — one simple row */}
        <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2.5">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-orbitron uppercase tracking-wider text-green-400/90 flex items-center gap-1">
              <EmojiIcon size={12}>🎯</EmojiIcon> Hit pot
            </div>
            <div className="text-lg font-mono font-bold text-green-400 tabular-nums">
              {fmt(hitPot)}
            </div>
          </div>
          <div className="w-px h-10 bg-zinc-800" />
          <div className="flex-1 min-w-0 text-right">
            <div className="text-[10px] font-orbitron uppercase tracking-wider text-red-400/90 flex items-center justify-end gap-1">
              Shit pot <EmojiIcon size={12}>💀</EmojiIcon>
            </div>
            <div className="text-lg font-mono font-bold text-red-400 tabular-nums">
              {fmt(shitPot)}
            </div>
          </div>
        </div>

        {/* Live leaders — one tap line, not 4 cards */}
        {(hitting || shitting) && (
          <div className="flex flex-wrap gap-2">
            {hitting && (
              <button
                type="button"
                onClick={() => {
                  setSide("hit");
                  setSelected({
                    assetId: hitting.assetId,
                    name: hitting.name,
                    symbol: hitting.symbol,
                    logo: hitting.logo,
                    price: hitting.price,
                  });
                  setErr(null);
                }}
                className="cursor-hit inline-flex items-center gap-2 rounded-full border border-green-500/35 bg-green-950/30 pl-1.5 pr-3 py-1 text-xs text-green-200 hover:border-green-400/60 transition"
              >
                <TokenMark logo={hitting.logo} symbol={hitting.symbol} size={22} />
                <span className="font-semibold">{hitting.symbol || hitting.name}</span>
                <span className="text-green-400 font-mono">{fmtPct(hitting.pct)}</span>
                <span className="text-green-600 text-[10px] font-orbitron">HIT</span>
              </button>
            )}
            {shitting && (
              <button
                type="button"
                onClick={() => {
                  setSide("shit");
                  setSelected({
                    assetId: shitting.assetId,
                    name: shitting.name,
                    symbol: shitting.symbol,
                    logo: shitting.logo,
                    price: shitting.price,
                  });
                  setErr(null);
                }}
                className="cursor-shit inline-flex items-center gap-2 rounded-full border border-red-500/35 bg-red-950/30 pl-1.5 pr-3 py-1 text-xs text-red-200 hover:border-red-400/60 transition"
              >
                <TokenMark logo={shitting.logo} symbol={shitting.symbol} size={22} />
                <span className="font-semibold">{shitting.symbol || shitting.name}</span>
                <span className="text-red-400 font-mono">{fmtPct(shitting.pct)}</span>
                <span className="text-red-600 text-[10px] font-orbitron">SHIT</span>
              </button>
            )}
          </div>
        )}

        {/* Step 1 — side */}
        <div>
          <p className="text-[10px] font-orbitron uppercase tracking-[0.16em] text-zinc-500 mb-2">
            1 · Side
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSide("hit")}
              className={`cursor-hit min-h-12 rounded-xl font-bold text-sm border-2 inline-flex items-center justify-center gap-2 font-orbitron tracking-wide transition ${
                side === "hit"
                  ? "border-green-500 bg-green-900/45 text-green-200 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
                  : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
              }`}
            >
              <EmojiIcon size={18}>🎯</EmojiIcon>
              HIT
            </button>
            <button
              type="button"
              onClick={() => setSide("shit")}
              className={`cursor-shit min-h-12 rounded-xl font-bold text-sm border-2 inline-flex items-center justify-center gap-2 font-orbitron tracking-wide transition ${
                side === "shit"
                  ? "border-red-500 bg-red-900/45 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.12)]"
                  : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
              }`}
            >
              <EmojiIcon size={18}>💀</EmojiIcon>
              SHIT
            </button>
          </div>
        </div>

        {/* Step 2 — bag */}
        <div>
          <p className="text-[10px] font-orbitron uppercase tracking-[0.16em] text-zinc-500 mb-2">
            2 · Bag
          </p>
          {selected && (
            <div
              className={`mb-2 flex items-center gap-2.5 rounded-xl border px-3 py-2 ${
                side === "hit"
                  ? "border-green-500/40 bg-green-950/30"
                  : "border-red-500/40 bg-red-950/30"
              }`}
            >
              <TokenMark logo={selected.logo} symbol={selected.symbol} size={32} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white truncate">
                  {selected.symbol || selected.name}
                </div>
                <div className="text-[10px] text-zinc-500 font-orbitron uppercase tracking-wider">
                  Selected · {side}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-[11px] text-zinc-500 hover:text-white px-2 py-1"
              >
                Clear
              </button>
            </div>
          )}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search majors…"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-neon/40 mb-2"
          />
          <div
            className={`overflow-y-auto overscroll-contain rounded-xl border border-zinc-800 bg-zinc-950/50 divide-y divide-zinc-900/80 ${
              dense ? "max-h-[240px] sm:max-h-[280px]" : "max-h-56"
            } ${side === "hit" ? "cursor-hit" : "cursor-shit"}`}
          >
            {filtered.map((m) => {
              const on = selected?.assetId === m.assetId;
              return (
                <button
                  key={m.assetId}
                  type="button"
                  onClick={() => {
                    setSelected(m);
                    setErr(null);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-zinc-900/90 ${
                    on
                      ? side === "hit"
                        ? "bg-green-950/50"
                        : "bg-red-950/50"
                      : ""
                  }`}
                >
                  <TokenMark logo={m.logo} symbol={m.symbol} size={28} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white truncate">
                      {m.symbol || m.name}
                    </div>
                  </div>
                  {on && (
                    <span
                      className={`text-[10px] font-orbitron uppercase ${
                        side === "hit" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
            {!filtered.length && (
              <div className="px-3 py-8 text-center text-sm text-zinc-600">
                No match
              </div>
            )}
          </div>
        </div>

        {err && (
          <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">
            {err}
          </p>
        )}
        {msg && (
          <p className="text-xs text-neon bg-neon/10 border border-neon/30 rounded-lg px-3 py-2">
            {msg}
          </p>
        )}

        {/* Step 3 — play */}
        <div>
          <p className="text-[10px] font-orbitron uppercase tracking-[0.16em] text-zinc-500 mb-2">
            3 · Confirm
          </p>
          <button
            type="button"
            disabled={busy || !status.enabled}
            onClick={() => void play()}
            className={`w-full min-h-12 rounded-xl bg-neon text-black font-bold text-sm sm:text-base hover:brightness-110 disabled:opacity-45 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 ${
              !busy && status.enabled
                ? side === "hit"
                  ? "cursor-hit"
                  : "cursor-shit"
                : ""
            }`}
          >
            {busy && (
              <EmojiIcon size={18} className="animate-spin" label="Loading">
                💫
              </EmojiIcon>
            )}
            {cta}
          </button>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-600">
          <span>1 ticket / wallet / side / hour</span>
          <Link href={HOUR_PRODUCT.winnersPath} className="text-neon-blue hover:underline">
            Winners
          </Link>
          <Link href={HOUR_PRODUCT.prevPath} className="text-neon-blue hover:underline">
            Last round
          </Link>
        </div>
      </section>

      {celebrate.waiting && !celebrate.payload && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[250] rounded-full border border-neon/40 bg-black/90 px-4 py-2 flex items-center gap-2 shadow-lg">
          <EmojiIcon size={18} className="animate-spin" label="Settling">
            💫
          </EmojiIcon>
          <span className="text-xs text-zinc-200 font-medium">
            Round closed — settling…
          </span>
        </div>
      )}

      {celebrate.payload && (
        <HourCelebrate payload={celebrate.payload} onClose={celebrate.dismiss} />
      )}
    </div>
  );
}
