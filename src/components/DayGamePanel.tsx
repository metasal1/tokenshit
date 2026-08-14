"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useWallets,
  useSignAndSendTransaction,
} from "@privy-io/react-auth/solana";
import { pickSolanaAddress } from "@/lib/privy-identity";
import { SHIT_MINT, SHIT_SYMBOL, TREASURY_ADDRESS } from "@/lib/shit-token";
import {
  b64ToBytes,
  encodeSigBs58,
  friendlySolanaSendError,
} from "@/lib/solana-send";
import Link from "next/link";
import { EmojiIcon } from "@/components/EmojiIcon";
import HourCelebrate, { useHourCelebrate } from "@/components/HourCelebrate";
import { HOUR_PRODUCT } from "@/lib/hour-product";
import { HIT_CURSOR, SHIT_CURSOR, sideCursor } from "@/lib/cursors";

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

function LeaderCard({
  kind,
  leader,
  stakesOn,
  onPick,
  compact,
}: {
  kind: "hit" | "shit";
  leader: Leader | null;
  stakesOn?: number;
  onPick: (m: Major) => void;
  compact?: boolean;
}) {
  const hit = kind === "hit";
  return (
    <button
      type="button"
      disabled={!leader}
      onClick={() => {
        if (!leader) return;
        onPick({
          assetId: leader.assetId,
          name: leader.name,
          symbol: leader.symbol,
          logo: leader.logo,
          price: leader.price,
        });
      }}
      className={`rounded-xl border text-left transition-colors w-full cursor-pointer ${
        compact ? "p-2" : "p-3"
      } ${
        hit
          ? "border-green-800/50 bg-green-950/30 hover:bg-green-950/50"
          : "border-red-800/50 bg-red-950/30 hover:bg-red-950/50"
      } disabled:opacity-60 disabled:cursor-not-allowed`}
      style={{ cursor: leader ? (hit ? HIT_CURSOR : SHIT_CURSOR) : undefined }}
    >
      <div
        className={`text-[9px] uppercase flex items-center gap-1 ${
          compact ? "mb-0.5" : "mb-1.5"
        } ${hit ? "text-green-500/90" : "text-red-500/90"}`}
      >
        <EmojiIcon size={12}>{hit ? "🎯" : "💀"}</EmojiIcon>
        {hit ? "Hitting" : "Shitting"}
      </div>
      {leader ? (
        <div className="flex items-center gap-2">
          {leader.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={leader.logo}
              alt=""
              className={`${compact ? "h-7 w-7" : "h-9 w-9"} rounded-full bg-zinc-800 shrink-0`}
            />
          ) : (
            <div
              className={`${compact ? "h-7 w-7" : "h-9 w-9"} rounded-full bg-zinc-800 shrink-0`}
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-white truncate">
              {leader.symbol || leader.name}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div
              className={`text-sm font-mono font-bold ${
                hit ? "text-green-400" : "text-red-400"
              }`}
            >
              {fmtPct(leader.pct)}
            </div>
            {!compact && (
              <div className="text-[10px] text-zinc-600">
                {stakesOn ?? 0} play{(stakesOn ?? 0) === 1 ? "" : "s"}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-zinc-600 py-1">Waiting…</div>
      )}
    </button>
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
  /** Single-card denser layout (play page) */
  dense?: boolean;
} = {}) {
  const { ready, authenticated, login, getAccessToken, user } = usePrivy();
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
    load();
    const a = setInterval(load, 20_000);
    const b = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, [load]);

  const countdown = useMemo(() => {
    if (!status?.nextCloseAt) return "—";
    const ms = Date.parse(status.nextCloseAt) - Date.now();
    return fmtCountdown(ms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.nextCloseAt, tick]);

  const filtered = useMemo(() => {
    const list = status?.majors || [];
    const s = q.trim().toLowerCase();
    if (!s) return list.slice(0, 40);
    return list
      .filter(
        (m) =>
          m.symbol.toLowerCase().includes(s) ||
          m.name.toLowerCase().includes(s) ||
          m.assetId.toLowerCase().includes(s)
      )
      .slice(0, 40);
  }, [status?.majors, q]);

  async function play() {
    setErr(null);
    setMsg(null);
    if (!authenticated) {
      login();
      return;
    }
    if (!wallet) {
      setErr("Need a Solana wallet linked to X");
      return;
    }
    if (!selected) {
      setErr("Pick a majors bag");
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
        `Played 1,000 $${SHIT_SYMBOL} ${side.toUpperCase()} on ${selected.symbol || selected.name}. HIT pot ${fmt(data.hitPot)} · SHIT pot ${fmt(data.shitPot)}`
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

  const playLabel = busy ? (
    <>
      <EmojiIcon size={18} className="animate-spin" label="Loading">
        💫
      </EmojiIcon>
      Confirm…
    </>
  ) : !authenticated ? (
    "Login with X to play"
  ) : selected ? (
    <>
      Play 1k · {side.toUpperCase()} {selected.symbol || selected.name}
    </>
  ) : (
    `Pick a bag · 1,000 $${SHIT_SYMBOL}`
  );

  const pickHit = (m: Major) => {
    setSelected(m);
    setSide("hit");
    setErr(null);
  };
  const pickShit = (m: Major) => {
    setSelected(m);
    setSide("shit");
    setErr(null);
  };

  return (
    <div className={dense ? "space-y-0" : "space-y-4"}>
      <div
        className={`rounded-2xl border border-neon/35 bg-card ${
          dense ? "p-3 sm:p-4" : "p-4 sm:p-5"
        }`}
      >
        {/* Top bar: title + countdown */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="min-w-0">
            {!compactTitle ? (
              <>
                <p className="text-[9px] font-orbitron uppercase tracking-[0.18em] text-neon">
                  {HOUR_PRODUCT.name}
                </p>
                <h2 className="text-base sm:text-lg font-bold text-white font-orbitron tracking-wide truncate">
                  Call HIT or SHIT
                </h2>
              </>
            ) : (
              <h2 className="text-xs font-orbitron uppercase tracking-wider text-zinc-400">
                1,000 ${SHIT_SYMBOL} · VRF · 25% house
              </h2>
            )}
          </div>
          <div className="text-right font-mono shrink-0">
            <div className="text-[9px] uppercase text-zinc-500 font-orbitron tracking-wider">
              Closes
            </div>
            <div className="text-base sm:text-lg text-neon font-bold tabular-nums leading-none">
              {countdown}
            </div>
          </div>
        </div>

        {/* Desktop dense: 2-col; mobile: stack tight */}
        <div
          className={
            dense
              ? "grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4"
              : "space-y-3"
          }
        >
          {/* LEFT — pots + leaders */}
          <div
            className={
              dense ? "lg:col-span-5 space-y-2" : "space-y-3"
            }
          >
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-green-800/50 bg-green-950/30 px-2.5 py-2">
                <div className="text-[9px] uppercase text-green-500/80 flex items-center gap-1">
                  <EmojiIcon size={12}>🎯</EmojiIcon> HIT pot
                </div>
                <div className="text-lg font-bold text-green-400 font-mono leading-tight">
                  {fmt(status.round?.hitPot || 0)}
                </div>
                <div className="text-[9px] text-zinc-500">
                  {status.stats.hitTickets || 0} wallets
                </div>
              </div>
              <div className="rounded-xl border border-red-800/50 bg-red-950/30 px-2.5 py-2">
                <div className="text-[9px] uppercase text-red-500/80 flex items-center gap-1">
                  <EmojiIcon size={12}>💀</EmojiIcon> SHIT pot
                </div>
                <div className="text-lg font-bold text-red-400 font-mono leading-tight">
                  {fmt(status.round?.shitPot || 0)}
                </div>
                <div className="text-[9px] text-zinc-500">
                  {status.stats.shitTickets || 0} wallets
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <LeaderCard
                kind="hit"
                leader={status.leaders?.hitting || null}
                stakesOn={status.leaders?.stakesOnHitting}
                onPick={pickHit}
                compact={dense}
              />
              <LeaderCard
                kind="shit"
                leader={status.leaders?.shitting || null}
                stakesOn={status.leaders?.stakesOnShitting}
                onPick={pickShit}
                compact={dense}
              />
            </div>

            {!dense && (
              <p className="text-[11px] text-zinc-600">
                Real majors · hourly UTC · 1 wallet = 1 ticket
              </p>
            )}
          </div>

          {/* RIGHT — play controls */}
          <div
            className={
              dense
                ? "lg:col-span-7 flex flex-col gap-2 min-h-0"
                : "rounded-2xl border border-border bg-card/50 p-0 space-y-3 mt-3"
            }
          >
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setSide("hit")}
                style={{ cursor: HIT_CURSOR }}
                className={`flex-1 min-h-10 rounded-xl font-bold text-xs sm:text-sm border-2 inline-flex items-center justify-center gap-1.5 font-orbitron tracking-wide ${
                  side === "hit"
                    ? "border-green-500 bg-green-900/50 text-green-300"
                    : "border-zinc-800 text-zinc-500"
                }`}
              >
                <EmojiIcon size={16}>🎯</EmojiIcon>
                HIT
              </button>
              <button
                type="button"
                onClick={() => setSide("shit")}
                style={{ cursor: SHIT_CURSOR }}
                className={`flex-1 min-h-10 rounded-xl font-bold text-xs sm:text-sm border-2 inline-flex items-center justify-center gap-1.5 font-orbitron tracking-wide ${
                  side === "shit"
                    ? "border-red-500 bg-red-900/50 text-red-300"
                    : "border-zinc-800 text-zinc-500"
                }`}
              >
                <EmojiIcon size={16}>💀</EmojiIcon>
                SHIT
              </button>
            </div>

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter majors…"
              className="w-full rounded-xl border border-border bg-zinc-950 px-3 py-2 text-sm"
            />

            <div
              className={`overflow-y-auto overscroll-contain rounded-xl border border-border divide-y divide-border ${
                dense
                  ? "max-h-[min(38vh,280px)] lg:max-h-[min(48vh,360px)]"
                  : "max-h-56"
              }`}
              style={{ cursor: sideCursor(side) }}
            >
              {filtered.map((m) => {
                const on = selected?.assetId === m.assetId;
                return (
                  <button
                    key={m.assetId}
                    type="button"
                    onClick={() => setSelected(m)}
                    style={{ cursor: sideCursor(side) }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-left hover:bg-zinc-900 ${
                      on ? "bg-zinc-900 ring-1 ring-inset ring-neon/40" : ""
                    }`}
                  >
                    {m.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.logo}
                        alt=""
                        className="h-7 w-7 rounded-full bg-zinc-800"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-zinc-800" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-white truncate">
                        {m.symbol || m.name}
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400">
                      ${m.price < 1 ? m.price.toPrecision(3) : m.price.toFixed(2)}
                    </div>
                  </button>
                );
              })}
              {!filtered.length && (
                <div className="px-3 py-4 text-center text-sm text-zinc-600">
                  No majors match
                </div>
              )}
            </div>

            {err && (
              <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-2.5 py-1.5">
                {err}
              </p>
            )}
            {msg && (
              <p className="text-xs text-neon bg-neon/10 border border-neon/30 rounded-lg px-2.5 py-1.5">
                {msg}
              </p>
            )}

            {/* Desktop play — inline; mobile sticky below */}
            <button
              type="button"
              disabled={busy || !status.enabled}
              onClick={() => void play()}
              style={
                !busy && status.enabled
                  ? { cursor: sideCursor(side) }
                  : undefined
              }
              className={`${
                dense ? "hidden lg:inline-flex" : "inline-flex"
              } w-full min-h-11 rounded-xl bg-neon text-black font-bold text-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center gap-2`}
            >
              {playLabel}
            </button>

            <div
              className={`flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-zinc-600 ${
                dense ? "lg:pb-0 pb-14" : ""
              }`}
            >
              <Link
                href={HOUR_PRODUCT.prevPath}
                className="text-neon-blue hover:underline"
              >
                Last round
              </Link>
              <Link
                href={HOUR_PRODUCT.winnersPath}
                className="text-neon-blue hover:underline"
              >
                Winners
              </Link>
              <a
                href={`https://sol.new/portfolio/${TREASURY_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Treasury
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky play CTA */}
      {dense && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-[200] border-t border-border bg-background/95 backdrop-blur-xl px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            disabled={busy || !status.enabled}
            onClick={() => void play()}
            style={
              !busy && status.enabled
                ? { cursor: sideCursor(side) }
                : undefined
            }
            className="w-full min-h-12 rounded-xl bg-neon text-black font-bold text-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {playLabel}
          </button>
        </div>
      )}

      {celebrate.waiting && !celebrate.payload && (
        <div className="fixed bottom-16 lg:bottom-4 left-1/2 -translate-x-1/2 z-[250] rounded-full border border-neon/40 bg-black/90 px-4 py-2 flex items-center gap-2 shadow-lg">
          <EmojiIcon size={18} className="animate-spin" label="Settling">
            💫
          </EmojiIcon>
          <span className="text-xs text-zinc-200 font-medium">
            Round closed — settling…
          </span>
        </div>
      )}

      {celebrate.payload && (
        <HourCelebrate
          payload={celebrate.payload}
          onClose={celebrate.dismiss}
        />
      )}
    </div>
  );
}
