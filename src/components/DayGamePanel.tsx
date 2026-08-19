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
import { isMuted, sfx, toggleMuted } from "@/lib/sfx";

const PLAY_STAKE = 1_000;
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
  const mm = m % 60;
  const sec = s % 60;
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
  const [soundOn, setSoundOn] = useState(true);
  const [justPlayed, setJustPlayed] = useState(false);
  const prevPots = useRef<{ hit: number; shit: number } | null>(null);
  const lastBagTap = useRef<{ id: string; t: number } | null>(null);

  const load = useCallback(() => {
    const w = wallet ? `?wallet=${encodeURIComponent(wallet)}` : "";
    fetch(`/api/day${w}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setStatus(d))
      .catch(() => {});
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

  const myTotal = useMemo(() => {
    let n = 0;
    for (const t of status?.myTickets || []) n += t.tickets;
    return n;
  }, [status?.myTickets]);

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
    sfx.unlock();
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
      sfx.error();
      return;
    }
    if (!pick) {
      setErr("Pick a bag first");
      sfx.error();
      return;
    }
    setSelected(pick);
    setBusy(true);
    try {
      setPhase("Checking…");
      let have: number | null = null;
      let solBal: number | null = null;
      try {
        const br = await fetch(
          `/api/wallet/balances?address=${encodeURIComponent(wallet)}`,
          { cache: "no-store" }
        );
        if (br.ok) {
          const bd = await br.json();
          const n = Number(bd.shit ?? bd.tokenshit ?? bd.balance);
          have = Number.isFinite(n) ? n : null;
          const s = Number(bd.sol);
          solBal = Number.isFinite(s) ? s : null;
        }
      } catch {
        /* */
      }
      if (have != null && have < PLAY_STAKE) {
        throw new Error(
          `Need ${PLAY_STAKE.toLocaleString()} $${SHIT_SYMBOL} (have ${have.toLocaleString(undefined, { maximumFractionDigits: 0 })}).`
        );
      }
      if (solBal != null && solBal < 0.002) {
        throw new Error(
          `Need ~0.01 SOL for fees (have ${solBal.toFixed(4)}). Add SOL on Buy.`
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

      const sideLabel = side === "hit" ? "UP" : "DOWN";
      setPhase("Approve…");
      sfx.tap();
      const signature = await sendWithPrivyFallback({
        txBytes,
        wallet: walletObj,
        signAndSendTransaction,
        signTransaction,
        description: `Play ${sideLabel} ${pick.symbol || pick.name} · 1,000 $${SHIT_SYMBOL}`,
        solBalance: solBal,
      });
      if (!signature) throw new Error("No signature");

      setPhase("Locking ticket…");
      // Retry register — chain may lag "confirmed"
      let data: Record<string, unknown> | null = null;
      let lastErr = "";
      for (let attempt = 0; attempt < 5; attempt++) {
        if (attempt) await new Promise((r) => setTimeout(r, 700 * attempt));
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
        data = await res.json();
        if (res.ok) break;
        lastErr = String((data as { error?: string })?.error || "Play failed");
        if (!/not found|retry|confirm/i.test(lastErr)) break;
      }
      if (!data || (data as { error?: string }).error) {
        throw new Error(
          lastErr ||
            "Paid on-chain but ticket not registered — tap Lock again in a few seconds (won't double-charge if sig already used)."
        );
      }
      const tc = Number((data as { ticketCount?: number }).ticketCount || 1);
      setMsg(`Locked · ${sideLabel} ${pick.symbol || pick.name} · ×${tc}`);
      setPhase(null);
      setJustPlayed(true);
      sfx.lock();
      if (side === "hit") sfx.hit();
      else sfx.shit();
      load();
    } catch (e) {
      setPhase(null);
      setErr(friendlySolanaSendError(e));
      sfx.error();
    } finally {
      setBusy(false);
    }
  }

  function pickBag(m: Major | SearchHit | Leader) {
    sfx.unlock();
    sfx.tap();
    const bag = toMajor(m);
    setSelected(bag);
    setErr(null);
    setMsg(null);

    // Double-tap / double-click within 380ms → play immediately
    const now = Date.now();
    const prev = lastBagTap.current;
    if (prev && prev.id === bag.assetId && now - prev.t < 380) {
      lastBagTap.current = null;
      void play(bag);
      return;
    }
    lastBagTap.current = { id: bag.assetId, t: now };
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

  if (!ready || !status) {
    return (
      <div className="flex h-36 items-center justify-center rounded-3xl border border-border bg-card">
        <EmojiIcon size={28} className="animate-spin opacity-90">
          💫
        </EmojiIcon>
      </div>
    );
  }

  const hitPot = status.round?.hitPot || 0;
  const shitPot = status.round?.shitPot || 0;
  const L = status.leaders;
  const myOnSelected = selected ? myMap.get(selected.assetId) || 0 : 0;
  const sideLabel = side === "hit" ? "UP" : "DOWN";
  const potForSide = side === "hit" ? hitPot : shitPot;

  const cta = busy
    ? phase || "Working…"
    : !authenticated
      ? "Login to play"
      : !selected
        ? "Pick a bag"
        : justPlayed
          ? `Again · ${sideLabel}`
          : `Lock ${sideLabel} · ${selected.symbol || selected.name}`;

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
            <b className="text-neon">Play:</b> UP or DOWN → tap bag → Lock.{" "}
            {PLAY_STAKE.toLocaleString()} ${SHIT_SYMBOL}/ticket · winners split
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
              const on = selected?.assetId === m.assetId;
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
                  title="Double-tap to play"
                  className={`relative flex flex-col items-center gap-0.5 rounded-2xl border p-2 transition active:scale-[0.97] disabled:opacity-50 ${
                    on
                      ? side === "hit"
                        ? "border-green-400 bg-green-950/70 ring-2 ring-green-400/40"
                        : "border-red-400 bg-red-950/70 ring-2 ring-red-400/40"
                      : "border-zinc-800 bg-zinc-950/90 hover:border-zinc-600"
                  }`}
                >
                  <TokenMark logo={m.logo} symbol={m.symbol} size={36} />
                  <span className="w-full truncate text-center text-[11px] font-bold text-zinc-100">
                    {m.symbol || m.name}
                  </span>
                  <span
                    className={`font-mono text-xs font-black tabular-nums ${
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
                <span className="font-mono text-[11px] text-zinc-500">
                  {fmtPct(selected.pct)}
                </span>
              </div>
              <p className="font-mono text-[10px] text-zinc-600">
                {PLAY_STAKE.toLocaleString()} ${SHIT_SYMBOL}
                {myOnSelected ? ` · you ×${myOnSelected}` : ""}
                {" · pot "}
                {fmt(potForSide)}
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

        <button
          type="button"
          disabled={busy || !status.enabled || (authenticated && !selected)}
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
          Split pot · 25% house ·{" "}
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

        {err && /claim|buy|balance|Need|SOL/i.test(err) && (
          <div className="flex gap-2">
            <Link
              href="/claim"
              className="flex-1 rounded-xl border border-zinc-700 py-2 text-center text-xs text-zinc-300"
            >
              Claim
            </Link>
            <Link
              href="/swap"
              className="flex-1 rounded-xl bg-neon py-2 text-center text-xs font-bold text-black"
            >
              Buy
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
