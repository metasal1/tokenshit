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
import { HOUR_PRODUCT } from "@/lib/hour-product";
import { sfx } from "@/lib/sfx";

/** Keep in sync with DAY_STAKE_AMOUNT in day-game (server). */
const PLAY_STAKE = 1_000;
const TIP_KEY = "tokenshit_play_tip_v2";

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

function fmtCountdown(ms: number) {
  if (ms <= 0) return "00:00";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(mm).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${String(mm).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
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
 * $HIT OF THE DAY — mobile-first game loop.
 * One idea: will this bag go UP (HIT) or DOWN (SHIT) this hour?
 */
export default function DayGamePanel({
  compactTitle: _compactTitle = false,
  dense: _dense = false,
}: {
  compactTitle?: boolean;
  dense?: boolean;
} = {}) {
  const { ready, authenticated, getAccessToken, user } = usePrivy();
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
  const [side, setSide] = useState<"hit" | "shit">("hit");
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [hitFlash, setHitFlash] = useState(false);
  const [shitFlash, setShitFlash] = useState(false);
  const [hitDelta, setHitDelta] = useState(0);
  const [shitDelta, setShitDelta] = useState(0);
  const [justPlayed, setJustPlayed] = useState(false);
  const prevPots = useRef<{ hit: number; shit: number } | null>(null);
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

  useEffect(() => {
    if (!justPlayed) return;
    const t = window.setTimeout(() => setJustPlayed(false), 2200);
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

  const myTotalTickets = useMemo(() => {
    let n = 0;
    for (const t of status?.myTickets || []) n += t.tickets;
    return n;
  }, [status?.myTickets]);

  const featured = useMemo(() => {
    const L = status?.leaders;
    const list: Major[] = [];
    const seen = new Set<string>();
    const push = (x: Leader | Major | null | undefined) => {
      if (!x || seen.has(x.assetId)) return;
      seen.add(x.assetId);
      list.push(toMajor(x));
    };
    if (side === "hit") {
      for (const x of L?.topHit || []) push(x);
      push(L?.hitting || null);
    } else {
      for (const x of L?.topShit || []) push(x);
      push(L?.shitting || null);
    }
    // fill from movers
    const rest = [...(status?.majors || [])].sort((a, b) => {
      const ap = a.pct;
      const bp = b.pct;
      if (ap == null && bp == null) return 0;
      if (ap == null) return 1;
      if (bp == null) return -1;
      return side === "hit" ? bp - ap : ap - bp;
    });
    for (const m of rest) {
      if (list.length >= 8) break;
      push(m);
    }
    return list;
  }, [status?.leaders, status?.majors, side]);

  const bags = useMemo(() => {
    const list = status?.majors || [];
    const s = q.trim().toLowerCase();
    if (s.length >= 2 && searchHits.length) {
      const byId = new Map(list.map((m) => [m.assetId, m]));
      return searchHits.map((h) => byId.get(h.assetId) || toMajor(h));
    }
    let out = [...list];
    if (s) {
      out = out.filter(
        (m) =>
          m.symbol.toLowerCase().includes(s) ||
          m.name.toLowerCase().includes(s) ||
          m.assetId.toLowerCase().includes(s)
      );
    } else {
      out.sort((a, b) => {
        const ap = a.pct;
        const bp = b.pct;
        if (ap == null && bp == null) return 0;
        if (ap == null) return 1;
        if (bp == null) return -1;
        return side === "hit" ? bp - ap : ap - bp;
      });
    }
    return out;
  }, [status?.majors, q, side, searchHits]);

  async function play(bag?: Major | SearchHit | null) {
    const pick = bag ? toMajor(bag) : selected;
    setErr(null);
    setMsg(null);
    setPhase(null);
    if (!authenticated) {
      safeLogin();
      return;
    }
    if (!wallet) {
      setErr("Link a Solana wallet to play");
      return;
    }
    if (!pick) {
      setErr("Pick a bag first");
      return;
    }
    setSelected(pick);
    recentRef.current = [
      pick,
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
      let solBal: number | null = null;
      try {
        const br = await fetch(
          `/api/wallet/balances?address=${encodeURIComponent(wallet)}`,
          { cache: "no-store" }
        );
        if (br.ok) {
          const bd = await br.json();
          solBal = Number(bd.sol);
        }
      } catch {
        /* */
      }

      setPhase("Building…");
      const rawTx = await fetchTransferTx(wallet);
      const txBytes = b64ToBytes(rawTx);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const walletObj =
        (wallets as any[])?.find((w) => w?.address === wallet) ||
        (wallets as any[])?.[0];
      if (!walletObj) throw new Error("No wallet object");

      const sideLabel = side === "hit" ? "UP" : "DOWN";
      const desc = `Play ${sideLabel} ${pick.symbol || pick.name} · 1,000 $${SHIT_SYMBOL}`;
      setPhase("Approve in wallet…");
      const signature = await sendWithPrivyFallback({
        txBytes,
        wallet: walletObj,
        signAndSendTransaction,
        signTransaction,
        description: desc,
        solBalance: solBal,
      });
      if (!signature) throw new Error("No signature from wallet");

      setPhase("Locking ticket…");
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
        `You're in · ${sideLabel} ${pick.symbol || pick.name} · ticket ×${tc}`
      );
      setPhase(null);
      setJustPlayed(true);
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

  function pickBag(m: Major | SearchHit | Leader) {
    const asMajor = toMajor(m);
    setSelected(asMajor);
    setErr(null);
    setMsg(null);
  }

  function dismissTip() {
    setShowTip(false);
    try {
      localStorage.setItem(TIP_KEY, "1");
    } catch {
      /* */
    }
  }

  if (!ready || !status) {
    return (
      <div className="flex h-40 items-center justify-center rounded-3xl border border-border bg-card">
        <div className="text-center">
          <EmojiIcon size={32} className="mx-auto animate-spin opacity-90">
            💫
          </EmojiIcon>
          <p className="mt-2 font-orbitron text-[10px] uppercase tracking-wider text-zinc-500">
            Loading round…
          </p>
        </div>
      </div>
    );
  }

  const hitPot = status.round?.hitPot || 0;
  const shitPot = status.round?.shitPot || 0;
  const L = status.leaders;
  const myOnSelected = selected ? myMap.get(selected.assetId) || 0 : 0;
  const sideLabel = side === "hit" ? "UP" : "DOWN";
  const potForSide = side === "hit" ? hitPot : shitPot;
  const ticketsForSide =
    side === "hit"
      ? status.stats?.hitTickets || 0
      : status.stats?.shitTickets || 0;

  const cta = busy
    ? phase || "Working…"
    : !authenticated
      ? "Login to play"
      : !selected
        ? "Pick a bag"
        : justPlayed
          ? `Play again · ${sideLabel}`
          : `Lock ${sideLabel} · ${selected.symbol || selected.name}`;

  return (
    <div className="flex h-full min-h-0 flex-col gap-0">
      {/* ═══ GAME HUD ═══ */}
      <div className="shrink-0 overflow-hidden rounded-t-3xl border border-b-0 border-neon/35 bg-[#0c0c12]">
        {/* Timer bar */}
        <div
          className={`flex items-center justify-between gap-3 px-4 py-3 ${
            urgent
              ? "bg-gradient-to-r from-amber-950/80 via-zinc-950 to-zinc-950"
              : "bg-gradient-to-b from-zinc-900/90 to-transparent"
          }`}
        >
          <div className="min-w-0">
            <p className="font-orbitron text-[10px] uppercase tracking-[0.22em] text-neon">
              This hour
            </p>
            <p className="truncate text-sm font-semibold text-zinc-200">
              Will it go{" "}
              <span className="text-green-400">up</span> or{" "}
              <span className="text-red-400">down</span>?
            </p>
          </div>
          <div
            className={`shrink-0 rounded-2xl border px-3.5 py-2 text-center ${
              urgent
                ? "border-amber-400/50 bg-amber-500/10"
                : "border-neon/40 bg-black/60"
            }`}
          >
            <div
              className={`font-orbitron text-[9px] uppercase tracking-wider ${
                urgent ? "text-amber-300" : "text-zinc-500"
              }`}
            >
              {urgent ? "Hurry" : "Ends in"}
            </div>
            <div
              className={`font-mono text-2xl font-black tabular-nums leading-none ${
                urgent ? "text-amber-300" : "text-neon"
              }`}
            >
              {countdown}
            </div>
          </div>
        </div>

        {/* Pots as scoreboard */}
        <div className="grid grid-cols-2 gap-0 border-t border-white/5">
          <button
            type="button"
            onClick={() => setSide("hit")}
            className={`cursor-hit relative px-4 py-3 text-left transition ${
              side === "hit"
                ? "bg-green-500/15"
                : "bg-green-950/20 opacity-80"
            } ${hitFlash ? "ring-inset ring-2 ring-green-400/60" : ""}`}
          >
            <div className="flex items-center gap-1.5 font-orbitron text-[10px] uppercase tracking-wider text-green-400">
              <EmojiIcon size={16}>🎯</EmojiIcon> UP pot
            </div>
            <div className="mt-0.5 font-mono text-2xl font-black tabular-nums text-green-300">
              {fmt(hitPot)}
            </div>
            <div className="text-[10px] text-zinc-500">
              {status.stats?.hitTickets || 0} tickets
              {status.stats?.hitPlayers
                ? ` · ${status.stats.hitPlayers} players`
                : ""}
            </div>
            {hitFlash && hitDelta > 0 && (
              <span className="absolute right-3 top-2 font-mono text-sm font-bold text-green-300">
                +{fmt(hitDelta)}
              </span>
            )}
            {side === "hit" && (
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-green-400" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setSide("shit")}
            className={`cursor-shit relative border-l border-white/5 px-4 py-3 text-right transition ${
              side === "shit"
                ? "bg-red-500/15"
                : "bg-red-950/20 opacity-80"
            } ${shitFlash ? "ring-inset ring-2 ring-red-400/60" : ""}`}
          >
            <div className="flex items-center justify-end gap-1.5 font-orbitron text-[10px] uppercase tracking-wider text-red-400">
              DOWN pot <EmojiIcon size={16}>💀</EmojiIcon>
            </div>
            <div className="mt-0.5 font-mono text-2xl font-black tabular-nums text-red-300">
              {fmt(shitPot)}
            </div>
            <div className="text-[10px] text-zinc-500">
              {status.stats?.shitTickets || 0} tickets
              {status.stats?.shitPlayers
                ? ` · ${status.stats.shitPlayers} players`
                : ""}
            </div>
            {shitFlash && shitDelta > 0 && (
              <span className="absolute left-3 top-2 font-mono text-sm font-bold text-red-300">
                +{fmt(shitDelta)}
              </span>
            )}
            {side === "shit" && (
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-red-400" />
            )}
          </button>
        </div>

        {/* If hour ended now */}
        {(L?.hitting || L?.shitting) && (
          <div className="flex items-center gap-2 border-t border-white/5 bg-black/40 px-3 py-2">
            <span className="shrink-0 font-orbitron text-[9px] uppercase tracking-wider text-zinc-500">
              Winning now
            </span>
            <div className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto no-scrollbar">
              {L?.hitting && (
                <button
                  type="button"
                  onClick={() => {
                    setSide("hit");
                    pickBag(L.hitting!);
                  }}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-green-800/50 bg-green-950/40 py-1 pl-1 pr-2.5"
                >
                  <TokenMark
                    logo={L.hitting.logo}
                    symbol={L.hitting.symbol}
                    size={22}
                  />
                  <span className="text-xs font-bold text-white">
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
                    setSide("shit");
                    pickBag(L.shitting!);
                  }}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-red-800/50 bg-red-950/40 py-1 pl-1 pr-2.5"
                >
                  <TokenMark
                    logo={L.shitting.logo}
                    symbol={L.shitting.symbol}
                    size={22}
                  />
                  <span className="text-xs font-bold text-white">
                    {L.shitting.symbol}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-red-400">
                    {fmtPct(L.shitting.pct)}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══ TIP ═══ */}
      {showTip && (
        <div className="shrink-0 border-x border-border bg-neon/10 px-3 py-2.5">
          <div className="flex items-start gap-2">
            <EmojiIcon size={20}>🎯</EmojiIcon>
            <div className="min-w-0 flex-1 text-[12px] leading-snug text-zinc-200">
              <strong className="text-neon">How to play:</strong> Pick{" "}
              <span className="text-green-400">UP</span> or{" "}
              <span className="text-red-400">DOWN</span>, tap a bag, lock a
              ticket for {PLAY_STAKE.toLocaleString()} ${SHIT_SYMBOL}. Best /
              worst bag of the hour splits the pot with everyone on it.
            </div>
            <button
              type="button"
              onClick={dismissTip}
              className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold text-neon"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ═══ SIDE TOGGLE ═══ */}
      <div className="shrink-0 border-x border-border bg-card px-3 py-2">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-zinc-950 p-1">
          <button
            type="button"
            onClick={() => setSide("hit")}
            className={`cursor-hit flex min-h-12 items-center justify-center gap-2 rounded-xl font-orbitron text-sm font-black tracking-wide transition ${
              side === "hit"
                ? "bg-green-500 text-black shadow-[0_0_24px_rgba(34,197,94,0.35)]"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <EmojiIcon size={18}>🎯</EmojiIcon> UP
          </button>
          <button
            type="button"
            onClick={() => setSide("shit")}
            className={`cursor-shit flex min-h-12 items-center justify-center gap-2 rounded-xl font-orbitron text-sm font-black tracking-wide transition ${
              side === "shit"
                ? "bg-red-500 text-white shadow-[0_0_24px_rgba(239,68,68,0.35)]"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <EmojiIcon size={18}>💀</EmojiIcon> DOWN
          </button>
        </div>
        <p className="mt-1.5 text-center text-[11px] text-zinc-500">
          {side === "hit" ? (
            <>
              You win if this bag is{" "}
              <span className="font-semibold text-green-400">#1 gainer</span>{" "}
              this hour
            </>
          ) : (
            <>
              You win if this bag is{" "}
              <span className="font-semibold text-red-400">#1 loser</span> this
              hour
            </>
          )}
          {" · "}
          pot {fmt(potForSide)} · {ticketsForSide} in
        </p>
      </div>

      {/* ═══ BAGS ═══ */}
      <div className="flex min-h-0 flex-1 flex-col border-x border-border bg-card">
        {/* Hot row */}
        {!q.trim() && featured.length > 0 && (
          <div className="shrink-0 border-b border-white/5 px-3 py-2">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="font-orbitron text-[10px] uppercase tracking-wider text-zinc-500">
                {side === "hit" ? "Hot to go UP" : "Hot to go DOWN"}
              </p>
              {myTotalTickets > 0 && (
                <span className="rounded-full bg-neon/15 px-2 py-0.5 font-mono text-[10px] font-bold text-neon">
                  you · {myTotalTickets} ticket{myTotalTickets === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {featured.map((m) => {
                const on = selected?.assetId === m.assetId;
                const mine = myMap.get(m.assetId) || 0;
                const pctKnown = m.pct != null && Number.isFinite(m.pct);
                const up = pctKnown && (m.pct as number) >= 0;
                return (
                  <button
                    key={`f-${m.assetId}`}
                    type="button"
                    onClick={() => pickBag(m)}
                    className={`relative flex w-[7.25rem] shrink-0 flex-col items-start gap-1 rounded-2xl border p-2.5 text-left transition active:scale-[0.98] ${
                      on
                        ? side === "hit"
                          ? "border-green-400 bg-green-950/70 ring-2 ring-green-400/40"
                          : "border-red-400 bg-red-950/70 ring-2 ring-red-400/40"
                        : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex w-full items-center gap-1.5">
                      <TokenMark logo={m.logo} symbol={m.symbol} size={32} />
                      <span className="truncate text-sm font-bold text-white">
                        {m.symbol || m.name}
                      </span>
                    </div>
                    <span
                      className={`font-mono text-lg font-black tabular-nums ${
                        !pctKnown
                          ? "text-zinc-600"
                          : up
                            ? "text-green-400"
                            : "text-red-400"
                      }`}
                    >
                      {fmtPct(m.pct)}
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
          </div>
        )}

        <div className="shrink-0 px-3 pt-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find any bag…"
            className="min-h-11 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-base text-white placeholder:text-zinc-600 focus:border-neon/40 focus:outline-none"
            enterKeyHint="search"
          />
        </div>

        <div
          className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2 ${
            side === "hit" ? "cursor-hit" : "cursor-shit"
          }`}
        >
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
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
                  disabled={busy}
                  onClick={() => pickBag(m)}
                  className={`relative flex flex-col items-center gap-1 rounded-2xl border p-2.5 transition active:scale-[0.97] disabled:opacity-50 ${
                    on
                      ? side === "hit"
                        ? "border-green-400 bg-green-950/65 ring-2 ring-green-400/35"
                        : "border-red-400 bg-red-950/65 ring-2 ring-red-400/35"
                      : "border-zinc-800/90 bg-zinc-950/90 hover:border-zinc-600"
                  }`}
                >
                  <TokenMark logo={m.logo} symbol={m.symbol} size={40} />
                  <span className="w-full truncate text-center text-xs font-bold text-zinc-100">
                    {m.symbol || m.name}
                  </span>
                  <span
                    className={`font-mono text-sm font-black tabular-nums ${
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
                    <span className="absolute -right-1 -top-1 rounded-full bg-neon px-1.5 font-mono text-[10px] font-bold leading-tight text-black">
                      ×{mine}
                    </span>
                  )}
                  {heat > 0 && !mine && (
                    <span className="absolute -left-0.5 -top-0.5 font-mono text-[9px] text-zinc-600">
                      {heat}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {!bags.length && (
            <div className="flex h-28 items-center justify-center text-sm text-zinc-600">
              {q.trim().length >= 2
                ? searching
                  ? "Searching…"
                  : "No match — try another ticker"
                : "No bags loaded"}
            </div>
          )}
        </div>
      </div>

      {/* ═══ STICKY PLAY DOCK ═══ */}
      <div
        className={`shrink-0 space-y-2 rounded-b-3xl border border-t-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 ${
          justPlayed
            ? "border-neon/50 bg-neon/10"
            : "border-neon/30 bg-[#0c0c12]"
        } shadow-[0_-16px_40px_rgba(0,0,0,0.55)]`}
      >
        {selected ? (
          <div className="flex items-center gap-3">
            <TokenMark
              logo={selected.logo}
              symbol={selected.symbol}
              size={44}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-base font-black text-white">
                  {selected.symbol || selected.name}
                </span>
                <span
                  className={`rounded-md px-1.5 py-0.5 font-orbitron text-[10px] font-bold uppercase ${
                    side === "hit"
                      ? "bg-green-500/20 text-green-300"
                      : "bg-red-500/20 text-red-300"
                  }`}
                >
                  {sideLabel}
                </span>
              </div>
              <p className="font-mono text-[11px] text-zinc-500">
                {fmtPct(selected.pct)} this hour
                {myOnSelected
                  ? ` · you already ×${myOnSelected}`
                  : " · first ticket"}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <div className="font-mono text-lg font-black text-neon">
                {PLAY_STAKE.toLocaleString()}
              </div>
              <div className="text-[10px] text-zinc-500">${SHIT_SYMBOL}</div>
            </div>
          </div>
        ) : (
          <p className="py-1 text-center text-sm text-zinc-400">
            Tap a bag — then lock your call
          </p>
        )}

        <div className="min-h-[1rem] text-center">
          {err && (
            <p className="text-[12px] font-medium text-red-400">{err}</p>
          )}
          {!err && msg && (
            <p className="text-[12px] font-bold text-neon">{msg}</p>
          )}
          {!err && !msg && phase && (
            <p className="inline-flex items-center gap-1.5 text-[12px] text-zinc-400">
              <EmojiIcon size={14} className="animate-spin">
                💫
              </EmojiIcon>
              {phase}
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={
            busy || !status.enabled || (authenticated && !selected)
          }
          onClick={() => void play()}
          className={`flex min-h-[3.5rem] w-full items-center justify-center gap-2 rounded-2xl font-orbitron text-base font-black uppercase tracking-wide transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 ${
            side === "hit"
              ? "cursor-hit bg-green-500 text-black shadow-[0_0_32px_rgba(34,197,94,0.4)]"
              : "cursor-shit bg-red-500 text-white shadow-[0_0_32px_rgba(239,68,68,0.4)]"
          }`}
        >
          {busy && (
            <EmojiIcon size={18} className="animate-spin" label="Loading">
              💫
            </EmojiIcon>
          )}
          {cta}
        </button>

        <p className="text-center font-mono text-[10px] text-zinc-600">
          Winners split the pot · 25% house ·{" "}
          <Link
            href={HOUR_PRODUCT.winnersPath}
            className="text-zinc-400 underline-offset-2 hover:text-neon hover:underline"
          >
            past winners
          </Link>
          {" · "}
          <a
            href={playPotPortfolioUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-amber-400"
            title={PLAY_POT_ADDRESS}
          >
            pot
          </a>
        </p>

        {err && /claim|buy|balance|Need/i.test(err) && (
          <div className="flex gap-2">
            <Link
              href="/claim"
              className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-center text-sm font-semibold text-zinc-200"
            >
              Claim free
            </Link>
            <Link
              href="/swap"
              className="flex-1 rounded-xl bg-neon/90 py-2.5 text-center text-sm font-bold text-black"
            >
              Buy ${SHIT_SYMBOL}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
