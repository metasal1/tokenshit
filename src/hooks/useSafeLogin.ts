"use client";

import { useCallback, useState } from "react";
import { usePrivy, useLoginWithOAuth } from "@privy-io/react-auth";
import {
  isStandalonePwa,
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
      // Ensure redirect lands back on our origin inside the PWA webview
      await initOAuth({ provider: "twitter" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(
        msg.includes("popup") || msg.includes("blocked")
          ? "X login blocked in app mode. Use full-page login or Email."
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
    if (isStandalonePwa()) {
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
    isPwa: typeof window !== "undefined" ? isStandalonePwa() : false,
    oauthReturnUrl: oauthReturnUrl(),
  };
}
