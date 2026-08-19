"use client";

import { useEffect, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  REFERRAL_REWARD_SHIT,
  SHIT_SYMBOL,
  X_HANDLE,
} from "@/lib/shit-token";
import { getRefHandle } from "@/lib/privy-identity";

function buildRefLink(handle: string, path = "/") {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://tokenshit.com";
  const clean = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(clean, base);
  url.searchParams.set("ref", handle.toLowerCase());
  return url.toString();
}

export type ShareRefButtonProps = {
  /** Override path (default current path or /) */
  path?: string;
  /** Force a handle (skip privy) */
  handle?: string | null;
  /** compact = nav chip; full = large CTA */
  variant?: "compact" | "full" | "inline";
  className?: string;
  /** Show login CTA when no handle */
  showLogin?: boolean;
};

/**
 * Share referral link: copy, Web Share, tweet with ?ref=
 */
export default function ShareRefButton({
  path,
  handle: handleProp,
  variant = "full",
  className = "",
  showLogin = true,
}: ShareRefButtonProps) {
  const { ready, authenticated, user, login } = usePrivy();
  const [copied, setCopied] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const handle = useMemo(() => {
    if (handleProp) return handleProp.replace(/^@/, "").toLowerCase();
    return getRefHandle(user);
  }, [handleProp, user]);

  const sharePath =
    path ||
    (typeof window !== "undefined"
      ? window.location.pathname || "/"
      : "/");

  const link = handle ? buildRefLink(handle, sharePath) : null;

  useEffect(() => {
    if (!handle) return;
    // stats keyed by twitter username today
    fetch(`/api/referral/stats?username=${encodeURIComponent(handle)}`)
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.totalReferrals === "number") setCount(d.totalReferrals);
      })
      .catch(() => {});
  }, [handle]);

  async function copy() {
    if (!link) return;
    setErr(null);
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErr("Copy failed");
    }
  }

  async function shareNative() {
    if (!link) return;
    setErr(null);
    const text = `Judge bags on TokenShit — every token is shit until proven otherwise.\n${link}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "TokenShit",
          text,
          url: link,
        });
        return;
      } catch {
        /* user cancelled or fail → fall through */
      }
    }
    await copy();
  }

  function tweet() {
    if (!link) return;
    const text = `Just judged bags on @${X_HANDLE} 💚\n\nJoin via my link — I get ${REFERRAL_REWARD_SHIT.toLocaleString()} $${SHIT_SYMBOL} if you sign up.\n\n${link}`;
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  if (!ready) return null;

  if (!handle) {
    if (!showLogin) return null;
    return (
      <button
        type="button"
        onClick={() => login()}
        className={
          variant === "compact"
            ? `text-xs px-2.5 py-1.5 min-h-9 rounded-md border border-zinc-700 text-zinc-300 hover:border-neon hover:text-white transition-colors ${className}`
            : `w-full min-h-11 rounded-lg border border-zinc-600 text-sm font-semibold text-zinc-200 hover:border-neon transition-colors ${className}`
        }
      >
        {authenticated ? "Link X to get ref link" : "Login to share ref"}
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={shareNative}
        title={link || "Share ref"}
        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 min-h-9 rounded-md border border-zinc-700 text-zinc-300 hover:border-neon hover:text-white transition-colors font-medium ${className}`}
      >
        <span aria-hidden>↗</span>
        <span>{copied ? "Copied" : "Share ref"}</span>
      </button>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        <button
          type="button"
          onClick={copy}
          className="min-h-9 px-3 rounded-md border border-zinc-600 text-xs font-semibold text-zinc-200 hover:border-neon"
        >
          {copied ? "✓ Copied" : "Copy ref"}
        </button>
        <button
          type="button"
          onClick={tweet}
          className="min-h-9 px-3 rounded-md bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white"
        >
          Tweet ref
        </button>
      </div>
    );
  }

  // full
  return (
    <div
      className={`rounded-xl border border-border bg-card p-3.5 sm:p-4 space-y-3 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-white">
            Share your ref
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Earn{" "}
            <span className="text-neon font-mono">
              {REFERRAL_REWARD_SHIT.toLocaleString()} ${SHIT_SYMBOL}
            </span>{" "}
            per signup
            {count != null && count > 0 ? (
              <>
                {" "}
                · <span className="text-zinc-300">{count} referred</span>
              </>
            ) : null}
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-zinc-900/80 border border-zinc-800 px-3 py-2.5 font-mono text-[11px] sm:text-xs text-zinc-400 break-all select-all">
        {link}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={copy}
          className="min-h-11 touch-manipulation rounded-lg border border-zinc-600 hover:border-neon text-sm font-semibold text-white active:scale-[0.98]"
        >
          {copied ? "✓ Copied" : "Copy link"}
        </button>
        <button
          type="button"
          onClick={shareNative}
          className="min-h-11 touch-manipulation rounded-lg bg-neon text-black hover:brightness-110 text-sm font-semibold active:scale-[0.98]"
        >
          Share
        </button>
        <button
          type="button"
          onClick={tweet}
          className="min-h-11 touch-manipulation rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold active:scale-[0.98]"
        >
          Tweet
        </button>
      </div>

      {err && <p className="text-xs text-red-400">{err}</p>}
    </div>
  );
}
