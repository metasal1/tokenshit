"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { SHIT_SYMBOL } from "@/lib/shit-token";

const FIRST_KEY = "tokenshit_first_visit_toasts_v1";
const MIN_TOASTS = 10;
const MAX_TOASTS = 15;
const STAGGER_MS = 520;
const START_DELAY_MS = 900;

type ClaimEvt = {
  id: number;
  kind: string;
  kindLabel: string;
  handle: string | null;
  amount: number;
};

type SignupEvt = {
  id: number;
  handle: string | null;
  followers: number | null;
};

type ToastItem = {
  key: string;
  title: string;
  description?: string;
  kind: "success" | "info" | "default";
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmtAmt(n: number) {
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function fmtFlw(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n) || n <= 0) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function who(handle: string | null | undefined): string {
  if (!handle) return "someone";
  const h = handle.replace(/^@/, "");
  return h.startsWith("…") || h.includes("…") ? `@${h}` : `@${h}`;
}

function claimToast(e: ClaimEvt): ToastItem {
  const whoLabel = who(e.handle);
  const amt = fmtAmt(e.amount);
  const label = (e.kindLabel || e.kind || "claim").toUpperCase();
  return {
    key: `c-${e.id}`,
    title: `${whoLabel} claimed`,
    description: amt
      ? `${label} · ${amt} $${SHIT_SYMBOL}`
      : `${label} · $${SHIT_SYMBOL}`,
    kind: e.kind === "x_tweet" || e.kind === "x_premium" ? "success" : "info",
  };
}

function signupToast(e: SignupEvt): ToastItem {
  const whoLabel = who(e.handle);
  const flw = fmtFlw(e.followers);
  return {
    key: `s-${e.id}`,
    title: `${whoLabel} just joined`,
    description: flw ? `${flw} followers on X` : "Welcome to the court",
    kind: "default",
  };
}

/** Fun fillers if feed is thin — still TOKENSHIT vibe, no fake wallets. */
const FALLBACKS: ToastItem[] = [
  { key: "f1", title: "Court is live", description: "HIT or SHIT every bag", kind: "info" },
  { key: "f2", title: "Play is open", description: "SH!T OF THE DAY · house spark", kind: "success" },
  { key: "f3", title: "Scout KOLs", description: "10k+ accepted → 2,500 $TOKENSHIT", kind: "info" },
  { key: "f4", title: "Tweet the CA", description: "solana: mint in claim tweets", kind: "default" },
  { key: "f5", title: "Memes ready", description: "FaceFusion blanks · tokenshit.com/memes", kind: "default" },
  { key: "f6", title: "Gas pack", description: "Love tweet → 67 plays of SOL", kind: "success" },
  { key: "f7", title: "Referrals pay", description: "On claim · X quality gates", kind: "info" },
  { key: "f8", title: "Every token is SH!T", description: "until proven otherwise", kind: "default" },
  { key: "f9", title: "Whales board", description: "Live bags + SOL balance", kind: "info" },
  { key: "f10", title: "Claim stack", description: "Follow · tweet · premium · list", kind: "success" },
  { key: "f11", title: "KOL court", description: "Swipe left SHIT · right recommend", kind: "info" },
  { key: "f12", title: "House spark", description: "3,750 SHIT/hr into the pots", kind: "success" },
  { key: "f13", title: "Buy in-app", description: "No seed import · withdraw ok", kind: "default" },
  { key: "f14", title: "PWA install", description: "Add to home · play faster", kind: "default" },
  { key: "f15", title: "I LOVE TOKENSHIT", description: "💚 @tokenshit_ · /love", kind: "success" },
];

function fireOne(t: ToastItem) {
  const opts = {
    description: t.description,
    duration: 2800,
  };
  if (t.kind === "success") toast.success(t.title, opts);
  else if (t.kind === "info") toast.info(t.title, opts);
  else toast(t.title, opts);
}

/**
 * First visit only: stream 10–15 random social-proof / vibe toasts via Sonner.
 * Subsequent visits skip (localStorage). Live claim/signup still use glitch toasts.
 */
export default function FirstVisitToasts() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    let cancelled = false;
    const timers: number[] = [];

    try {
      if (typeof window === "undefined") return;
      if (localStorage.getItem(FIRST_KEY)) return;
    } catch {
      return;
    }

    (async () => {
      let pool: ToastItem[] = [];

      try {
        const [claimsRes, signupsRes] = await Promise.all([
          fetch("/api/claim/recent", { cache: "no-store" }).then((r) =>
            r.ok ? r.json() : { events: [] }
          ),
          fetch("/api/signup/recent", { cache: "no-store" }).then((r) =>
            r.ok ? r.json() : { events: [] }
          ),
        ]);

        const claims = (claimsRes.events || []) as ClaimEvt[];
        const signups = (signupsRes.events || []) as SignupEvt[];

        pool = [
          ...claims.map(claimToast),
          ...signups.map(signupToast),
        ];
      } catch {
        pool = [];
      }

      if (cancelled) return;

      // Top up with brand fillers so we always hit 10–15
      if (pool.length < MIN_TOASTS) {
        pool = [...pool, ...shuffle(FALLBACKS)];
      }

      const count =
        MIN_TOASTS +
        Math.floor(Math.random() * (MAX_TOASTS - MIN_TOASTS + 1));
      const picked = shuffle(pool).slice(0, count);

      try {
        localStorage.setItem(FIRST_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }

      timers.push(
        window.setTimeout(() => {
          picked.forEach((t, i) => {
            timers.push(
              window.setTimeout(() => {
                if (!cancelled) fireOne(t);
              }, i * STAGGER_MS)
            );
          });
        }, START_DELAY_MS)
      );
    })();

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return null;
}
