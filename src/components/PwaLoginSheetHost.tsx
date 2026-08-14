"use client";

import { useEffect, useState } from "react";
import { usePrivy, useConnectWallet } from "@privy-io/react-auth";
import { EmojiIcon } from "@/components/EmojiIcon";
import { useSafeLogin } from "@/hooks/useSafeLogin";
import { isAndroidUa, needsPwaOAuth } from "@/lib/pwa-auth";
import { isAndroidLike } from "@/lib/mwa";

/**
 * Always mounted under PrivyProvider. Opens PWA login sheet on
 * `tokenshit:pwa-login` or when nav SafeLoginButton opens.
 * Does not render a nav button — sheet only.
 */
export default function PwaLoginSheetHost() {
  const { ready, authenticated } = usePrivy();
  const { connectWallet } = useConnectWallet();
  const {
    loginModal,
    loginWithTwitter,
    loginWithGithub,
    busy,
    error,
    clearError,
  } = useSafeLogin();
  const [open, setOpen] = useState(false);
  const [walletBusy, setWalletBusy] = useState(false);
  const android = typeof window !== "undefined" && isAndroidUa();
  const seekerHint = android || isAndroidLike();

  useEffect(() => {
    const openSheet = () => setOpen(true);
    window.addEventListener("tokenshit:pwa-login", openSheet);
    return () => window.removeEventListener("tokenshit:pwa-login", openSheet);
  }, []);

  if (!ready || authenticated || !open) return null;

  return (
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
        style={{ marginBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
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
              {needsPwaOAuth()
                ? seekerHint
                  ? "Seeker / Android PWA blocks X popups. Use full-page X, Seed Vault, or email."
                  : "Home Screen app blocks X popups. Use full-page X or email."
                : "Choose how to sign in."}
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
          <span className="font-mono text-base">𝕏</span>
          Continue with X
        </button>

        {seekerHint && (
          <button
            type="button"
            disabled={busy || walletBusy}
            onClick={() => {
              setWalletBusy(true);
              try {
                connectWallet();
              } catch (e) {
                console.warn("[mwa] connectWallet", e);
              } finally {
                setWalletBusy(false);
              }
            }}
            className="w-full min-h-12 rounded-xl border border-neon/50 bg-neon/10 text-neon font-bold text-sm disabled:opacity-50"
          >
            Seed Vault / mobile wallet
          </button>
        )}

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
          {seekerHint
            ? "After X authorizes, stay in Chrome — if the X app opens, back out and choose Continue in browser. Seed Vault uses Mobile Wallet Adapter on this phone."
            : "After X authorizes, you return here. If iOS opens the X app, cancel and choose Continue in browser."}
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
  );
}
