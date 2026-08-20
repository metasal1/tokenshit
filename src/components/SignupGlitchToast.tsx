"use client";

import { useEffect, useRef, useState } from "react";

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
const TOAST_MS = 2800;
const POLL_MS = 28_000;

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
    // quiet — no SFX for social signup toasts
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(() => {
        setEvt(null);
        showing.current = false;
        showNext();
      }, 180);
    }, TOAST_MS);
  };

  const enqueue = (e: SignupEvent) => {
    if (!e?.id || !e.handle) return;
    if (e.id <= readSeen()) return;
    if (queue.current.some((q) => q.id === e.id)) return;
    if (evt?.id === e.id) return;
    queue.current.push(e);
    // keep queue tiny
    if (queue.current.length > 2) queue.current = queue.current.slice(-2);
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
        // only newest signup to avoid spam
        if (fresh.length) enqueue(fresh[fresh.length - 1]!);
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
      className={`signup-glitch-toast fixed z-[140] pointer-events-none transition-all duration-200 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 sm:-translate-y-2 sm:translate-y-0"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="signup-glitch-card pointer-events-auto relative overflow-hidden rounded-xl border border-neon/35 bg-zinc-950/90 backdrop-blur-md shadow-sm px-2.5 py-2 flex items-center gap-2">
        <div className="relative shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              evt.avatarUrl ||
              `https://unavatar.io/twitter/${encodeURIComponent(evt.handle)}`
            }
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 rounded-full border border-neon/40 object-cover bg-zinc-800"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml," +
                encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"><rect fill="#18181b" width="28" height="28"/><text x="14" y="19" text-anchor="middle" font-size="12" fill="#39ff14">$</text></svg>`
                );
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] uppercase tracking-wider text-neon/90 font-orbitron">
            New degen
          </p>
          <p className="text-[12px] font-semibold text-white truncate leading-tight">
            <a
              href={`https://x.com/${evt.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neon pointer-events-auto"
            >
              @{evt.handle}
            </a>
            {evt.followers != null && (
              <span className="text-zinc-500 font-normal font-mono text-[10px] ml-1.5">
                {fmtFollowers(evt.followers)}
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            window.setTimeout(() => {
              setEvt(null);
              showing.current = false;
            }, 150);
          }}
          className="shrink-0 pointer-events-auto text-zinc-500 hover:text-white text-sm leading-none px-1"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
