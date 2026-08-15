"use client";

import { useCallback, useEffect, useState } from "react";
import { isStandalonePwa } from "@/lib/pwa-auth";

const DISMISS_KEY = "tokenshit_webview_nudge_v2";
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Strict in-app browser detect — known broken hosts only.
 * No generic WebView / loose iOS heuristics (those false-positive Safari & Chrome).
 */
export function detectInAppBrowser(): { app: string } | null {
  if (typeof window === "undefined") return null;
  if (isStandalonePwa()) return null;

  const ua = navigator.userAgent || "";

  // Known mini-browsers that break Privy / wallets / OAuth
  const hits: [RegExp, string][] = [
    [/Telegram/i, "Telegram"],
    [/\bFBAN|\bFBAV|FB_IAB|FBIOS/i, "Facebook"],
    [/Instagram/i, "Instagram"],
    [/\bLine\//i, "LINE"],
    [/MicroMessenger/i, "WeChat"],
    [/Snapchat/i, "Snapchat"],
    [/TikTok|musical_ly|BytedanceWebview/i, "TikTok"],
    [/LinkedInApp/i, "LinkedIn"],
    // X/Twitter *in-app* only — not bare "X/" (false positives)
    [/Twitter for iPhone|Twitter for Android|TwitterAndroid/i, "X"],
  ];

  for (const [re, name] of hits) {
    if (re.test(ua)) return { app: name };
  }

  // Android WebView marker (Chrome custom tabs / real Chrome do not have "; wv)")
  if (/; wv\)/i.test(ua) && /Android/i.test(ua)) {
    return { app: "this app" };
  }

  return null;
}

function wasDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const t = Number(raw);
    if (!Number.isFinite(t)) return false;
    return Date.now() - t < DISMISS_MS;
  } catch {
    return false;
  }
}

/**
 * Compact “open in browser” chip — only real in-app browsers, dismiss 7d.
 */
export default function InAppBrowserBanner() {
  const [app, setApp] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (wasDismissed()) return;
    const d = detectInAppBrowser();
    if (d) setApp(d.app);
  }, []);

  const copy = useCallback(async () => {
    const href = window.location.href;
    try {
      await navigator.clipboard.writeText(href);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = href;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        /* */
      }
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* */
    }
    setApp(null);
  };

  if (!app) return null;

  const label = app === "this app" ? "this app" : app;

  return (
    <div
      className="sticky top-[env(safe-area-inset-top,0px)] z-[80] border-b border-white/10 bg-[#0c0c12]/95 backdrop-blur-md"
      role="status"
    >
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 py-2">
        <p className="min-w-0 flex-1 text-[12px] leading-snug text-zinc-300">
          <span className="font-semibold text-cream">Better in Safari/Chrome.</span>{" "}
          <span className="text-zinc-500">
            Login & wallets break in {label}.
          </span>
        </p>
        <button
          type="button"
          onClick={() => void copy()}
          className="shrink-0 rounded-md bg-neon px-2.5 py-1.5 text-[11px] font-bold text-black"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-md px-1.5 py-1 text-[14px] leading-none text-zinc-500 hover:text-zinc-200"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
