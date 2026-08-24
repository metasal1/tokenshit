"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { EmojiIcon } from "@/components/EmojiIcon";
import { useSafeLogin } from "@/hooks/useSafeLogin";
import { isStandalonePwa } from "@/lib/pwa-auth";
import { XLogo } from "@/components/XLogo";

type Props = {
  className?: string;
  label?: string;
  /** Compact single button (nav) vs full PWA sheet trigger */
  variant?: "nav" | "cta" | "block";
};

/**
 * Login control that fixes Twitter/X in installed PWA:
 * - Browser: normal Privy modal
 * - PWA: sheet with Email (modal) + Continue with X (full-page OAuth)
 */
export default function SafeLoginButton({
  className = "",
  label = "Login",
  variant = "nav",
}: Props) {
  const { ready, authenticated } = usePrivy();
  const {
    safeLogin,
    loginModal,
    loginWithTwitter,
    loginWithGithub,
    busy,
    error,
    clearError,
  } = useSafeLogin();
  const [open, setOpen] = useState(false);
  const [pwa, setPwa] = useState(false);

  useEffect(() => {
    setPwa(isStandalonePwa());
  }, []);

  useEffect(() => {
    const openSheet = () => {
      if (isStandalonePwa()) setOpen(true);
    };
    window.addEventListener("tokenshit:pwa-login", openSheet);
    return () => window.removeEventListener("tokenshit:pwa-login", openSheet);
  }, []);

  if (!ready || authenticated) return null;

  const baseBtn =
    variant === "nav"
      ? "px-3 py-1.5 text-xs font-semibold rounded-full bg-neon text-black hover:brightness-110 disabled:opacity-50"
      : variant === "block"
        ? "w-full min-h-11 rounded-xl bg-neon text-black font-bold text-sm disabled:opacity-50"
        : "min-h-11 px-5 rounded-full bg-neon text-black font-bold text-sm disabled:opacity-50";

  function onPrimary() {
    if (pwa) {
      setOpen(true);
      return;
    }
    safeLogin();
  }

  return (
    <>
      <button
        type="button"
        onClick={onPrimary}
        disabled={busy}
        className={`${baseBtn} ${className}`}
      >
        {busy ? "…" : label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-3 bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-label="Login"
          onClick={() => {
            setOpen(false);
            clearError();
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-neon/30 bg-zinc-950 p-5 shadow-2xl space-y-3"
            style={{
              marginBottom: "max(0.5rem, env(safe-area-inset-bottom))",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-orbitron uppercase tracking-[0.2em] text-neon">
                  App login
                </p>
                <h2 className="text-lg font-semibold text-white mt-0.5">
                  Sign in to TOKEN$HIT
                </h2>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Installed app mode blocks X popups. Use full-page X login or
                  email.
                </p>
              </div>
              <button
                type="button"
                className="text-zinc-500 text-sm px-2"
                onClick={() => {
                  setOpen(false);
                  clearError();
                }}
              >
                ✕
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="button"
              disabled={busy}
              onClick={() => void loginWithTwitter()}
              className="w-full min-h-12 rounded-xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <XLogo size={16} className="text-black" />
              Continue with X
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setOpen(false);
                loginModal();
              }}
              className="w-full min-h-11 rounded-xl border border-zinc-600 text-zinc-100 text-sm font-semibold disabled:opacity-50"
            >
              Email magic link
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => void loginWithGithub()}
              className="w-full min-h-11 rounded-xl border border-zinc-700 text-zinc-400 text-xs font-orbitron uppercase tracking-wider disabled:opacity-50"
            >
              GitHub
            </button>

            <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
              X opens full-screen then returns here. Stay in the app — don&apos;t
              switch to the X app if prompted (use browser).
            </p>

            {busy && (
              <div className="flex justify-center py-1">
                <EmojiIcon size={22} className="animate-spin" label="Loading">
                  💫
                </EmojiIcon>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
