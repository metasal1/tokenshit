"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useWallets,
  useSignAndSendTransaction,
} from "@privy-io/react-auth/solana";
import { pickSolanaAddress } from "@/lib/privy-identity";
import { useSafeLogin } from "@/hooks/useSafeLogin";
import { SHIT_SYMBOL, PLAY_POT_ADDRESS, playPotPortfolioUrl } from "@/lib/shit-token";
import {
  b64ToBytes,
  encodeSigBs58,
  friendlySolanaSendError,
} from "@/lib/solana-send";
import Link from "next/link";
import { EmojiIcon } from "@/components/EmojiIcon";
import { HOUR_PRODUCT } from "@/lib/hour-product";
import { sfx } from "@/lib/sfx";

/** Keep in sync with DAY_STAKE_AMOUNT in day-game (server). */
const PLAY_STAKE = 1_000;

function fmtPct(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const s = n >= 0 ? `+${n.toFixed(1)}` : n.toFixed(1);
  return `${s}%`;
}

type Major = {
  assetId: string;
  name: string;
  symbol: string;
  logo: string;
  price: number;
  pct?: number | null;
  openPrice?: number | null;
  hitPlays?: number;
  shitPlays?: number;
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

type MyTicket = { assetId: string; side: "hit" | "shit"; tickets: number };

type DayStatus = {
  enabled: boolean;
  utcDay: string;
  utcHour?: string;
  msToClose: number;
  nextCloseAt: string;
  stakeAmount: number;
  multiTicket?: boolean;
  round: { hitPot: number; shitPot: number; status: string } | null;
  stats: {
    hitStakes: number;
    shitStakes: number;
    hitTickets: number;
    shitTickets: number;
    hitPlayers?: number;
    shitPlayers?: number;
  };
  leaders?: {
    hitting: Leader | null;
    shitting: Leader | null;
    topHit?: Leader[];
    topShit?: Leader[];
    stakesOnHitting?: number;
    stakesOnShitting?: number;
  } | null;
  majors: Major[];
  majorsCount: number;
  myTickets?: MyTicket[];
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
  if (ms <= 0) return "00:00";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  // MM:SS for dock (less width)
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
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

async function fetchShitBalance(wallet: string): Promise<number | null> {
  try {
    const r = await fetch(
      `/api/wallet/balances?address=${encodeURIComponent(wallet)}`,
      { cache: "no-store" }
    );
    if (!r.ok) return null;
    const d = await r.json();
    const n = Number(d.shit ?? d.tokenshit ?? d.balance);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

type SearchHit = {
  assetId: string;
  name: string;
  symbol: string;
  logo: string;
};

function mapSearchResults(data: unknown): SearchHit[] {
  const root = data as {
    results?: unknown[];
    assets?: unknown[];
  };
  const rows = (root.results || root.assets || []) as Record<string, unknown>[];
  const out: SearchHit[] = [];
  for (const row of rows) {
    const a = (row.asset as Record<string, unknown>) || row;
    const pv = (a.primaryVariant as Record<string, unknown>) || {};
    const market = (pv.market as Record<string, unknown>) || {};
    const assetId = String(a.assetId || a.id || row.assetId || "").trim();
    if (!assetId) continue;
    out.push({
      assetId,
      name: String(a.name || pv.name || a.symbol || assetId),
      symbol: String(a.symbol || pv.symbol || ""),
      logo: String(
        a.imageUrl || market.logoURI || a.logo || ""
      ),
    });
  }
  return out;
}

/**
 * $HIT OF THE DAY play surface — mobile dock, multi-ticket, any bag.
 * No page-scroll required to play / confirm / see loader.
 */
export default function DayGamePanel({
  compactTitle = false,
  dense = false,
}: {
  compactTitle?: boolean;
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
  const [searchHits, setSearchHits] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [chip, setChip] = useState<"movers" | "recent" | "all">("movers");
  const [selected, setSelected] = useState<Major | null>(null);
  const [side, setSide] = useState<"hit" | "shit">("hit");
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [hitFlash, setHitFlash] = useState(false);
  const [shitFlash, setShitFlash] = useState(false);
  const [hitDelta, setHitDelta] = useState(0);
  const [shitDelta, setShitDelta] = useState(0);
  const prevPots = useRef<{ hit: number; shit: number } | null>(null);
  const lastTap = useRef<{ id: string; t: number } | null>(null);
  const recentRef = useRef<Major[]>([]);

  const load = useCallback(() => {
    const w = wallet ? `?wallet=${encodeURIComponent(wallet)}` : "";
    fetch(`/api/day${w}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setStatus(d))
      .catch(() => {});
  }, [wallet]);

  useEffect(() => {
    setMounted(true);
    load();
    const a = setInterval(load, 15_000);
    const b = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, [load]);

  // Remote search (any bag)
  useEffect(() => {
    const s = q.trim();
    if (s.length < 2) {
      setSearchHits([]);
      setSearching(false);
      return;
    }
    let alive = true;
    setSearching(true);
    const t = window.setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(s)}&limit=24`, {
        cache: "no-store",
      })
        .then((r) => r.json())
        .then((d) => {
          if (!alive) return;
          setSearchHits(mapSearchResults(d));
        })
        .catch(() => {
          if (alive) setSearchHits([]);
        })
        .finally(() => {
          if (alive) setSearching(false);
        });
    }, 280);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q]);

  const countdown = useMemo(() => {
    if (!mounted || !status?.nextCloseAt) return "—:—";
    const ms = Date.parse(status.nextCloseAt) - Date.now();
    return fmtCountdown(ms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.nextCloseAt, tick, mounted]);

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

  const myMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of status?.myTickets || []) {
      if (t.side !== side) continue;
      m.set(t.assetId, (m.get(t.assetId) || 0) + t.tickets);
    }
    return m;
  }, [status?.myTickets, side]);

  const bags = useMemo(() => {
    const list = status?.majors || [];
    const s = q.trim().toLowerCase();

    // Remote search overrides chips when query long enough
    if (s.length >= 2 && searchHits.length) {
      const byId = new Map(list.map((m) => [m.assetId, m]));
      return searchHits.map((h) => {
        const known = byId.get(h.assetId);
        return (
          known || {
            assetId: h.assetId,
            name: h.name,
            symbol: h.symbol,
            logo: h.logo,
            price: 0,
            pct: null,
          }
        );
      });
    }

    let out = [...list];
    if (s) {
      out = out.filter(
        (m) =>
          m.symbol.toLowerCase().includes(s) ||
          m.name.toLowerCase().includes(s) ||
          m.assetId.toLowerCase().includes(s)
      );
    } else if (chip === "recent") {
      const ids = new Set(recentRef.current.map((r) => r.assetId));
      const recent = recentRef.current.filter((r) =>
        list.some((m) => m.assetId === r.assetId)
      );
      const rest = list.filter((m) => !ids.has(m.assetId));
      out = [...recent, ...rest];
    } else if (chip === "movers") {
      out.sort((a, b) => {
        const ap = Math.abs(a.pct ?? 0);
        const bp = Math.abs(b.pct ?? 0);
        return bp - ap;
      });
    } else {
      // all — sort by side %
      out.sort((a, b) => {
        const ap = a.pct;
        const bp = b.pct;
        const aN = ap == null || !Number.isFinite(ap);
        const bN = bp == null || !Number.isFinite(bp);
        if (aN && bN) return 0;
        if (aN) return 1;
        if (bN) return -1;
        return side === "hit"
          ? (bp as number) - (ap as number)
          : (ap as number) - (bp as number);
      });
    }
    return out;
  }, [status?.majors, q, side, chip, searchHits]);

  async function play(bag?: Major | SearchHit | null) {
    const pick = bag ?? selected;
    setErr(null);
    setMsg(null);
    setPhase(null);
    if (!authenticated) {
      safeLogin();
      return;
    }
    if (!wallet) {
      setErr("Need a Solana wallet linked to X");
      return;
    }
    if (!pick) {
      setErr("Pick a bag first");
      return;
    }
    if (bag) {
      setSelected({
        assetId: bag.assetId,
        name: bag.name,
        symbol: bag.symbol,
        logo: bag.logo,
        price: "price" in bag ? (bag as Major).price : 0,
        pct: "pct" in bag ? (bag as Major).pct : null,
      });
    }
    // remember recent
    recentRef.current = [
      {
        assetId: pick.assetId,
        name: pick.name,
        symbol: pick.symbol,
        logo: pick.logo,
        price: "price" in pick ? (pick as Major).price : 0,
        pct: "pct" in pick ? (pick as Major).pct ?? null : null,
      },
      ...recentRef.current.filter((r) => r.assetId !== pick.assetId),
    ].slice(0, 24);

    setBusy(true);
    try {
      setPhase("Checking balance…");
      const have = await fetchShitBalance(wallet);
      if (have != null && have < PLAY_STAKE) {
        throw new Error(
          `Need ${PLAY_STAKE.toLocaleString()} $${SHIT_SYMBOL} (you have ${have.toLocaleString(undefined, { maximumFractionDigits: 2 })}). Claim or buy first.`
        );
      }
      setPhase("Building…");
      const rawTx = await fetchTransferTx(wallet);
      const txBytes = b64ToBytes(rawTx);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const walletObj =
        (wallets as any[])?.find((w) => w?.address === wallet) ||
        (wallets as any[])?.[0];
      if (!walletObj) throw new Error("No wallet object");

      const desc = `Play 1,000 $${SHIT_SYMBOL} · ${side.toUpperCase()} ${pick.symbol || pick.name}`;
      setPhase("Signing…");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: any;
      try {
        result = await signAndSendTransaction({
          transaction: txBytes,
          wallet: walletObj,
          chain: "solana:mainnet",
          options: {
            sponsor: true,
            uiOptions: { showWalletUIs: false, description: desc },
          },
        });
      } catch {
        result = await signAndSendTransaction({
          transaction: txBytes,
          wallet: walletObj,
          chain: "solana:mainnet",
          options: {
            sponsor: true,
            uiOptions: { showWalletUIs: true, description: desc },
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

      setPhase("Confirming…");
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
      const tc = Number(data.ticketCount || 1);
      setMsg(
        `+1 ticket · ${side.toUpperCase()} ${pick.symbol || pick.name} · you ×${tc}`
      );
      setPhase(null);
      sfx.potUp();
      if (side === "hit") {
        setHitFlash(true);
        setHitDelta(1000);
        const h = (prevPots.current?.hit ?? 0) + 1000;
        prevPots.current = { hit: h, shit: prevPots.current?.shit ?? 0 };
      } else {
        setShitFlash(true);
        setShitDelta(1000);
        const s = (prevPots.current?.shit ?? 0) + 1000;
        prevPots.current = { hit: prevPots.current?.hit ?? 0, shit: s };
      }
      load();
    } catch (e) {
      setPhase(null);
      setErr(friendlySolanaSendError(e));
    } finally {
      setBusy(false);
    }
  }

  function onBagTap(m: Major | SearchHit) {
    const now = Date.now();
    const prev = lastTap.current;
    const asMajor: Major = {
      assetId: m.assetId,
      name: m.name,
      symbol: m.symbol,
      logo: m.logo,
      price: "price" in m ? (m as Major).price : 0,
      pct: "pct" in m ? (m as Major).pct ?? null : null,
      hitPlays: "hitPlays" in m ? (m as Major).hitPlays : 0,
      shitPlays: "shitPlays" in m ? (m as Major).shitPlays : 0,
    };
    setSelected(asMajor);
    setErr(null);
    setMsg(null);
    if (prev && prev.id === m.assetId && now - prev.t < 380) {
      lastTap.current = null;
      void play(asMajor);
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
  const L = status.leaders;
  const myOnSelected = selected
    ? myMap.get(selected.assetId) || 0
    : 0;

  const cta = busy
    ? phase || "Working…"
    : !authenticated
      ? "Login to play"
      : !selected
        ? "Pick a bag"
        : `Play 1,000 · ${side.toUpperCase()} ${selected.symbol || selected.name}`;

  const dockStatus = err || msg || phase || null;

  return (
    <div
      className={`flex flex-col ${
        dense
          ? "min-h-0 h-[min(calc(100dvh-7.5rem),720px)]"
          : "min-h-0 h-[min(calc(100dvh-6rem),760px)]"
      }`}
    >
      {/* ── Status strip ── */}
      <div className="shrink-0 rounded-t-2xl border border-b-0 border-neon/25 bg-card px-3 pt-2.5 pb-2 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            {!compactTitle ? (
              <p className="text-[10px] font-orbitron uppercase tracking-[0.18em] text-neon truncate">
                {HOUR_PRODUCT.name}
              </p>
            ) : (
              <p className="text-[10px] font-orbitron uppercase tracking-wider text-zinc-400">
                Multi-ticket · any bag
              </p>
            )}
          </div>
          <div className="text-right shrink-0 flex items-baseline gap-2">
            <span className="text-[9px] uppercase text-zinc-500 font-orbitron">
              closes
            </span>
            <span className="text-lg font-mono font-bold text-neon tabular-nums leading-none">
              {countdown}
            </span>
          </div>
        </div>

        {/* pots */}
        <div className="flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-950/50 px-2.5 py-1.5">
          <div
            className={`flex-1 relative rounded-md px-1 ${
              hitFlash ? "bg-green-500/15" : ""
            }`}
          >
            <div className="text-[9px] font-orbitron uppercase text-green-400/90 flex items-center gap-0.5">
              <EmojiIcon size={11}>🎯</EmojiIcon> HIT
            </div>
            <div className="text-base font-mono font-bold text-green-400 tabular-nums">
              {fmt(hitPot)}
            </div>
            {hitFlash && hitDelta > 0 && (
              <span className="absolute -top-0.5 right-0 text-[10px] font-mono font-bold text-green-300 animate-[potfloat_0.9s_ease-out_forwards]">
                +{fmt(hitDelta)}
              </span>
            )}
          </div>
          <div className="w-px h-8 bg-zinc-800" />
          <div
            className={`flex-1 relative rounded-md px-1 text-right ${
              shitFlash ? "bg-red-500/15" : ""
            }`}
          >
            <div className="text-[9px] font-orbitron uppercase text-red-400/90 flex items-center justify-end gap-0.5">
              SHIT <EmojiIcon size={11}>💀</EmojiIcon>
            </div>
            <div className="text-base font-mono font-bold text-red-400 tabular-nums">
              {fmt(shitPot)}
            </div>
            {shitFlash && shitDelta > 0 && (
              <span className="absolute -top-0.5 left-0 text-[10px] font-mono font-bold text-red-300 animate-[potfloat_0.9s_ease-out_forwards]">
                +{fmt(shitDelta)}
              </span>
            )}
          </div>
        </div>

        {/* live leaders — tap to select */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            disabled={!L?.hitting}
            onClick={() => {
              if (!L?.hitting) return;
              setSide("hit");
              setSelected({
                assetId: L.hitting.assetId,
                name: L.hitting.name,
                symbol: L.hitting.symbol,
                logo: L.hitting.logo,
                price: L.hitting.price,
                pct: L.hitting.pct,
              });
            }}
            className="cursor-hit rounded-lg border border-green-900/50 bg-green-950/20 px-2 py-1.5 text-left disabled:opacity-40"
          >
            <div className="text-[8px] font-orbitron uppercase text-green-500/80">
              Live HIT
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
              <TokenMark
                logo={L?.hitting?.logo}
                symbol={L?.hitting?.symbol}
                size={18}
              />
              <span className="text-xs font-semibold text-white truncate">
                {L?.hitting?.symbol || "—"}
              </span>
              <span className="text-[11px] font-mono font-bold text-green-400 ml-auto tabular-nums">
                {fmtPct(L?.hitting?.pct)}
              </span>
            </div>
          </button>
          <button
            type="button"
            disabled={!L?.shitting}
            onClick={() => {
              if (!L?.shitting) return;
              setSide("shit");
              setSelected({
                assetId: L.shitting.assetId,
                name: L.shitting.name,
                symbol: L.shitting.symbol,
                logo: L.shitting.logo,
                price: L.shitting.price,
                pct: L.shitting.pct,
              });
            }}
            className="cursor-shit rounded-lg border border-red-900/50 bg-red-950/20 px-2 py-1.5 text-left disabled:opacity-40"
          >
            <div className="text-[8px] font-orbitron uppercase text-red-500/80">
              Live SHIT
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
              <TokenMark
                logo={L?.shitting?.logo}
                symbol={L?.shitting?.symbol}
                size={18}
              />
              <span className="text-xs font-semibold text-white truncate">
                {L?.shitting?.symbol || "—"}
              </span>
              <span className="text-[11px] font-mono font-bold text-red-400 ml-auto tabular-nums">
                {fmtPct(L?.shitting?.pct)}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ── Bag picker (middle, fixed, no page scroll) ── */}
      <div className="flex-1 min-h-0 border-x border-border bg-card px-3 py-2 flex flex-col gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search any bag…"
          className="w-full shrink-0 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-base sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-neon/40"
          enterKeyHint="search"
        />

        {!q.trim() && (
          <div className="flex gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
            {(
              [
                ["movers", "Movers"],
                ["recent", "Recent"],
                ["all", "All"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setChip(id)}
                className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-orbitron uppercase tracking-wider border ${
                  chip === id
                    ? "border-neon/50 bg-neon/15 text-neon"
                    : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
                }`}
              >
                {label}
              </button>
            ))}
            {searching && (
              <span className="text-[10px] text-zinc-600 self-center ml-1">
                searching…
              </span>
            )}
          </div>
        )}

        {/* horizontal 2-row strip — swipe, no page scroll */}
        <div
          className={`flex-1 min-h-0 overflow-x-auto overflow-y-hidden overscroll-x-contain ${
            side === "hit" ? "cursor-hit" : "cursor-shit"
          }`}
          role="listbox"
          aria-label="Pick a bag"
        >
          <div
            className="grid grid-rows-2 grid-flow-col auto-cols-[4.5rem] sm:auto-cols-[5rem] gap-1.5 h-full content-start pr-2"
            style={{ width: "max-content" }}
          >
            {bags.map((m) => {
              const on = selected?.assetId === m.assetId;
              const pct = m.pct;
              const pctKnown = pct != null && Number.isFinite(pct);
              const pctUp = pctKnown && (pct as number) >= 0;
              const mine = myMap.get(m.assetId) || 0;
              const heat =
                side === "hit" ? m.hitPlays || 0 : m.shitPlays || 0;
              return (
                <button
                  key={m.assetId}
                  type="button"
                  role="option"
                  aria-selected={on}
                  title={`${m.symbol || m.name} ${fmtPct(pct)} — double-tap play`}
                  disabled={busy}
                  onClick={() => onBagTap(m)}
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    void play(m);
                  }}
                  className={`relative flex flex-col items-center justify-center gap-0.5 rounded-xl border p-1.5 h-[4.75rem] sm:h-[5.25rem] transition-colors active:brightness-110 disabled:opacity-50 ${
                    on
                      ? side === "hit"
                        ? "border-green-400 bg-green-950/55 ring-2 ring-green-400/45"
                        : "border-red-400 bg-red-950/55 ring-2 ring-red-400/45"
                      : "border-zinc-800/90 bg-zinc-950/70 hover:border-zinc-500"
                  }`}
                >
                  <TokenMark logo={m.logo} symbol={m.symbol} size={28} />
                  <span className="text-[10px] font-semibold text-zinc-200 truncate w-full text-center leading-tight">
                    {m.symbol || m.name}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold tabular-nums leading-none ${
                      !pctKnown
                        ? "text-zinc-600"
                        : pctUp
                          ? "text-green-400"
                          : "text-red-400"
                    }`}
                  >
                    {fmtPct(pct)}
                  </span>
                  {mine > 0 && (
                    <span className="absolute -top-1 -left-1 text-[9px] font-bold font-mono rounded-full bg-neon text-black px-1 leading-tight">
                      ×{mine}
                    </span>
                  )}
                  {heat > 0 && !mine && (
                    <span className="absolute -top-1 -right-1 text-[8px] font-mono text-zinc-500">
                      {heat}
                    </span>
                  )}
                </button>
              );
            })}
            {!bags.length && (
              <div className="row-span-2 flex items-center px-6 text-sm text-zinc-600">
                {q.trim().length >= 2
                  ? searching
                    ? "Searching…"
                    : "No match"
                  : "No bags"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom dock (never scrolls away) ── */}
      <div
        className="shrink-0 rounded-b-2xl border border-t-0 border-neon/25 bg-card px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] space-y-2 shadow-[0_-8px_24px_rgba(0,0,0,0.35)]"
      >
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setSide("hit")}
            className={`cursor-hit min-h-12 rounded-xl font-bold text-sm border-2 inline-flex items-center justify-center gap-1.5 font-orbitron tracking-wide transition-colors ${
              side === "hit"
                ? "border-green-400 bg-green-900/50 text-green-100"
                : "border-zinc-800 text-zinc-500"
            }`}
          >
            <EmojiIcon size={18}>🎯</EmojiIcon> HIT
          </button>
          <button
            type="button"
            onClick={() => setSide("shit")}
            className={`cursor-shit min-h-12 rounded-xl font-bold text-sm border-2 inline-flex items-center justify-center gap-1.5 font-orbitron tracking-wide transition-colors ${
              side === "shit"
                ? "border-red-400 bg-red-900/50 text-red-100"
                : "border-zinc-800 text-zinc-500"
            }`}
          >
            <EmojiIcon size={18}>💀</EmojiIcon> SHIT
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 text-[11px] min-h-[1.1rem]">
          <span className="text-zinc-400 font-mono truncate">
            {selected
              ? `${side.toUpperCase()} · ${selected.symbol || selected.name}${
                  myOnSelected ? ` · you ×${myOnSelected}` : ""
                }`
              : "Tap a bag · double-tap plays"}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={playPotPortfolioUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400/90 hover:underline font-mono text-[10px]"
              title={PLAY_POT_ADDRESS}
            >
              pot {PLAY_POT_ADDRESS.slice(0, 6)}…
            </a>
            <Link
              href={HOUR_PRODUCT.winnersPath}
              className="text-neon-blue hover:underline font-orbitron uppercase tracking-wider text-[10px]"
            >
              Winners
            </Link>
          </div>
        </div>

        {/* status line — always in dock */}
        <div className="min-h-[1.15rem]">
          {err && (
            <p className="text-[11px] text-red-400 truncate">{err}</p>
          )}
          {!err && msg && (
            <p className="text-[11px] text-neon truncate">{msg}</p>
          )}
          {!err && !msg && phase && (
            <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
              <EmojiIcon size={12} className="animate-spin">
                💫
              </EmojiIcon>
              {phase}
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={busy || !status.enabled}
          onClick={() => void play()}
          className={`w-full min-h-12 rounded-xl bg-neon text-black font-bold text-sm hover:brightness-110 disabled:opacity-45 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 font-orbitron tracking-wide uppercase ${
            !busy && status.enabled
              ? "shadow-[0_0_20px_rgba(57,255,20,0.22)] " +
                (side === "hit" ? "cursor-hit" : "cursor-shit")
              : ""
          }`}
        >
          {busy && (
            <EmojiIcon size={16} className="animate-spin" label="Loading">
              💫
            </EmojiIcon>
          )}
          {cta}
        </button>

        {err && /claim|buy|balance|Need/i.test(err) && (
          <div className="flex gap-2">
            <Link
              href="/claim"
              className="flex-1 text-center text-[11px] py-1.5 rounded-lg border border-zinc-700 text-zinc-300"
            >
              Claim
            </Link>
            <Link
              href="/swap"
              className="flex-1 text-center text-[11px] py-1.5 rounded-lg border border-neon/40 text-neon"
            >
              Buy
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
