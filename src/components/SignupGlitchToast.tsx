"use client";

import { useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/sfx";

type SignupEvent = {
  id: number;
  handle: string | null;
  followers: number | null;
  verified: boolean | null;
  avatarUrl: string | null;
  referrer: string | null;
  createdAt: string;
};

function fmtFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

const SEEN_KEY = "tokenshit_signup_toast_seen";
const TOAST_MS = 4200;
const POLL_MS = 18_000;

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
 * Site-wide glitch toast when someone new signs up.
 * Polls /api/signup/recent + listens for local signup event.
 */
export default function SignupGlitchToast() {
  const [evt, setEvt] = useState<SignupEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<number | null>(null);
  const queue = useRef<SignupEvent[]>([]);
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
      sfx.chime?.();
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

  const enqueue = (e: SignupEvent) => {
    if (!e?.id || !e.handle) return;
    if (e.id <= readSeen()) return;
    if (queue.current.some((q) => q.id === e.id)) return;
    if (evt?.id === e.id) return;
    queue.current.push(e);
    showNext();
  };

  useEffect(() => {
    let alive = true;

    const poll = async () => {
      try {
        const r = await fetch("/api/signup/recent", { cache: "no-store" });
        const d = await r.json();
        if (!alive || !Array.isArray(d.events)) return;
        const seen = readSeen();
        // oldest-first among new
        const fresh = (d.events as SignupEvent[])
          .filter((e) => e.id > seen && e.handle)
          .sort((a, b) => a.id - b.id);
        // first visit: seed seen to latest so we don't spam history
        if (seen === 0 && d.events[0]?.id) {
          writeSeen(Number(d.events[0].id));
          return;
        }
        for (const e of fresh) enqueue(e);
      } catch {
        /* ignore */
      }
    };

    // seed seen ASAP without toasting backlog
    void poll();
    const t = window.setInterval(() => void poll(), POLL_MS);

    const onLocal = (ev: Event) => {
      const detail = (ev as CustomEvent<SignupEvent>).detail;
      if (detail) enqueue(detail);
    };
    window.addEventListener("tokenshit:signup", onLocal);

    return () => {
      alive = false;
      window.clearInterval(t);
      window.removeEventListener("tokenshit:signup", onLocal);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!evt || !evt.handle) return null;

  return (
    <div
      className={`signup-glitch-toast fixed z-[140] left-3 right-3 sm:left-auto sm:right-4 sm:w-[340px] bottom-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="signup-glitch-card relative overflow-hidden rounded-xl border border-neon/50 bg-zinc-950/95 backdrop-blur-md shadow-[0_0_24px_rgba(57,255,20,0.25)] px-3 py-3 flex items-center gap-3">
        <div className="signup-glitch-scan" aria-hidden />
        <div className="relative shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              evt.avatarUrl ||
              `https://unavatar.io/twitter/${encodeURIComponent(evt.handle)}`
            }
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-full border-2 border-neon/60 object-cover bg-zinc-800"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml," +
                encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect fill="#18181b" width="48" height="48"/><text x="24" y="30" text-anchor="middle" font-size="20">💩</text></svg>`
                );
            }}
          />
          {evt.verified ? (
            <span className="absolute -bottom-0.5 -right-0.5 text-[10px] bg-sky-500 text-white rounded-full h-4 w-4 flex items-center justify-center border border-zinc-950">
              ✓
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider text-neon font-mono mb-0.5 signup-glitch-text">
            New degen locked in
          </p>
          <p className="text-sm font-semibold text-white truncate">
            <a
              href={`https://x.com/${evt.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neon pointer-events-auto"
            >
              @{evt.handle}
            </a>
            {evt.followers != null && (
              <span className="text-zinc-400 font-normal font-mono text-xs ml-2">
                {fmtFollowers(evt.followers)} flw
              </span>
            )}
          </p>
          {evt.referrer ? (
            <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
              via{" "}
              <a
                href={`https://x.com/${evt.referrer}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neon-blue hover:underline pointer-events-auto"
              >
                @{evt.referrer}
              </a>
            </p>
          ) : (
            <p className="text-[11px] text-zinc-600 mt-0.5">organic signup</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .signup-glitch-card {
          animation: signup-glitch-in 0.45s steps(2, end);
        }
        .signup-glitch-scan {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(57, 255, 20, 0.04) 2px,
            rgba(57, 255, 20, 0.04) 4px
          );
          pointer-events: none;
          mix-blend-mode: screen;
          animation: signup-scan 1.2s linear infinite;
        }
        .signup-glitch-text {
          text-shadow:
            1px 0 #ff00aa,
            -1px 0 #00e5ff;
          animation: signup-chrom 0.8s steps(2, end) 2;
        }
        @keyframes signup-glitch-in {
          0% {
            transform: translate(2px, -2px) skewX(-2deg);
            filter: hue-rotate(40deg);
          }
          40% {
            transform: translate(-2px, 1px) skewX(1deg);
          }
          100% {
            transform: none;
            filter: none;
          }
        }
        @keyframes signup-scan {
          0% {
            transform: translateY(-30%);
            opacity: 0.5;
          }
          100% {
            transform: translateY(30%);
            opacity: 0.15;
          }
        }
        @keyframes signup-chrom {
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
          .signup-glitch-card,
          .signup-glitch-scan,
          .signup-glitch-text {
            animation: none !important;
            text-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
