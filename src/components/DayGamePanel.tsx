"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { sfx } from "@/lib/sfx";

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
  const [hitFlash, setHitFlash] = useState(false);
  const [shitFlash, setShitFlash] = useState(false);
  const [hitDelta, setHitDelta] = useState(0);
  const [shitDelta, setShitDelta] = useState(0);
  const prevPots = useRef<{ hit: number; shit: number } | null>(null);

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

  // Pot up → sound + flash (other players / self)
  useEffect(() => {
    if (!status?.round) return;
    const hit = status.round.hitPot || 0;
    const shit = status.round.shitPot || 0;
    const prev = prevPots.current;
    if (prev) {
      const dHit = hit - prev.hit;
      const dShit = shit - prev.shit;
      if (dHit > 0) {
        setHitDelta(dHit);
        setHitFlash(true);
        sfx.potUp();
      }
      if (dShit > 0) {
        setShitDelta(dShit);
        setShitFlash(true);
        sfx.potUp();
      }
    }
    prevPots.current = { hit, shit };
  }, [status?.round?.hitPot, status?.round?.shitPot]);

  useEffect(() => {
    if (!hitFlash) return;
    const t = window.setTimeout(() => {
      setHitFlash(false);
      setHitDelta(0);
    }, 900);
    return () => clearTimeout(t);
  }, [hitFlash]);

  useEffect(() => {
    if (!shitFlash) return;
    const t = window.setTimeout(() => {
      setShitFlash(false);
      setShitDelta(0);
    }, 900);
    return () => clearTimeout(t);
  }, [shitFlash]);

  const filtered = useMemo(() => {
    const list = status?.majors || [];
    const s = q.trim().toLowerCase();
    if (!s) return list; // show ALL icons
    return list.filter(
      (m) =>
        m.symbol.toLowerCase().includes(s) ||
        m.name.toLowerCase().includes(s) ||
        m.assetId.toLowerCase().includes(s)
    );
  }, [status?.majors, q]);

  const lastTap = useRef<{ id: string; t: number } | null>(null);

  async function play(bag?: Major | null) {
    const pick = bag ?? selected;
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
    if (!pick) {
      setErr("Tap a bag (double-tap to play!)");
      return;
    }
    if (bag) setSelected(bag);
    setBusy(true);
    try {
      const rawTx = await fetchTransferTx(wallet);
      const txBytes = b64ToBytes(rawTx);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const walletObj =
        (wallets as any[])?.find((w) => w?.address === wallet) ||
        (wallets as any[])?.[0];
      if (!walletObj) throw new Error("No wallet object");

      const desc = `Play 1,000 $${SHIT_SYMBOL} · ${side.toUpperCase()} ${pick.symbol || pick.name}`;
      // Auto-sign when sponsored (no wallet modal). Fall back to UI if Privy requires it.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: any;
      try {
        result = await signAndSendTransaction({
          transaction: txBytes,
          wallet: walletObj,
          chain: "solana:mainnet",
          options: {
            sponsor: true,
            uiOptions: {
              showWalletUIs: false,
              description: desc,
            },
          },
        });
      } catch {
        result = await signAndSendTransaction({
          transaction: txBytes,
          wallet: walletObj,
          chain: "solana:mainnet",
          options: {
            sponsor: true,
            uiOptions: {
              showWalletUIs: true,
              description: desc,
            },
          },
        });
      }
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
          assetId: pick.assetId,
          side,
          signature,
          accessToken: token,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Play failed");
      setMsg(
        `In · ${side.toUpperCase()} ${pick.symbol || pick.name} · pot ${fmt(
          side === "hit" ? data.hitPot : data.shitPot
        )}`
      );
      sfx.potUp();
      if (side === "hit") {
        setHitFlash(true);
        setHitDelta(1000);
        const h = (prevPots.current?.hit ?? 0) + 1000;
        prevPots.current = {
          hit: h,
          shit: prevPots.current?.shit ?? 0,
        };
      } else {
        setShitFlash(true);
        setShitDelta(1000);
        const s = (prevPots.current?.shit ?? 0) + 1000;
        prevPots.current = {
          hit: prevPots.current?.hit ?? 0,
          shit: s,
        };
      }
      load();
    } catch (e) {
      setErr(friendlySolanaSendError(e));
    } finally {
      setBusy(false);
    }
  }

  /** Single tap = select. Double tap / double-click = select + play. */
  function onBagTap(m: Major) {
    const now = Date.now();
    const prev = lastTap.current;
    setSelected(m);
    setErr(null);
    if (prev && prev.id === m.assetId && now - prev.t < 380) {
      lastTap.current = null;
      void play(m);
      return;
    }
    lastTap.current = { id: m.assetId, t: now };
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

  const cta = busy
    ? "Confirming…"
    : !authenticated
      ? "Login to play"
      : !selected
        ? "Double-tap a bag ↓"
        : `Play 1,000 · ${side.toUpperCase()} ${selected.symbol || selected.name}`;

  return (
    <div className="space-y-3">
      <section
        className={`rounded-2xl border border-neon/30 bg-card ${
          dense ? "p-3.5 sm:p-4" : "p-4 sm:p-5"
        } space-y-4`}
      >
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
              HIT or SHIT · double-tap a bag to play · hourly UTC
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

        <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2.5">
          <div
            className={`flex-1 min-w-0 relative rounded-lg px-1 py-0.5 transition-colors duration-300 ${
              hitFlash ? "bg-green-500/20 ring-1 ring-green-400/60" : ""
            }`}
          >
            <div className="text-[10px] font-orbitron uppercase tracking-wider text-green-400/90 flex items-center gap-1">
              <EmojiIcon size={12}>🎯</EmojiIcon> Hit pot
            </div>
            <div
              className={`text-lg font-mono font-bold text-green-400 tabular-nums transition-transform duration-300 ${
                hitFlash ? "scale-110 drop-shadow-[0_0_12px_rgba(34,197,94,0.8)]" : ""
              }`}
            >
              {fmt(hitPot)}
            </div>
            {hitFlash && hitDelta > 0 && (
              <span className="pointer-events-none absolute -top-1 right-0 text-xs font-bold font-mono text-green-300 animate-[potfloat_0.9s_ease-out_forwards]">
                +{fmt(hitDelta)}
              </span>
            )}
          </div>
          <div className="w-px h-10 bg-zinc-800 shrink-0" />
          <div
            className={`flex-1 min-w-0 relative rounded-lg px-1 py-0.5 text-right transition-colors duration-300 ${
              shitFlash ? "bg-red-500/20 ring-1 ring-red-400/60" : ""
            }`}
          >
            <div className="text-[10px] font-orbitron uppercase tracking-wider text-red-400/90 flex items-center justify-end gap-1">
              Shit pot <EmojiIcon size={12}>💀</EmojiIcon>
            </div>
            <div
              className={`text-lg font-mono font-bold text-red-400 tabular-nums transition-transform duration-300 ${
                shitFlash ? "scale-110 drop-shadow-[0_0_12px_rgba(239,68,68,0.75)]" : ""
              }`}
            >
              {fmt(shitPot)}
            </div>
            {shitFlash && shitDelta > 0 && (
              <span className="pointer-events-none absolute -top-1 left-0 text-xs font-bold font-mono text-red-300 animate-[potfloat_0.9s_ease-out_forwards]">
                +{fmt(shitDelta)}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSide("hit")}
            className={`cursor-hit min-h-14 rounded-2xl font-bold text-base border-2 inline-flex flex-col items-center justify-center gap-0.5 font-orbitron tracking-wide transition-colors active:brightness-110 ${
              side === "hit"
                ? "border-green-400 bg-green-900/50 text-green-100 shadow-[0_0_28px_rgba(34,197,94,0.25)]"
                : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
            }`}
          >
            <EmojiIcon size={22}>🎯</EmojiIcon>
            HIT
          </button>
          <button
            type="button"
            onClick={() => setSide("shit")}
            className={`cursor-shit min-h-14 rounded-2xl font-bold text-base border-2 inline-flex flex-col items-center justify-center gap-0.5 font-orbitron tracking-wide transition-colors active:brightness-110 ${
              side === "shit"
                ? "border-red-400 bg-red-900/50 text-red-100 shadow-[0_0_28px_rgba(239,68,68,0.22)]"
                : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
            }`}
          >
            <EmojiIcon size={22}>💀</EmojiIcon>
            SHIT
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-[10px] font-orbitron uppercase tracking-[0.16em] text-zinc-500">
              Bags · tap once · double-tap play
            </p>
            <span className="text-[10px] font-mono text-zinc-600 truncate max-w-[55%] text-right">
              {selected
                ? `${side.toUpperCase()} · ${selected.symbol || selected.name}`
                : `${filtered.length}${status.majorsCount ? `/${status.majorsCount}` : ""}`}
            </span>
          </div>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter bags…"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-neon/40 mb-2"
          />

          <div
            className={`grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-[min(52vh,420px)] overflow-y-auto overscroll-contain ${
              side === "hit" ? "cursor-hit" : "cursor-shit"
            }`}
            role="listbox"
            aria-label="Pick a bag"
          >
            {filtered.map((m) => {
              const on = selected?.assetId === m.assetId;
              return (
                <button
                  key={m.assetId}
                  type="button"
                  role="option"
                  aria-selected={on}
                  title={`${m.symbol || m.name} — double-tap to play ${side.toUpperCase()}`}
                  disabled={busy}
                  onClick={() => onBagTap(m)}
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    setSelected(m);
                    void play(m);
                  }}
                  className={`relative flex flex-col items-center justify-center gap-1 rounded-2xl border p-2 min-h-[76px] sm:min-h-[84px] transition-colors active:brightness-110 disabled:opacity-50 ${
                    on
                      ? side === "hit"
                        ? "border-green-400 bg-green-950/55 ring-2 ring-green-400/50 shadow-[0_0_16px_rgba(34,197,94,0.3)]"
                        : "border-red-400 bg-red-950/55 ring-2 ring-red-400/50 shadow-[0_0_16px_rgba(239,68,68,0.28)]"
                      : "border-zinc-800/90 bg-zinc-950/70 hover:border-zinc-500 hover:bg-zinc-900"
                  }`}
                >
                  <TokenMark logo={m.logo} symbol={m.symbol} size={40} />
                  <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-200 truncate w-full text-center leading-tight">
                    {m.symbol || m.name}
                  </span>
                  {on && (
                    <span
                      className={`absolute -top-1 -right-1 text-[10px] leading-none rounded-full px-1 py-0.5 font-bold ${
                        side === "hit"
                          ? "bg-green-500 text-black"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
            {!filtered.length && (
              <div className="col-span-full py-10 text-center text-sm text-zinc-600">
                No match — clear filter
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

        <button
          type="button"
          disabled={busy || !status.enabled}
          onClick={() => void play()}
          className={`w-full min-h-14 rounded-2xl bg-neon text-black font-bold text-base hover:brightness-110 disabled:opacity-45 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 font-orbitron tracking-wide uppercase active:scale-[0.98] transition ${
            !busy && status.enabled
              ? "shadow-[0_0_24px_rgba(57,255,20,0.25)] " +
                (side === "hit" ? "cursor-hit" : "cursor-shit")
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

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-600">
          <span>1 ticket / wallet / side / hour</span>
          <span className="text-zinc-500">double-tap bag = play</span>
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
