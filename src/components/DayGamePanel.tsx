"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useWallets,
  useSignAndSendTransaction,
  useSignTransaction,
} from "@privy-io/react-auth/solana";
import { pickSolanaAddress } from "@/lib/privy-identity";
import { useSafeLogin } from "@/hooks/useSafeLogin";
import {
  SHIT_SYMBOL,
  PLAY_POT_ADDRESS,
  playPotPortfolioUrl,
} from "@/lib/shit-token";
import {
  b64ToBytes,
  friendlySolanaSendError,
  sendWithPrivyFallback,
} from "@/lib/solana-send";
import Link from "next/link";
import { EmojiIcon } from "@/components/EmojiIcon";
import { HOUR_PRODUCT, PLAY_PRODUCT } from "@/lib/hour-product";
import { isMuted, sfx, toggleMuted } from "@/lib/sfx";

const PLAY_STAKE = 0; // free play
const DEFAULT_MAX_PICKS = 2;
const DEFAULT_MIN_BAL = 10_000;
const DEFAULT_HOUR_PRIZE = 10_000;
const TIP_KEY = "tokenshit_play_tip_v3";

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
  freePlay?: boolean;
  maxPicks?: number;
  maxPerSide?: number;
  mySides?: { hit?: number; shit?: number };
  minBalance?: number;
  requireFollow?: boolean;
  prize?: { base: number; jackpot: number; total: number };
  multiTicket?: boolean;
  houseSpark?: {
    enabled?: boolean;
    hourAmount?: number;
    dayCap?: number;
    seeded?: number;
    status?: string | null;
    signature?: string | null;
  };
  round: { hitPot: number; shitPot: number; status: string } | null;
  stats: {
    hitStakes: number;
    shitStakes: number;
    hitTickets: number;
    shitTickets: number;
    hitPlayers?: number;
    shitPlayers?: number;
    players?: number;
    plays?: number;
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
        className="shrink-0 rounded-full bg-zinc-900 object-cover ring-1 ring-white/10"
        style={{ width: dim, height: dim }}
        onError={() => setBroken(true)}
      />
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-zinc-900 font-orbitron font-bold text-neon ring-1 ring-white/10"
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

function fmtPrice(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n) || n <= 0) return "—";
  if (n >= 1000)
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (n >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (n >= 0.01)
    return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

function fmtCountdown(ms: number) {
  if (ms <= 0) return "00:00";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const mm = m % 60;
  const sec = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

async function fetchTransferTx(
  wallet: string,
  opts?: { side?: string; symbol?: string; assetId?: string }
): Promise<string> {
  const res = await fetch("/api/day/build-transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet,
      side: opts?.side,
      symbol: opts?.symbol,
      assetId: opts?.assetId,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.transaction) {
    throw new Error(data.error || "Could not build play transfer");
  }
  return data.transaction as string;
}

type SearchHit = {
  assetId: string;
  name: string;
  symbol: string;
  logo: string;
};

function mapSearchResults(data: unknown): SearchHit[] {
  const root = data as { results?: unknown[]; assets?: unknown[] };
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
      logo: String(a.imageUrl || market.logoURI || a.logo || ""),
    });
  }
  return out;
}

function toMajor(m: Major | SearchHit | Leader): Major {
  return {
    assetId: m.assetId,
    name: m.name,
    symbol: m.symbol,
    logo: m.logo,
    price: "price" in m ? Number((m as Major).price || 0) : 0,
    pct: "pct" in m ? ((m as Major).pct ?? null) : null,
    hitPlays: "hitPlays" in m ? (m as Major).hitPlays : 0,
    shitPlays: "shitPlays" in m ? (m as Major).shitPlays : 0,
  };
}

/**
 * Mobile-first play — less chrome, loud SFX, clear loop.
 */
export default function DayGamePanel({
  compactTitle: _c = false,
  dense: _d = false,
}: {
  compactTitle?: boolean;
  dense?: boolean;
} = {}) {
  const { ready, authenticated, getAccessToken, user } = usePrivy();
  const twitter = user?.twitter?.username || null;
  const { safeLogin } = useSafeLogin();
  const { wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const { signTransaction } = useSignTransaction();
  const wallet = useMemo(
    () => pickSolanaAddress(wallets, user),
    [wallets, user]
  );

  const [status, setStatus] = useState<DayStatus | null>(null);
  const [q, setQ] = useState("");
  const [searchHits, setSearchHits] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Major | null>(null);
  const [cart, setCart] = useState<
    Array<{ assetId: string; side: "hit" | "shit"; symbol: string; name: string; logo: string }>
  >([]);
  const [side, setSide] = useState<"hit" | "shit">("hit");
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [justPlayed, setJustPlayed] = useState(false);
  const [solBalUi, setSolBalUi] = useState<number | null>(null);
  const [shitBalUi, setShitBalUi] = useState<number | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const prevPots = useRef<{ hit: number; shit: number } | null>(null);
  const lastBagTap = useRef<{ id: string; t: number } | null>(null);
  const hourKeyRef = useRef<string | null>(null);

  const load = useCallback(() => {
    const w = wallet ? `?wallet=${encodeURIComponent(wallet)}` : "";
    const ac = new AbortController();
    const kill = setTimeout(() => ac.abort(), 20_000);
    fetch(`/api/day${w}`, { cache: "no-store", signal: ac.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Play API ${r.status}`);
        return r.json();
      })
      .then((d) => {
        setStatus(d);
        setLoadErr(null);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        setLoadErr(
          e?.name === "AbortError"
            ? "Play is slow right now — retry."
            : String(e?.message || e || "Could not load play")
        );
      })
      .finally(() => clearTimeout(kill));
    if (wallet) {
      fetch(`/api/wallet/balances?address=${encodeURIComponent(wallet)}`, {
        cache: "no-store",
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((bd) => {
          if (!bd) return;
          const s = Number(bd.sol);
          const n = Number(bd.shit ?? bd.tokenshit ?? bd.balance);
          if (Number.isFinite(s)) setSolBalUi(s);
          if (Number.isFinite(n)) setShitBalUi(n);
        })
        .catch(() => {});
    }
  }, [wallet]);

  useEffect(() => {
    setMounted(true);
    setSoundOn(!isMuted());
    try {
      if (!localStorage.getItem(TIP_KEY)) setShowTip(true);
    } catch {
      setShowTip(true);
    }
    load();
    const a = setInterval(load, 12_000);
    const b = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, [load]);

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
          if (alive) setSearchHits(mapSearchResults(d));
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

  const msLeft = useMemo(() => {
    if (!mounted || !status?.nextCloseAt) return 0;
    return Math.max(0, Date.parse(status.nextCloseAt) - Date.now());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.nextCloseAt, tick, mounted]);

  const countdown = useMemo(() => fmtCountdown(msLeft), [msLeft]);
  const urgent = msLeft > 0 && msLeft < 5 * 60 * 1000;

  useEffect(() => {
    if (!status?.round) return;
    const hit = status.round.hitPot || 0;
    const shit = status.round.shitPot || 0;
    const prev = prevPots.current;
    if (prev && (hit > prev.hit || shit > prev.shit)) {
      sfx.potUp();
    }
    prevPots.current = { hit, shit };
  }, [status?.round?.hitPot, status?.round?.shitPot]);

  useEffect(() => {
    if (!justPlayed) return;
    const t = window.setTimeout(() => setJustPlayed(false), 2400);
    return () => clearTimeout(t);
  }, [justPlayed]);

  const myMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of status?.myTickets || []) {
      if (t.side !== side) continue;
      m.set(t.assetId, (m.get(t.assetId) || 0) + t.tickets);
    }
    return m;
  }, [status?.myTickets, side]);


  // New UTC hour → wipe cart + stale tickets so max resets
  useEffect(() => {
    const h = status?.utcHour || null;
    if (!h) return;
    if (hourKeyRef.current && hourKeyRef.current !== h) {
      setCart([]);
      setSelected(null);
      setJustPlayed(false);
      setMsg(null);
      setErr(null);
    }
    hourKeyRef.current = h;
  }, [status?.utcHour]);


  useEffect(() => {
    const ms = status?.msToClose;
    if (ms == null || ms > 2_000) return;
    const tmr = window.setTimeout(() => load(), Math.max(500, ms + 400));
    return () => window.clearTimeout(tmr);
  }, [status?.msToClose, load]);

  const myTotal = useMemo(() => {
    let n = 0;
    for (const t of status?.myTickets || []) n += t.tickets;
    return n;
  }, [status?.myTickets]);

  const bags = useMemo(() => {
    const list = status?.majors || [];
    const s = q.trim().toLowerCase();
    let out: Major[];
    if (s.length >= 2 && searchHits.length) {
      const byId = new Map(list.map((m) => [m.assetId, m]));
      out = searchHits.map((h) => byId.get(h.assetId) || toMajor(h));
    } else {
      out = [...list];
      if (s) {
        out = out.filter(
          (m) =>
            m.symbol.toLowerCase().includes(s) ||
            m.name.toLowerCase().includes(s) ||
            m.assetId.toLowerCase().includes(s)
        );
      }
    }
    // Always sort by hour % — HIT: best first · SHIT: worst first
    out.sort((a, b) => {
      const ap = a.pct;
      const bp = b.pct;
      const aNull = ap == null || !Number.isFinite(ap);
      const bNull = bp == null || !Number.isFinite(bp);
      if (aNull && bNull) {
        return (a.symbol || "").localeCompare(b.symbol || "");
      }
      if (aNull) return 1;
      if (bNull) return -1;
      if (side === "hit") {
        if (bp !== ap) return (bp as number) - (ap as number);
      } else {
        if (ap !== bp) return (ap as number) - (bp as number);
      }
      // tie-break: more plays, then symbol
      const playsA = (a.hitPlays || 0) + (a.shitPlays || 0);
      const playsB = (b.hitPlays || 0) + (b.shitPlays || 0);
      if (playsB !== playsA) return playsB - playsA;
      return (a.symbol || "").localeCompare(b.symbol || "");
    });
    return out;
  }, [status?.majors, q, side, searchHits]);

  function toggleCart(bag: Major) {
    sfx.tap();
    const playedAssets = new Set((status?.myTickets || []).map((x) => x.assetId));
    if (playedAssets.has(bag.assetId)) {
      setErr("Already played this token this hour");
      sfx.error();
      return;
    }
    const maxP = status?.maxPicks ?? DEFAULT_MAX_PICKS;
    const remaining = Math.max(0, maxP - playedAssets.size);
    setSelected(bag);
    setErr(null);
    setCart((prev) => {
      if (prev.some((c) => c.assetId === bag.assetId)) {
        return prev.filter((c) => c.assetId !== bag.assetId);
      }
      const sideUsed = (status?.mySides?.[side] || 0) + prev.filter((c) => c.side === side).length;
      if (sideUsed >= 1) {
        setErr(
          `Already have 1 ${side === "hit" ? "UP" : "DOWN"} this hour`
        );
        sfx.error();
        return prev;
      }
      return [
        ...prev,
        {
          assetId: bag.assetId,
          side,
          symbol: bag.symbol,
          name: bag.name,
          logo: bag.logo,
        },
      ];
    });
  }

  async function play(_bag?: Major | SearchHit | null) {
    if (busy) return;
    if (!authenticated || !ready) {
      safeLogin();
      return;
    }
    if (!wallet) {
      setErr("Link a Solana wallet to play");
      sfx.error();
      return;
    }
    if (!twitter) {
      setErr("Sign in with X — follow @Tokenshit_ required to Play");
      sfx.error();
      return;
    }

    const maxP = status?.maxPicks ?? DEFAULT_MAX_PICKS;
    const minBal = status?.minBalance ?? DEFAULT_MIN_BAL;
    const playedAssets = new Set((status?.myTickets || []).map((x) => x.assetId));
    const remaining = Math.max(0, maxP - playedAssets.size);

    let queue = cart.filter((c) => !playedAssets.has(c.assetId));
    if (!queue.length && selected && !playedAssets.has(selected.assetId)) {
      queue = [
        {
          assetId: selected.assetId,
          side,
          symbol: selected.symbol,
          name: selected.name,
          logo: selected.logo,
        },
      ];
    }
    if (!queue.length) {
      setErr("Add 1 UP and/or 1 DOWN, then Lock");
      sfx.error();
      return;
    }
    if (queue.length > remaining) queue = queue.slice(0, remaining);
    if (remaining <= 0) {
      setErr("Used 1 UP and 1 DOWN this hour — wait for the next hour");
      sfx.error();
      return;
    }

    setErr(null);
    setMsg(null);
    setBusy(true);
    try {
      setPhase(
        queue.length > 1
          ? `Locking ${queue.length} free picks…`
          : "Locking free pick…"
      );
      let have: number | null = shitBalUi;
      if (have == null) {
        try {
          const br = await fetch(
            `/api/wallet/shit-balance?address=${encodeURIComponent(wallet)}`,
            { cache: "no-store" }
          );
          if (br.ok) {
            const bd = await br.json();
            const n = Number(bd.ui ?? bd.balance ?? bd.shit);
            if (Number.isFinite(n)) have = n;
          }
        } catch {
          /* */
        }
      }
      if (have != null && have < minBal) {
        throw new Error(
          `Hold at least ${minBal.toLocaleString()} $${SHIT_SYMBOL} to play (have ${Math.floor(have).toLocaleString()}). Claim or buy — don't dump.`
        );
      }
      sfx.tap();
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
          picks: queue.map((q) => ({ assetId: q.assetId, side: q.side })),
          accessToken: token,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        lockedCount?: number;
        picksUsed?: number;
        maxPicks?: number;
  maxPerSide?: number;
  mySides?: { hit?: number; shit?: number };
        locked?: Array<{ ok?: boolean }>;
      };
      if (!res.ok) throw new Error(String(data.error || "Play failed"));
      const n = Number(data.lockedCount || 0);
      const used = Number(data.picksUsed || playedAssets.size + n);
      const max = Number(data.maxPicks || maxP);
      const left = Math.max(0, max - used);
      setMsg(
        n > 0
          ? `Locked ${n} free pick${n === 1 ? "" : "s"} · ${left} left this hour`
          : data.error || "Nothing locked"
      );
      setCart([]);
      setSelected(null);
      setPhase(null);
      setJustPlayed(n > 0);
      sfx.lock();
      if (side === "hit") sfx.hit();
      else sfx.shit();
      load();
    } catch (e) {
      setPhase(null);
      setErr(e instanceof Error ? e.message : String(e));
      sfx.error();
    } finally {
      setBusy(false);
    }
  }

  function pickBag(m: Major | SearchHit | Leader) {
    sfx.unlock();
    setMsg(null);
    toggleCart(toMajor(m));
  }


  function setSideSafe(next: "hit" | "shit") {
    sfx.unlock();
    if (next === "hit") sfx.sideUp();
    else sfx.sideDown();
    setSide(next);
  }

  function dismissTip() {
    sfx.tap();
    setShowTip(false);
    try {
      localStorage.setItem(TIP_KEY, "1");
    } catch {
      /* */
    }
  }

  function onMute() {
    const next = toggleMuted();
    setSoundOn(!next);
    if (!next) sfx.ding();
  }

  if (!ready || loading || !status) {
    return (
      <div className="flex h-full min-h-[12rem] flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-card px-4">
        {loadErr ? (
          <>
            <p className="text-center text-sm text-red-400">{loadErr}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setLoadErr(null);
                load();
              }}
              className="min-h-11 rounded-xl bg-neon px-5 text-sm font-bold text-black"
            >
              Retry Play
            </button>
          </>
        ) : (
          <EmojiIcon size={28} className="animate-spin opacity-90">
            💫
          </EmojiIcon>
        )}
      </div>
    );
  }

  const hitPot = status.round?.hitPot || 0;
  const shitPot = status.round?.shitPot || 0;
  const L = status.leaders;
  const myOnSelected = selected ? myMap.get(selected.assetId) || 0 : 0;
  const sideLabel = side === "hit" ? "UP" : "DOWN";
  const potForSide = side === "hit" ? hitPot : shitPot;

  const playedN = new Set((status?.myTickets || []).map((x) => x.assetId)).size;
  const maxPui = status?.maxPicks ?? DEFAULT_MAX_PICKS;
  const cartN = cart.length;
  const cta = busy
    ? phase || "Working…"
    : !authenticated
      ? "Login to play"
      : cartN > 0
        ? `Lock ${cartN} free pick${cartN === 1 ? "" : "s"} · ${sideLabel}`
        : playedN >= maxPui
          ? "Max 1 UP + 1 DOWN this hour"
          : "Tap 1 UP + 1 DOWN then Lock";

  return (
    <div
      className="flex h-full min-h-0 flex-col"
      onPointerDown={() => sfx.unlock()}
    >
      {/* Slim HUD */}
      <div className="shrink-0 rounded-t-3xl border border-b-0 border-neon/30 bg-[#0c0c12]">
        <div className="flex items-center gap-2 px-3 py-2">
          <div
            className={`min-w-[4.5rem] rounded-xl border px-2 py-1 text-center ${
              urgent
                ? "border-amber-400/50 bg-amber-500/10"
                : "border-neon/35 bg-black/50"
            }`}
          >
            <div
              className={`font-mono text-lg font-black tabular-nums leading-none ${
                urgent ? "text-amber-300" : "text-neon"
              }`}
            >
              {countdown}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSideSafe("hit")}
            className={`cursor-hit min-w-0 flex-1 rounded-xl px-2 py-1.5 text-left transition ${
              side === "hit"
                ? "bg-green-500/20 ring-1 ring-green-400/50"
                : "bg-green-950/30 opacity-70"
            }`}
          >
            <div className="font-orbitron text-[9px] uppercase tracking-wider text-green-400">
              UP
            </div>
            <div className="truncate font-mono text-base font-black tabular-nums text-green-300">
              {fmt(hitPot)}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSideSafe("shit")}
            className={`cursor-shit min-w-0 flex-1 rounded-xl px-2 py-1.5 text-right transition ${
              side === "shit"
                ? "bg-red-500/20 ring-1 ring-red-400/50"
                : "bg-red-950/30 opacity-70"
            }`}
          >
            <div className="font-orbitron text-[9px] uppercase tracking-wider text-red-400">
              DOWN
            </div>
            <div className="truncate font-mono text-base font-black tabular-nums text-red-300">
              {fmt(shitPot)}
            </div>
          </button>

          <button
            type="button"
            onClick={onMute}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800 text-sm"
            aria-label={soundOn ? "Mute" : "Unmute"}
            title={soundOn ? "Mute" : "Unmute"}
          >
            <EmojiIcon size={16}>{soundOn ? "🔊" : "🔇"}</EmojiIcon>
          </button>
        </div>

        {/* one-line leaders */}
        {(L?.hitting || L?.shitting) && (
          <div className="flex items-center gap-2 border-t border-white/5 px-3 py-1.5">
            {L?.hitting && (
              <button
                type="button"
                onClick={() => {
                  setSideSafe("hit");
                  pickBag(L.hitting!);
                }}
                className="flex min-w-0 flex-1 items-center gap-1.5"
              >
                <TokenMark
                  logo={L.hitting.logo}
                  symbol={L.hitting.symbol}
                  size={20}
                />
                <span className="truncate text-xs font-bold text-white">
                  {L.hitting.symbol}
                </span>
                <span className="font-mono text-[11px] font-bold text-green-400">
                  {fmtPct(L.hitting.pct)}
                </span>
              </button>
            )}
            {L?.shitting && (
              <button
                type="button"
                onClick={() => {
                  setSideSafe("shit");
                  pickBag(L.shitting!);
                }}
                className="flex min-w-0 flex-1 items-center justify-end gap-1.5"
              >
                <span className="font-mono text-[11px] font-bold text-red-400">
                  {fmtPct(L.shitting.pct)}
                </span>
                <span className="truncate text-xs font-bold text-white">
                  {L.shitting.symbol}
                </span>
                <TokenMark
                  logo={L.shitting.logo}
                  symbol={L.shitting.symbol}
                  size={20}
                />
              </button>
            )}
          </div>
        )}
      </div>

      {showTip && (
        <div className="flex shrink-0 items-center gap-2 border-x border-border bg-neon/10 px-3 py-2 text-[11px] leading-snug text-zinc-200">
          <span className="min-w-0 flex-1">
            <b className="text-neon">Play:</b> tap 1 UP and 1 DOWN, then Lock.{" "}
            FREE · 1 UP + 1 DOWN · {DEFAULT_HOUR_PRIZE.toLocaleString()} ${SHIT_SYMBOL}/hr · jackpot rolls
            pot.
          </span>
          <button
            type="button"
            onClick={dismissTip}
            className="shrink-0 font-bold text-neon"
          >
            OK
          </button>
        </div>
      )}


      <div className="flex shrink-0 items-center justify-center gap-3 border-x border-border bg-black/40 px-3 py-1.5 font-mono text-[11px] text-zinc-400">
        <span>
          <b className="text-neon">{status?.stats?.players ?? 0}</b> playing
        </span>
        <span className="text-zinc-600">·</span>
        <span>
          <b className="text-zinc-200">{status?.stats?.plays ?? 0}</b> picks
        </span>
        <span className="text-zinc-600">·</span>
        <span>
          you{" "}
          <b className="text-amber-300">
            {(status?.mySides?.hit || 0) ? "UP✓" : "UP"}
            {" · "}
            {(status?.mySides?.shit || 0) ? "DOWN✓" : "DOWN"}
          </b>
        </span>
        {cart.length > 0 && (
          <>
            <span className="text-zinc-600">·</span>
            <span className="text-amber-300">cart {cart.length}</span>
          </>
        )}
      </div>

      {authenticated &&
        wallet &&
        solBalUi != null &&
        solBalUi < 0.002 && (
          <div className="flex shrink-0 flex-col gap-1.5 border-x border-amber-500/30 bg-amber-500/10 px-3 py-2">
            <p className="text-[11px] text-amber-100 leading-snug">
              <b className="text-amber-300">Low SOL</b> — need ~0.01 SOL for
              play fees
              {solBalUi != null ? ` (have ${solBalUi.toFixed(4)})` : ""}.
            </p>
            <div className="flex gap-2">
              <Link
                href="/claim"
                className="flex-1 rounded-lg border border-amber-400/40 bg-amber-500/15 py-2 text-center text-[11px] font-bold text-amber-100"
              >
                Love gas (free plays)
              </Link>
              <Link
                href="/swap"
                className="flex-1 rounded-lg bg-neon py-2 text-center text-[11px] font-bold text-black"
              >
                Buy SOL / SHIT
              </Link>
            </div>
          </div>
        )}

      {authenticated &&
        wallet &&
        shitBalUi != null &&
        shitBalUi < (status?.minBalance ?? DEFAULT_MIN_BAL) &&
        !(solBalUi != null && solBalUi < 0.002) && (
          <div className="flex shrink-0 flex-col gap-1.5 border-x border-neon/25 bg-neon/5 px-3 py-2">
            <p className="text-[11px] text-zinc-200 leading-snug">
              Need {(status?.minBalance ?? DEFAULT_MIN_BAL).toLocaleString()} ${SHIT_SYMBOL} held to play (have{" "}
              {fmt(shitBalUi)}).
            </p>
            <div className="flex gap-2">
              <Link
                href="/claim"
                className="flex-1 rounded-lg border border-neon/40 py-2 text-center text-[11px] font-bold text-neon"
              >
                Claim free
              </Link>
              <Link
                href="/swap"
                className="flex-1 rounded-lg bg-neon py-2 text-center text-[11px] font-bold text-black"
              >
                Buy
              </Link>
            </div>
          </div>
        )}

      {/* Side pills */}
      <div className="shrink-0 border-x border-border bg-card px-3 py-2">
        <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-zinc-950 p-1">
          <button
            type="button"
            onClick={() => setSideSafe("hit")}
            className={`cursor-hit flex min-h-11 items-center justify-center gap-1.5 rounded-xl font-orbitron text-sm font-black ${
              side === "hit"
                ? "bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.35)]"
                : "text-zinc-500"
            }`}
          >
            <EmojiIcon size={16}>🎯</EmojiIcon> UP
          </button>
          <button
            type="button"
            onClick={() => setSideSafe("shit")}
            className={`cursor-shit flex min-h-11 items-center justify-center gap-1.5 rounded-xl font-orbitron text-sm font-black ${
              side === "shit"
                ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.35)]"
                : "text-zinc-500"
            }`}
          >
            <EmojiIcon size={16}>💀</EmojiIcon> DOWN
          </button>
        </div>
      </div>

      {/* Bags */}
      <div className="flex min-h-0 flex-1 flex-col border-x border-border bg-card">
        <div className="flex shrink-0 items-center gap-2 px-3 pt-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="min-h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-base text-white placeholder:text-zinc-600 focus:border-neon/40 focus:outline-none"
            enterKeyHint="search"
          />
          {myTotal > 0 && (
            <span className="shrink-0 rounded-full bg-neon/15 px-2 py-1 font-mono text-[10px] font-bold text-neon">
              you ×{myTotal}
            </span>
          )}
        </div>

        <div
          className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2 ${
            side === "hit" ? "cursor-hit" : "cursor-shit"
          }`}
        >
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {bags.map((m) => {
              const on = selected?.assetId === m.assetId || cart.some((c) => c.assetId === m.assetId);
              const pct = m.pct;
              const pctKnown = pct != null && Number.isFinite(pct);
              const pctUp = pctKnown && (pct as number) >= 0;
              const mine = myMap.get(m.assetId) || 0;
              return (
                <button
                  key={m.assetId}
                  type="button"
                  disabled={busy}
                  onClick={() => pickBag(m)}
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    sfx.unlock();
                    void play(m);
                  }}
                  title="Double-tap to play"
                  className={`relative flex flex-col items-center gap-0.5 rounded-2xl border p-2 transition active:scale-[0.97] disabled:opacity-50 ${
                    on
                      ? side === "hit"
                        ? "border-green-400 bg-green-950/70 ring-2 ring-green-400/40"
                        : "border-red-400 bg-red-950/70 ring-2 ring-red-400/40"
                      : "border-zinc-800 bg-zinc-950/90 hover:border-zinc-600"
                  }`}
                >
                  <TokenMark logo={m.logo} symbol={m.symbol} size={40} />
                  <span className="w-full truncate text-center text-[11px] font-bold text-zinc-100">
                    {m.symbol || m.name}
                  </span>
                  <span
                    className={`font-mono text-[13px] font-black tabular-nums leading-none ${
                      !pctKnown
                        ? "text-zinc-500"
                        : pctUp
                          ? "text-green-400"
                          : "text-red-400"
                    }`}
                  >
                    {fmtPct(pct)}
                  </span>
                  <span className="font-mono text-[9px] tabular-nums text-zinc-500">
                    ${fmtPrice(m.price)}
                  </span>
                  {mine > 0 && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-neon px-1.5 font-mono text-[10px] font-bold text-black">
                      ×{mine}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {!bags.length && (
            <div className="flex h-24 items-center justify-center text-sm text-zinc-600">
              {searching ? "…" : "No bags"}
            </div>
          )}
        </div>
      </div>

      {/* Dock */}
      <div
        className={`shrink-0 space-y-2 rounded-b-3xl border border-t-0 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5 ${
          justPlayed
            ? "border-neon/50 bg-neon/10"
            : "border-neon/30 bg-[#0c0c12]"
        } shadow-[0_-12px_32px_rgba(0,0,0,0.5)]`}
      >
        {selected ? (
          <div className="flex items-center gap-2.5">
            <TokenMark
              logo={selected.logo}
              symbol={selected.symbol}
              size={36}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-black text-white">
                  {selected.symbol || selected.name}
                </span>
                <span
                  className={`rounded px-1 py-0.5 font-orbitron text-[9px] font-bold ${
                    side === "hit"
                      ? "bg-green-500/25 text-green-300"
                      : "bg-red-500/25 text-red-300"
                  }`}
                >
                  {sideLabel}
                </span>
                <span
                  className={`font-mono text-[11px] font-bold tabular-nums ${
                    selected.pct == null
                      ? "text-zinc-500"
                      : selected.pct >= 0
                        ? "text-green-400"
                        : "text-red-400"
                  }`}
                >
                  {fmtPct(selected.pct)}
                </span>
                <span className="font-mono text-[10px] text-zinc-500">
                  ${fmtPrice(selected.price)}
                </span>
              </div>
              <p className="font-mono text-[10px] text-zinc-600">
                FREE pick
                {myOnSelected ? ` · you ×${myOnSelected}` : ""}
                {" · "}
                {(status?.myTickets || []).length}/
                1 UP + 1 DOWN this hour
                {" · pot "}
                {fmt(potForSide)}
                {status?.houseSpark?.seeded
                  ? ` · spark ${fmt(status.houseSpark.seeded)}`
                  : ""}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-center text-xs text-zinc-500">Tap bag · double-tap to play</p>
        )}

        {(err || msg || phase) && (
          <p
            className={`text-center text-[11px] font-medium ${
              err ? "text-red-400" : msg ? "text-neon" : "text-zinc-400"
            }`}
          >
            {err || msg || phase}
          </p>
        )}

        {justPlayed && !err && !busy && (
          <div className="flex gap-2">
            <a
              href={`https://x.com/intent/tweet?text=${encodeURIComponent(
                `Locked ${sideLabel} on ${PLAY_PRODUCT.tweetName} @Tokenshit_ — FREE pick in the pot.\n\nhttps://tokenshit.com/play`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-xl border border-zinc-600 py-2.5 text-center text-xs font-semibold text-zinc-200 hover:border-neon"
            >
              Brag on X
            </a>
            <button
              type="button"
              onClick={() => {
                setJustPlayed(false);
                setMsg(null);
              }}
              className="flex-1 rounded-xl border border-neon/40 bg-neon/10 py-2.5 text-center text-xs font-bold text-neon"
            >
              Play again
            </button>
          </div>
        )}


        {cart.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center px-1">
            {cart.map((c) => (
              <button
                key={c.assetId}
                type="button"
                onClick={() =>
                  setCart((prev) => prev.filter((x) => x.assetId !== c.assetId))
                }
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                  c.side === "hit"
                    ? "border-green-500/40 bg-green-500/15 text-green-300"
                    : "border-red-500/40 bg-red-500/15 text-red-300"
                }`}
              >
                <TokenMark logo={c.logo} symbol={c.symbol} size={14} />
                {c.symbol} · {c.side === "hit" ? "UP" : "DOWN"} ×
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          disabled={busy || !status.enabled || (authenticated && cart.length === 0)}
          onClick={() => void play()}
          className={`flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-2xl font-orbitron text-sm font-black uppercase tracking-wide transition active:scale-[0.99] disabled:opacity-40 ${
            side === "hit"
              ? "cursor-hit bg-green-500 text-black shadow-[0_0_28px_rgba(34,197,94,0.35)]"
              : "cursor-shit bg-red-500 text-white shadow-[0_0_28px_rgba(239,68,68,0.35)]"
          }`}
        >
          {busy && (
            <EmojiIcon size={16} className="animate-spin">
              💫
            </EmojiIcon>
          )}
          {cta}
        </button>

        <p className="text-center font-mono text-[9px] text-zinc-600">
          FREE · correct picks split{" "}
          {fmt(status?.prize?.total ?? DEFAULT_HOUR_PRIZE)} ${SHIT_SYMBOL}/hr
          {(status?.prize?.jackpot || 0) > 0
            ? ` · jackpot +${fmt(status!.prize!.jackpot)}`
            : ""}
          {" · "}
          <Link href={HOUR_PRODUCT.winnersPath} className="text-zinc-400">
            winners
          </Link>
          {" · "}
          <a
            href={playPotPortfolioUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500"
            title={PLAY_POT_ADDRESS}
          >
            pot
          </a>
        </p>

        {err && /claim|buy|balance|Need|SOL|\$TOKENSHIT|TOKENSHIT/i.test(err) && (
          <div className="flex gap-2">
            <Link
              href="/claim"
              className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-center text-xs font-semibold text-zinc-200"
            >
              {/SOL|gas|fee/i.test(err) ? "Love gas" : "Claim"}
            </Link>
            <Link
              href="/swap"
              className="flex-1 rounded-xl bg-neon py-2.5 text-center text-xs font-bold text-black"
            >
              Buy
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
