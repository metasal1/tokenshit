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
const TOAST_MS = 3200;
const TOAST_MS_SELF = 4200;
const POLL_MS = 18_000;

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
        ring: "border-sky-400/40",
        badge: "bg-sky-400 text-black",
      };
    case "x_tweet":
      return {
        emoji: "📣",
        label: "TWEET",
        accent: "text-neon",
        ring: "border-neon/40",
        badge: "bg-neon text-black",
      };
    case "x_verified":
      return {
        emoji: "✅",
        label: "VERIFIED",
        accent: "text-sky-200",
        ring: "border-sky-300/40",
        badge: "bg-sky-300 text-black",
      };
    case "x_premium":
      return {
        emoji: "💎",
        label: "PREMIUM",
        accent: "text-amber-300",
        ring: "border-amber-400/40",
        badge: "bg-amber-400 text-black",
      };
    case "gh_fork":
      return {
        emoji: "🍴",
        label: "GH FORK",
        accent: "text-violet-300",
        ring: "border-violet-400/40",
        badge: "bg-violet-400 text-black",
      };
    case "email_list":
      return {
        emoji: "📬",
        label: "LIST",
        accent: "text-[#fff8e7]",
        ring: "border-[#fff8e7]/35",
        badge: "bg-[#fff8e7] text-black",
      };
    case "day_hit":
    case "day_shit":
      return {
        emoji: kind === "day_hit" ? "🎯" : "💀",
        label: kind === "day_hit" ? "HIT POT" : "SHIT POT",
        accent: kind === "day_hit" ? "text-neon" : "text-red-300",
        ring: kind === "day_hit" ? "border-neon/45" : "border-red-400/40",
        badge: kind === "day_hit" ? "bg-neon text-black" : "bg-red-400 text-black",
      };
    default:
      return {
        emoji: "💸",
        label: "CLAIM",
        accent: "text-neon",
        ring: "border-neon/40",
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
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect fill="#0a0a0f" width="40" height="40"/><text x="20" y="26" text-anchor="middle" font-size="14" fill="#39ff14" font-family="monospace">$</text></svg>`
  );

/**
 * Compact claim toast — top-right pill, soft on mobile.
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
    }, 200);
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
    // SFX only for your own claim — others stay quiet
    if (next.self) {
      try {
        sfx.ding();
      } catch {
        /* optional */
      }
    }

    const duration = next.self ? TOAST_MS_SELF : TOAST_MS;
    const started = Date.now();
    progTimer.current = window.setInterval(() => {
      const p = Math.max(0, 100 - ((Date.now() - started) / duration) * 100);
      setProgress(p);
    }, 80);

    hideTimer.current = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(() => {
        setEvt(null);
        showing.current = false;
        clearTimers();
        showNext();
      }, 200);
    }, duration);
  }, []);

  const enqueue = useCallback(
    (e: ClaimToastEvent) => {
      if (!e?.id) return;
      if (!e.self && e.id <= readSeen()) return;
      if (queue.current.some((q) => q.id === e.id)) return;
      if (evt?.id === e.id) return;
      // Cap queue: drop older social toasts first
      queue.current.push(e);
      if (queue.current.length > 4) {
        const selfs = queue.current.filter((q) => q.self);
        const others = queue.current.filter((q) => !q.self).slice(-2);
        queue.current = [...selfs, ...others].slice(-4);
      }
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
        // Only enqueue newest 1–2 social events to avoid toast spam
        for (const e of fresh.slice(-2)) enqueue({ ...e, self: false });
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

  return (
    <div
      className={`claim-toast-wrap fixed z-[150] pointer-events-none transition-all duration-200 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-2"
      }`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`claim-toast-card pointer-events-auto relative overflow-hidden rounded-xl border bg-zinc-950/90 backdrop-blur-md ${meta.ring} ${
          evt.self ? "shadow-md" : "shadow-sm"
        }`}
      >
        <div className="flex items-center gap-2 px-2.5 py-2 sm:px-3 sm:py-2.5">
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={evt.avatarUrl || FALLBACK_AVATAR}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-full border border-white/15 object-cover bg-zinc-900"
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
              }}
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-zinc-950 text-[10px] ${meta.badge}`}
              title={meta.label}
            >
              <EmojiIcon size={10} className="leading-none">
                {meta.emoji}
              </EmojiIcon>
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className={`text-[9px] font-orbitron uppercase tracking-[0.14em] ${meta.accent}`}>
              {evt.self ? "You" : "Claim"} · {evt.kindLabel || meta.label}
            </p>
            <p className="mt-0.5 flex items-baseline gap-1.5 min-w-0">
              <span className="font-mono text-sm font-semibold text-neon tabular-nums">
                +{fmtAmt(evt.amount)}
              </span>
              <span className="text-[10px] text-zinc-500">${SHIT_SYMBOL}</span>
              <span className="truncate text-[11px] text-zinc-400">
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
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 -mr-0.5 text-zinc-500 hover:text-white text-sm leading-none px-1"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>

        {/* thin countdown */}
        <div className="h-0.5 w-full bg-zinc-900/80">
          <div
            className="h-full bg-neon/80 transition-[width] duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
