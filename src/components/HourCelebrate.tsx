"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EmojiIcon } from "@/components/EmojiIcon";
import { SHIT_SYMBOL } from "@/lib/shit-token";
import type { VrfRecord } from "@/lib/day-vrf-links";
import VrfProofLinks from "@/components/VrfProofLinks";

export type HourSettlePayload = {
  utcHour: string;
  hourLabel?: string;
  hit: {
    assetId: string | null;
    symbol: string;
    name: string;
    logo: string;
    pct: number | null;
    winner: string | null;
    prize: number | null;
    fee: number | null;
    sig: string | null;
    vrf?: VrfRecord | null;
  };
  shit: {
    assetId: string | null;
    symbol: string;
    name: string;
    logo: string;
    pct: number | null;
    winner: string | null;
    prize: number | null;
    fee: number | null;
    sig: string | null;
    vrf?: VrfRecord | null;
  };
};

function shortAddr(w: string | null) {
  if (!w) return "Treasury";
  if (w.length < 12) return w;
  return `${w.slice(0, 4)}…${w.slice(-4)}`;
}

function fmtPct(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function fmtAmt(n: number | null) {
  if (n == null) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/** Noto confetti rain — HIT then SHIT packs */
function EmojiRain({ pack }: { pack: "hit" | "shit" | "both" }) {
  const parts = useMemo(() => {
    const pool =
      pack === "hit"
        ? ["🎯", "✨", "🟩", "🎯"]
        : pack === "shit"
          ? ["💀", "💩", "🗑️", "💀"]
          : ["🎯", "💀", "✨", "💩", "🟩"];
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.55,
      size: 16 + Math.random() * 24,
      duration: 1.2 + Math.random() * 1.5,
      spin: (Math.random() > 0.5 ? 1 : -1) * (160 + Math.random() * 300),
      char: pool[Math.floor(Math.random() * pool.length)]!,
    }));
  }, [pack]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden z-0"
      aria-hidden
    >
      {parts.map((p) => (
        <div
          key={p.id}
          className="emoji"
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-48px",
            fontSize: `${p.size}px`,
            animation: `hourfall ${p.duration}s ease-in ${p.delay}s forwards`,
            ["--spin" as string]: `${p.spin}deg`,
          }}
        >
          {p.char}
        </div>
      ))}
      <style>{`
        @keyframes hourfall {
          0% { transform: translateY(0) rotate(0deg) scale(0.5); opacity: 0; }
          10% { opacity: 1; transform: translateY(6vh) rotate(calc(var(--spin) * 0.12)) scale(1); }
          80% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(var(--spin)); opacity: 0; }
        }
        @keyframes hourpop {
          0% { transform: scale(0.4); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes hourglow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(57,255,20,0.35)); }
          50% { filter: drop-shadow(0 0 22px rgba(57,255,20,0.7)); }
        }
      `}</style>
    </div>
  );
}

function WinnerBlock({
  kind,
  data,
  showWallet,
}: {
  kind: "hit" | "shit";
  data: HourSettlePayload["hit"];
  showWallet: boolean;
}) {
  const hit = kind === "hit";
  return (
    <div
      className={`rounded-2xl border p-4 space-y-2 ${
        hit
          ? "border-green-500/50 bg-green-950/50"
          : "border-red-500/50 bg-red-950/50"
      }`}
      style={{ animation: "hourpop 0.55s ease-out both" }}
    >
      <div
        className={`text-[11px] uppercase font-bold tracking-wide flex items-center gap-1.5 ${
          hit ? "text-green-400" : "text-red-400"
        }`}
      >
        <EmojiIcon size={18}>{hit ? "🎯" : "💀"}</EmojiIcon>
        {hit ? "HIT of the hour" : "SHIT of the hour"}
      </div>
      <div className="flex items-center gap-3">
        {data.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.logo}
            alt=""
            className="h-12 w-12 rounded-full bg-zinc-900 ring-2 ring-white/10"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-zinc-900" />
        )}
        <div className="min-w-0 flex-1">
          <div className="text-lg font-bold text-white truncate">
            {data.symbol || data.name || "—"}
          </div>
          <div className="text-xs text-zinc-500 truncate">{data.name}</div>
        </div>
        <div
          className={`text-right font-mono font-bold text-base ${
            hit ? "text-green-400" : "text-red-400"
          }`}
        >
          {fmtPct(data.pct)}
        </div>
      </div>
      {showWallet && (
        <div
          className="pt-2 border-t border-white/10 space-y-1.5"
          style={{ animation: "hourpop 0.45s ease-out 0.15s both" }}
        >
          <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-orbitron">
            Prize distribution
          </div>
          <div className="font-mono text-sm text-neon break-all">
            {data.winner ? data.winner : "→ house / empty pot"}
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs">
            <span className="text-zinc-400">Winner</span>
            <span className="text-white font-mono font-bold">
              {fmtAmt(data.prize)} ${SHIT_SYMBOL}
            </span>
            {data.fee != null && data.fee > 0 && (
              <>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-500">house</span>
                <span className="text-zinc-300 font-mono">{fmtAmt(data.fee)}</span>
              </>
            )}
          </div>
          {data.sig ? (
            <a
              href={`https://solscan.io/tx/${data.sig}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-neon-blue hover:underline font-mono"
            >
              on-chain payout {data.sig.slice(0, 10)}… →
            </a>
          ) : (
            <p className="text-[11px] text-zinc-600">No winner payout this side</p>
          )}
          {data.vrf && (
            <VrfProofLinks vrf={data.vrf} className="pt-1" />
          )}
        </div>
      )}
    </div>
  );
}

type Phase =
  | "curtain"
  | "hit_bag"
  | "hit_wallet"
  | "shit_bag"
  | "shit_wallet"
  | "done";

/**
 * End-of-hour celebration: staged reveal of HIT + SHIT bags and wallet winners.
 * Mounted sitewide so every visitor witnesses finalize + prize distribution.
 */
export default function HourCelebrate({
  payload,
  onClose,
}: {
  payload: HourSettlePayload;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("curtain");
  const [rain, setRain] = useState<"hit" | "shit" | "both" | null>("both");

  useEffect(() => {
    const steps: { p: Phase; t: number; rain?: typeof rain }[] = [
      { p: "curtain", t: 0, rain: "both" },
      { p: "hit_bag", t: 900, rain: "hit" },
      { p: "hit_wallet", t: 2200, rain: "hit" },
      { p: "shit_bag", t: 3800, rain: "shit" },
      { p: "shit_wallet", t: 5200, rain: "shit" },
      { p: "done", t: 6800, rain: "both" },
    ];
    const timers = steps.map(({ p, t, rain: r }) =>
      window.setTimeout(() => {
        setPhase(p);
        if (r) setRain(r);
      }, t)
    );
    try {
      if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
    } catch {
      /* ignore */
    }
    return () => timers.forEach(clearTimeout);
  }, []);

  const showHit = phase !== "curtain";
  const showHitW = phase === "hit_wallet" || phase === "shit_bag" || phase === "shit_wallet" || phase === "done";
  const showShit = phase === "shit_bag" || phase === "shit_wallet" || phase === "done";
  const showShitW = phase === "shit_wallet" || phase === "done";

  const tweetText = useMemo(() => {
    const h = payload.hit.symbol || "HIT";
    const s = payload.shit.symbol || "SHIT";
    return `Hour settled on @Tokenshit_\n🎯 HIT: $${h} ${fmtPct(payload.hit.pct)} → ${shortAddr(payload.hit.winner)}\n💀 SHIT: $${s} ${fmtPct(payload.shit.pct)} → ${shortAddr(payload.shit.winner)}\nhttps://tokenshit.com`;
  }, [payload]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal
      aria-label="Hour results"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      {rain && <EmojiRain pack={rain} />}

      <div
        className="relative z-10 w-full max-w-md rounded-2xl border border-neon/40 bg-[#0a0a0f]/95 shadow-[0_0_60px_rgba(57,255,20,0.15)] p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        style={{ animation: "hourpop 0.4s ease-out both" }}
      >
        <div className="text-center space-y-1">
          <div
            className="inline-flex items-center justify-center gap-2"
            style={{ animation: "hourglow 1.6s ease-in-out infinite" }}
          >
            <EmojiIcon size={28}>🎯</EmojiIcon>
            <EmojiIcon size={28}>💀</EmojiIcon>
          </div>
          <h2 className="text-xl font-bold text-white">Public finalize</h2>
          <p className="text-xs text-zinc-500 font-mono">
            {payload.hourLabel || payload.utcHour}
          </p>
          <p className="text-[11px] text-zinc-500">
            Bags → VRF winner → on-chain prize · everyone watches
          </p>
        </div>

        {phase === "curtain" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <EmojiIcon size={40} className="animate-spin" label="Revealing">
              💫
            </EmojiIcon>
            <p className="text-sm text-zinc-400">Finalizing · distributing prizes…</p>
          </div>
        )}

        <div className="space-y-3">
          {showHit && (
            <WinnerBlock kind="hit" data={payload.hit} showWallet={showHitW} />
          )}
          {showShit && (
            <WinnerBlock kind="shit" data={payload.shit} showWallet={showShitW} />
          )}
        </div>

        {(phase === "done" || showShitW) && (
          <div className="flex flex-col gap-2 pt-1">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-11 rounded-xl bg-neon text-black font-bold text-sm inline-flex items-center justify-center hover:brightness-110"
            >
              Brag on X
            </a>
            <Link
              href={`/play/${encodeURIComponent(payload.utcHour)}`}
              className="w-full min-h-10 rounded-xl border border-border text-zinc-300 text-sm inline-flex items-center justify-center hover:bg-zinc-900"
              onClick={onClose}
            >
              Full receipt
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-10 text-sm text-zinc-500 hover:text-white"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const LS_KEY = "tokenshit_hour_celebrate_v1";

function seenKey(hour: string) {
  return `${LS_KEY}:${hour}`;
}

export function markHourCelebrated(hour: string) {
  try {
    localStorage.setItem(seenKey(hour), "1");
  } catch {
    /* ignore */
  }
}

export function wasHourCelebrated(hour: string) {
  try {
    return localStorage.getItem(seenKey(hour)) === "1";
  } catch {
    return false;
  }
}

/** Map /api/day/prev JSON → celebration payload */
export function settleToPayload(data: {
  utcDay?: string;
  utcHour?: string;
  hourLabel?: string;
  round?: Record<string, unknown> | null;
  hitMeta?: { name?: string; symbol?: string; logo?: string } | null;
  shitMeta?: { name?: string; symbol?: string; logo?: string } | null;
  hitVrf?: VrfRecord | null;
  shitVrf?: VrfRecord | null;
  meta?: { hitVrf?: VrfRecord; shitVrf?: VrfRecord } | null;
}): HourSettlePayload | null {
  const r = data.round;
  if (!r || String(r.status) !== "settled") return null;
  const hour = String(data.utcHour || data.utcDay || "");
  if (!hour) return null;
  if (!data.hitVrf && data.meta?.hitVrf) data.hitVrf = data.meta.hitVrf;
  if (!data.shitVrf && data.meta?.shitVrf) data.shitVrf = data.meta.shitVrf;
  return {
    utcHour: hour,
    hourLabel: data.hourLabel,
    hit: {
      assetId: r.hitAssetId ? String(r.hitAssetId) : null,
      symbol: String(data.hitMeta?.symbol || r.hitAssetId || ""),
      name: String(data.hitMeta?.name || ""),
      logo: String(data.hitMeta?.logo || ""),
      pct: r.hitPct != null ? Number(r.hitPct) : null,
      winner: r.hitWinner ? String(r.hitWinner) : null,
      prize: r.hitPrize != null ? Number(r.hitPrize) : null,
      fee: r.hitFee != null ? Number(r.hitFee) : null,
      sig: r.hitSig ? String(r.hitSig) : null,
      vrf: (data.hitVrf as VrfRecord) || null,
    },
    shit: {
      assetId: r.shitAssetId ? String(r.shitAssetId) : null,
      symbol: String(data.shitMeta?.symbol || r.shitAssetId || ""),
      name: String(data.shitMeta?.name || ""),
      logo: String(data.shitMeta?.logo || ""),
      pct: r.shitPct != null ? Number(r.shitPct) : null,
      winner: r.shitWinner ? String(r.shitWinner) : null,
      prize: r.shitPrize != null ? Number(r.shitPrize) : null,
      fee: r.shitFee != null ? Number(r.shitFee) : null,
      sig: r.shitSig ? String(r.shitSig) : null,
      vrf: (data.shitVrf as VrfRecord) || null,
    },
  };
}

/**
 * Watches hour close → polls prev settle → opens celebration once.
 */
export function useHourCelebrate(opts: {
  nextCloseAt?: string | null;
  currentHour?: string | null;
  enabled?: boolean;
}) {
  const [payload, setPayload] = useState<HourSettlePayload | null>(null);
  const [waiting, setWaiting] = useState(false);

  const tryFetch = useCallback(async (closedHour: string) => {
    if (wasHourCelebrated(closedHour)) return null;
    const res = await fetch(`/api/day/${encodeURIComponent(closedHour)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return settleToPayload(data);
  }, []);

  useEffect(() => {
    if (opts.enabled === false) return;
    // On mount: if previous hour settled and not seen, celebrate
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/day/prev", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const p = settleToPayload(data);
        if (!p || cancelled) return;
        if (wasHourCelebrated(p.utcHour)) return;
        // Only auto-show if settled recently (within ~50 min of hour end — full next hour window)
        const endMs = Date.parse(
          p.utcHour.includes("T")
            ? p.utcHour + ":00:00.000Z"
            : p.utcHour + "T00:00:00.000Z"
        );
        const hourEnd = endMs + 60 * 60 * 1000;
        if (Date.now() - hourEnd > 50 * 60 * 1000) {
          markHourCelebrated(p.utcHour);
          return;
        }
        setPayload(p);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (opts.enabled === false || !opts.nextCloseAt) return;
    const closeAt = Date.parse(opts.nextCloseAt);
    if (!Number.isFinite(closeAt)) return;

    const ms = closeAt - Date.now();
    if (ms > 2 * 60 * 60 * 1000) return;

    // Capture the hour that is about to end (not the next one after rollover)
    const closingHour =
      opts.currentHour ||
      new Date(closeAt - 60_000).toISOString().slice(0, 13);

    const startWait = Math.max(0, ms + 1500); // slight delay past :00 for cron
    const t = window.setTimeout(() => {
      setWaiting(true);
      let tries = 0;
      const poll = window.setInterval(async () => {
        tries += 1;
        try {
          const p = await tryFetch(closingHour);
          if (p) {
            setPayload(p);
            setWaiting(false);
            clearInterval(poll);
            return;
          }
          // also try "prev" alias
          const res = await fetch("/api/day/prev", { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            const p2 = settleToPayload(data);
            if (p2 && !wasHourCelebrated(p2.utcHour)) {
              setPayload(p2);
              setWaiting(false);
              clearInterval(poll);
              return;
            }
          }
        } catch {
          /* retry */
        }
        if (tries >= 30) {
          setWaiting(false);
          clearInterval(poll);
          try {
            window.dispatchEvent(
              new CustomEvent("tokenshit:settle-timeout", {
                detail: { hour: closingHour },
              })
            );
          } catch {
            /* */
          }
        }
      }, 4000);
    }, startWait);

    return () => clearTimeout(t);
  }, [opts.nextCloseAt, opts.currentHour, opts.enabled, tryFetch]);

  const dismiss = useCallback(() => {
    if (payload) markHourCelebrated(payload.utcHour);
    setPayload(null);
    setWaiting(false);
  }, [payload]);

  return { payload, waiting, dismiss, setPayload };
}
