"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/sfx";
import { SHIT_SYMBOL } from "@/lib/shit-token";
import { EmojiIcon } from "@/components/EmojiIcon";

export type ClaimToastEvent = {
  id: number;
  kind: string;
  kindLabel: string;
  handle: string | null;
  twitter: string | null;
  github: string | null;
  amount: number;
  avatarUrl: string | null;
  createdAt: string;
  signature?: string | null;
  /** Fired from this tab's successful claim */
  self?: boolean;
};

const SEEN_KEY = "tokenshit_claim_toast_seen_v2";
const TOAST_MS = 5600;
const POLL_MS = 10_000;

function fmtAmt(n: number) {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function kindMeta(kind: string): {
  emoji: string;
  label: string;
  accent: string;
  ring: string;
  badge: string;
} {
  switch (kind) {
    case "x_follow":
      return {
        emoji: "👀",
        label: "FOLLOW",
        accent: "text-sky-300",
        ring: "border-sky-400/60 shadow-[0_0_32px_rgba(56,189,248,0.35)]",
        badge: "bg-sky-400 text-black",
      };
    case "x_tweet":
      return {
        emoji: "📣",
        label: "TWEET",
        accent: "text-neon",
        ring: "border-neon/60 shadow-[0_0_32px_rgba(57,255,20,0.35)]",
        badge: "bg-neon text-black",
      };
    case "x_verified":
      return {
        emoji: "✅",
        label: "VERIFIED",
        accent: "text-sky-200",
        ring: "border-sky-300/50 shadow-[0_0_28px_rgba(125,211,252,0.3)]",
        badge: "bg-sky-300 text-black",
      };
    case "x_premium":
      return {
        emoji: "💎",
        label: "PREMIUM",
        accent: "text-amber-300",
        ring: "border-amber-400/55 shadow-[0_0_32px_rgba(251,191,36,0.35)]",
        badge: "bg-amber-400 text-black",
      };
    case "gh_fork":
      return {
        emoji: "🍴",
        label: "GH FORK",
        accent: "text-violet-300",
        ring: "border-violet-400/55 shadow-[0_0_32px_rgba(167,139,250,0.35)]",
        badge: "bg-violet-400 text-black",
      };
    case "email_list":
      return {
        emoji: "📬",
        label: "LIST",
        accent: "text-[#fff8e7]",
        ring: "border-[#fff8e7]/40 shadow-[0_0_28px_rgba(255,248,231,0.2)]",
        badge: "bg-[#fff8e7] text-black",
      };
    case "day_hit":
    case "day_shit":
      return {
        emoji: kind === "day_hit" ? "🎯" : "💀",
        label: kind === "day_hit" ? "HIT POT" : "SHIT POT",
        accent: kind === "day_hit" ? "text-neon" : "text-red-300",
        ring:
          kind === "day_hit"
            ? "border-neon/60 shadow-[0_0_36px_rgba(57,255,20,0.4)]"
            : "border-red-400/55 shadow-[0_0_36px_rgba(248,113,113,0.35)]",
        badge: kind === "day_hit" ? "bg-neon text-black" : "bg-red-400 text-black",
      };
    default:
      return {
        emoji: "💸",
        label: "CLAIM",
        accent: "text-neon",
        ring: "border-neon/50 shadow-[0_0_28px_rgba(57,255,20,0.28)]",
        badge: "bg-neon text-black",
      };
  }
}

function readSeen(): number {
  try {
    return Number(sessionStorage.getItem(SEEN_KEY) || "0");
  } catch {
    return 0;
  }
}

function writeSeen(id: number) {
  try {
    sessionStorage.setItem(SEEN_KEY, String(id));
  } catch {
    /* ignore */
  }
}

const FALLBACK_AVATAR =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect fill="#0a0a0f" width="56" height="56"/><text x="28" y="36" text-anchor="middle" font-size="18" fill="#39ff14" font-family="monospace">$</text></svg>`
  );

/**
 * Top-right claim toast — brand, kind-colored, amount-forward.
 * Polls /api/claim/recent + local tokenshit:claim.
 */
export default function ClaimGlitchToast() {
  const [evt, setEvt] = useState<ClaimToastEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const hideTimer = useRef<number | null>(null);
  const progTimer = useRef<number | null>(null);
  const queue = useRef<ClaimToastEvent[]>([]);
  const showing = useRef(false);

  const clearTimers = () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    if (progTimer.current) window.clearInterval(progTimer.current);
    hideTimer.current = null;
    progTimer.current = null;
  };

  const dismiss = useCallback(() => {
    clearTimers();
    setVisible(false);
    window.setTimeout(() => {
      setEvt(null);
      showing.current = false;
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      showNext();
    }, 260);
  }, []);

  const showNext = useCallback(() => {
    if (showing.current) return;
    const next = queue.current.shift();
    if (!next) return;
    showing.current = true;
    setEvt(next);
    setVisible(true);
    setProgress(100);
    writeSeen(Math.max(readSeen(), next.id));
    try {
      if (next.self) {
        sfx.ding();
      } else {
        try {
          // optional softer chime if present
          (sfx as { chime?: () => void }).chime?.();
        } catch {
          sfx.ding();
        }
      }
    } catch {
      /* optional */
    }

    const started = Date.now();
    progTimer.current = window.setInterval(() => {
      const p = Math.max(0, 100 - ((Date.now() - started) / TOAST_MS) * 100);
      setProgress(p);
    }, 50);

    hideTimer.current = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(() => {
        setEvt(null);
        showing.current = false;
        clearTimers();
        showNext();
      }, 260);
    }, TOAST_MS);
  }, []);

  const enqueue = useCallback(
    (e: ClaimToastEvent) => {
      if (!e?.id) return;
      // Local self claims always show even if poll id is timestamp
      if (!e.self && e.id <= readSeen()) return;
      if (queue.current.some((q) => q.id === e.id)) return;
      if (evt?.id === e.id) return;
      queue.current.push(e);
      if (queue.current.length > 10) queue.current = queue.current.slice(-10);
      showNext();
    },
    [evt?.id, showNext]
  );

  useEffect(() => {
    let alive = true;

    const poll = async () => {
      try {
        const r = await fetch("/api/claim/recent", { cache: "no-store" });
        const d = await r.json();
        if (!alive || !Array.isArray(d.events)) return;
        const seen = readSeen();
        const fresh = (d.events as ClaimToastEvent[])
          .filter((e) => e.id > seen)
          .sort((a, b) => a.id - b.id);
        if (seen === 0 && d.events[0]?.id) {
          writeSeen(Number(d.events[0].id));
          return;
        }
        for (const e of fresh) enqueue({ ...e, self: false });
      } catch {
        /* ignore */
      }
    };

    void poll();
    const t = window.setInterval(() => void poll(), POLL_MS);

    const onLocal = (ev: Event) => {
      const detail = (ev as CustomEvent<ClaimToastEvent>).detail;
      if (detail) enqueue({ ...detail, self: true });
    };
    window.addEventListener("tokenshit:claim", onLocal);

    return () => {
      alive = false;
      window.clearInterval(t);
      window.removeEventListener("tokenshit:claim", onLocal);
      clearTimers();
    };
  }, [enqueue]);

  if (!evt) return null;

  const meta = kindMeta(evt.kind);
  const displayRaw =
    evt.handle ||
    (evt.twitter ? evt.twitter : null) ||
    (evt.github ? `gh/${evt.github}` : "anon");
  const display = String(displayRaw).replace(/^@/, "");
  const isGh = display.startsWith("gh/") || Boolean(evt.github && !evt.twitter);
  const xHref = evt.twitter
    ? `https://x.com/${evt.twitter.replace(/^@/, "")}`
    : evt.github
      ? `https://github.com/${evt.github}`
      : null;
  const solscan = evt.signature
    ? `https://solscan.io/tx/${evt.signature}`
    : null;

  return (
    <div
      className={`fixed z-[150] top-[max(4.75rem,env(safe-area-inset-top))] left-3 right-3 sm:left-auto sm:right-4 sm:w-[380px] transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-3 pointer-events-none"
      }`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`claim-toast-card relative overflow-hidden rounded-2xl border-2 bg-zinc-950/95 backdrop-blur-xl ${meta.ring}`}
      >
        {/* scanlines */}
        <div className="claim-toast-scan pointer-events-none absolute inset-0" />

        {/* top row */}
        <div className="relative flex items-start gap-3 px-3.5 pt-3.5 pb-2">
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={evt.avatarUrl || FALLBACK_AVATAR}
              alt=""
              width={56}
              height={56}
              className="h-14 w-14 rounded-full border-2 border-white/20 object-cover bg-zinc-900"
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
              }}
            />
            <span
              className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-950 text-[13px] ${meta.badge}`}
              title={meta.label}
            >
              <EmojiIcon size={14} className="leading-none">
                {meta.emoji}
              </EmojiIcon>
            </span>
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className={`text-[10px] font-orbitron uppercase tracking-[0.18em] ${meta.accent} claim-toast-title`}
              >
                {evt.self ? "You claimed" : "Claim landed"}
              </p>
              {evt.self && (
                <span className="text-[9px] font-orbitron uppercase tracking-wider rounded px-1.5 py-0.5 bg-neon text-black font-bold">
                  you
                </span>
              )}
            </div>

            <p className="mt-0.5 text-base font-semibold text-white truncate">
              {xHref ? (
                <a
                  href={xHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neon"
                >
                  {isGh ? display : `@${display}`}
                </a>
              ) : (
                <span>{isGh ? display : `@${display}`}</span>
              )}
            </p>

            <p className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-monoton text-2xl leading-none text-neon drop-shadow-[0_0_12px_rgba(57,255,20,0.55)]">
                +{fmtAmt(evt.amount)}
              </span>
              <span className="text-xs font-orbitron uppercase tracking-wider text-zinc-400">
                ${SHIT_SYMBOL}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                · {evt.kindLabel || meta.label}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded-lg border border-zinc-700/80 px-2 py-1 text-[10px] font-orbitron uppercase tracking-wider text-zinc-400 hover:border-zinc-500 hover:text-white"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>

        {/* actions */}
        <div className="relative flex gap-2 px-3.5 pb-3">
          <a
            href="/claim"
            className="min-h-9 flex-1 inline-flex items-center justify-center rounded-lg bg-neon/15 border border-neon/40 text-[11px] font-orbitron uppercase tracking-wider text-neon hover:bg-neon/25"
          >
            Claim
          </a>
          {solscan && (
            <a
              href={solscan}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-9 flex-1 inline-flex items-center justify-center rounded-lg border border-zinc-600 text-[11px] font-orbitron uppercase tracking-wider text-zinc-300 hover:border-zinc-400 hover:text-white"
            >
              Tx
            </a>
          )}
          <a
            href="/play"
            className="min-h-9 flex-1 inline-flex items-center justify-center rounded-lg border border-zinc-600 text-[11px] font-orbitron uppercase tracking-wider text-zinc-300 hover:border-neon/40 hover:text-neon"
          >
            Play
          </a>
        </div>

        {/* countdown bar */}
        <div className="h-1 w-full bg-zinc-900">
          <div
            className="h-full bg-neon transition-[width] duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
