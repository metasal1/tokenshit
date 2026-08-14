"use client";

import { useCallback, useState } from "react";
import { usePrivy, useLoginWithOAuth } from "@privy-io/react-auth";
import {
  needsPwaOAuth,
  oauthReturnUrl,
  stashOAuthReturnPath,
} from "@/lib/pwa-auth";

/**
 * Login that works in installed PWA (iOS/Android standalone).
 * Popups are blocked / break OAuth in PWAs — use full-page initOAuth for X/GitHub.
 */
export function useSafeLogin() {
  const { login, ready, authenticated } = usePrivy();
  const { initOAuth, loading: oauthLoading, state } = useLoginWithOAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loginModal = useCallback(() => {
    setError(null);
    if (!ready) return;
    try {
      login();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    }
  }, [login, ready]);

  /** Full-page OAuth — required for Twitter/X inside standalone PWA */
  const loginWithTwitter = useCallback(async () => {
    setError(null);
    setBusy(true);
    stashOAuthReturnPath();
    try {
      // Full-page redirect — popups fail in Android PWA / Seeker / iOS Home Screen
      await initOAuth({ provider: "twitter" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(
        msg.includes("popup") || msg.includes("blocked") || msg.includes("window")
          ? "X login blocked in app mode. Use Seed Vault, Email, or open tokenshit.com in Chrome (not the X app)."
          : msg || "X login failed"
      );
      setBusy(false);
    }
  }, [initOAuth]);

  const loginWithGithub = useCallback(async () => {
    setError(null);
    setBusy(true);
    stashOAuthReturnPath();
    try {
      await initOAuth({ provider: "github" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "GitHub login failed");
      setBusy(false);
    }
  }, [initOAuth]);

  /**
   * Smart entry: PWA → open login sheet (full-page X); browser → Privy modal.
   */
  const safeLogin = useCallback(() => {
    setError(null);
    if (!ready) return;
    if (needsPwaOAuth()) {
      try {
        window.dispatchEvent(new CustomEvent("tokenshit:pwa-login"));
      } catch {
        login();
      }
      return;
    }
    login();
  }, [login, ready]);

  return {
    ready,
    authenticated,
    busy: busy || oauthLoading,
    error,
    clearError: () => setError(null),
    safeLogin,
    loginModal,
    loginWithTwitter,
    loginWithGithub,
    oauthState: state,
    isPwa: typeof window !== "undefined" ? needsPwaOAuth() : false,
    oauthReturnUrl: oauthReturnUrl(),
  };
}
