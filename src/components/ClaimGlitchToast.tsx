"use client";

import { useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/sfx";
import { SHIT_SYMBOL } from "@/lib/shit-token";

type ClaimEvent = {
  id: number;
  kind: string;
  kindLabel: string;
  handle: string | null;
  twitter: string | null;
  github: string | null;
  amount: number;
  avatarUrl: string | null;
  createdAt: string;
};

const SEEN_KEY = "tokenshit_claim_toast_seen";
const TOAST_MS = 4800;
const POLL_MS = 12_000;

function fmtAmt(n: number) {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
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

/**
 * Top-right glitch toast when someone claims $TOKENSHIT.
 * Polls /api/claim/recent + local claim success event.
 */
export default function ClaimGlitchToast() {
  const [evt, setEvt] = useState<ClaimEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<number | null>(null);
  const queue = useRef<ClaimEvent[]>([]);
  const showing = useRef(false);

  const showNext = () => {
    if (showing.current) return;
    const next = queue.current.shift();
    if (!next) return;
    showing.current = true;
    setEvt(next);
    setVisible(true);
    writeSeen(Math.max(readSeen(), next.id));
    try {
      sfx.ding();
    } catch {
      /* optional */
    }
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(() => {
        setEvt(null);
        showing.current = false;
        showNext();
      }, 280);
    }, TOAST_MS);
  };

  const enqueue = (e: ClaimEvent) => {
    if (!e?.id) return;
    if (e.id <= readSeen()) return;
    if (queue.current.some((q) => q.id === e.id)) return;
    if (evt?.id === e.id) return;
    queue.current.push(e);
    // keep queue short
    if (queue.current.length > 8) queue.current = queue.current.slice(-8);
    showNext();
  };

  useEffect(() => {
    let alive = true;

    const poll = async () => {
      try {
        const r = await fetch("/api/claim/recent", { cache: "no-store" });
        const d = await r.json();
        if (!alive || !Array.isArray(d.events)) return;
        const seen = readSeen();
        const fresh = (d.events as ClaimEvent[])
          .filter((e) => e.id > seen)
          .sort((a, b) => a.id - b.id);
        // first visit: seed seen so we don't toast history
        if (seen === 0 && d.events[0]?.id) {
          writeSeen(Number(d.events[0].id));
          return;
        }
        for (const e of fresh) enqueue(e);
      } catch {
        /* ignore */
      }
    };

    void poll();
    const t = window.setInterval(() => void poll(), POLL_MS);

    const onLocal = (ev: Event) => {
      const detail = (ev as CustomEvent<ClaimEvent>).detail;
      if (detail) enqueue(detail);
    };
    window.addEventListener("tokenshit:claim", onLocal);

    return () => {
      alive = false;
      window.clearInterval(t);
      window.removeEventListener("tokenshit:claim", onLocal);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!evt) return null;

  const display =
    evt.handle ||
    (evt.twitter ? `@${evt.twitter}` : null) ||
    (evt.github ? `gh/${evt.github}` : "anon");
  const xHref = evt.twitter
    ? `https://x.com/${evt.twitter}`
    : evt.github
      ? `https://github.com/${evt.github}`
      : null;

  return (
    <div
      className={`claim-glitch-toast fixed z-[150] top-[max(4.5rem,env(safe-area-inset-top))] left-3 right-3 sm:left-auto sm:right-4 sm:w-[360px] pointer-events-none transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-3"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="claim-glitch-card relative overflow-hidden rounded-xl border border-neon/55 bg-zinc-950/95 backdrop-blur-md shadow-[0_0_28px_rgba(57,255,20,0.28)] px-3 py-3 flex items-center gap-3">
        <div className="claim-glitch-scan" aria-hidden />
        <div className="relative shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              evt.avatarUrl ||
              "data:image/svg+xml," +
                encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect fill="#0a0a0f" width="48" height="48"/><text x="24" y="30" text-anchor="middle" font-size="14" fill="#39ff14">$</text></svg>`
                )
            }
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-full border-2 border-neon/70 object-cover bg-zinc-900"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml," +
                encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect fill="#18181b" width="48" height="48"/><text x="24" y="30" text-anchor="middle" font-size="16" fill="#39ff14">$</text></svg>`
                );
            }}
          />
          <span className="absolute -bottom-0.5 -right-0.5 text-[9px] font-bold bg-neon text-black rounded px-1 border border-zinc-950 leading-tight">
            $
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider text-neon font-mono mb-0.5 claim-glitch-text">
            Claim hit
          </p>
          <p className="text-sm font-semibold text-white truncate">
            {xHref ? (
              <a
                href={xHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neon pointer-events-auto"
              >
                {display.startsWith("@") || display.startsWith("gh/")
                  ? display
                  : `@${display}`}
              </a>
            ) : (
              <span>{display}</span>
            )}
          </p>
          <p className="text-[11px] text-zinc-300 mt-0.5 font-mono truncate">
            <span className="text-neon font-bold">
              +{fmtAmt(evt.amount)}
            </span>{" "}
            ${SHIT_SYMBOL}
            <span className="text-zinc-500"> · {evt.kindLabel}</span>
          </p>
        </div>
      </div>

      <style jsx>{`
        .claim-glitch-card {
          animation: claim-glitch-in 0.5s steps(2, end);
        }
        .claim-glitch-scan {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(57, 255, 20, 0.05) 2px,
            rgba(57, 255, 20, 0.05) 4px
          );
          pointer-events: none;
          mix-blend-mode: screen;
          animation: claim-scan 1.1s linear infinite;
        }
        .claim-glitch-text {
          text-shadow:
            1px 0 #ff00aa,
            -1px 0 #00e5ff;
          animation: claim-chrom 0.7s steps(2, end) 3;
        }
        @keyframes claim-glitch-in {
          0% {
            transform: translate(3px, -3px) skewX(-3deg);
            filter: hue-rotate(50deg) contrast(1.2);
          }
          35% {
            transform: translate(-3px, 2px) skewX(2deg);
          }
          100% {
            transform: none;
            filter: none;
          }
        }
        @keyframes claim-scan {
          0% {
            transform: translateY(-40%);
            opacity: 0.55;
          }
          100% {
            transform: translateY(40%);
            opacity: 0.12;
          }
        }
        @keyframes claim-chrom {
          0%,
          100% {
            text-shadow:
              1px 0 #ff00aa,
              -1px 0 #00e5ff;
          }
          50% {
            text-shadow:
              -2px 0 #ff00aa,
              2px 0 #00e5ff;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .claim-glitch-card,
          .claim-glitch-scan,
          .claim-glitch-text {
            animation: none !important;
            text-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
