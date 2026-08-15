"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EmojiIcon } from "@/components/EmojiIcon";
import { isStandalonePwa } from "@/lib/pwa-auth";

const DISMISS_KEY = "tokenshit_webview_nudge_v1";

type Kind = "webview" | "insecure" | null;

/** In-app browsers that break wallets / OAuth / secure APIs */
export function detectInAppBrowser(): {
  kind: Kind;
  app: string | null;
} {
  if (typeof window === "undefined") return { kind: null, app: null };

  // Real Safari / Chrome / installed PWA — fine
  if (isStandalonePwa()) return { kind: null, app: null };

  const insecure =
    window.isSecureContext === false ||
    (window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1");

  const ua = navigator.userAgent || "";
  const patterns: [RegExp, string][] = [
    [/Telegram/i, "Telegram"],
    [/\bFBAN|\bFBAV|FB_IAB/i, "Facebook"],
    [/Instagram/i, "Instagram"],
    [/\bLine\//i, "LINE"],
    [/MicroMessenger/i, "WeChat"],
    [/Snapchat|Snapchat/i, "Snapchat"],
    [/TikTok|musical_ly|Bytedance/i, "TikTok"],
    [/LinkedInApp/i, "LinkedIn"],
    [/Discord/i, "Discord"],
    // X / Twitter in-app
    [/Twitter|X\/|X-Client/i, "X"],
    // Generic Android WebView
    [/; wv\)|WebView/i, "this app"],
  ];

  let app: string | null = null;
  for (const [re, name] of patterns) {
    if (re.test(ua)) {
      app = name;
      break;
    }
  }

  // iOS WKWebView without Safari markers
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
  if (!app && isIos && !isSafari && !/Chrome|Firefox|Edge/i.test(ua)) {
    app = "this app";
  }

  if (insecure) return { kind: "insecure", app };
  if (app) return { kind: "webview", app };
  return { kind: null, app: null };
}

/**
 * Friendly nudge: open full Safari/Chrome — no "HTTPS" jargon.
 */
export default function InAppBrowserBanner() {
  const [show, setShow] = useState(false);
  const [meta, setMeta] = useState<{ kind: Kind; app: string | null }>({
    kind: null,
    app: null,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* */
    }
    const d = detectInAppBrowser();
    setMeta(d);
    if (d.kind) setShow(true);
  }, []);

  const href = useMemo(() => {
    if (typeof window === "undefined") return "https://tokenshit.com";
    return window.location.href;
  }, [show]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = href;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } catch {
        /* */
      }
    }
  }, [href]);

  const openExternal = useCallback(() => {
    const url = href;
    // Android Chrome intent — opens real browser when possible
    if (/Android/i.test(navigator.userAgent || "")) {
      try {
        const u = new URL(url);
        const intent = `intent://${u.host}${u.pathname}${u.search}${u.hash}#Intent;scheme=https;package=com.android.chrome;end`;
        window.location.href = intent;
        return;
      } catch {
        /* fall through */
      }
    }
    // iOS / others: new tab often still stays in webview — copy is primary
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      /* */
    }
  }, [href]);

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* */
    }
    setShow(false);
  };

  if (!show || !meta.kind) return null;

  const where =
    meta.app && meta.app !== "this app" ? meta.app : "this mini browser";

  const headline =
    meta.kind === "insecure"
      ? "This window is too locked-down"
      : `Open TOKEN$HIT outside ${where}`;

  const body =
    meta.kind === "insecure"
      ? "Login, wallets, and play need a real Safari or Chrome tab — not this mini preview."
      : `Login, wallets & play break inside ${where}. Open the full browser (Safari or Chrome) for the real app.`;

  return (
    <div
      className="sticky top-[env(safe-area-inset-top,0px)] z-[80] border-b border-amber-400/40 bg-amber-950/95 backdrop-blur-md px-3 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.45)]"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto max-w-lg flex gap-3 items-start">
        <EmojiIcon size={22} label="Heads up">
          🌐
        </EmojiIcon>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-bold text-amber-100 leading-snug font-orbitron tracking-wide uppercase">
            {headline}
          </p>
          <p className="text-xs text-amber-100/80 leading-relaxed">{body}</p>
          <ol className="text-[11px] text-amber-50/70 space-y-0.5 list-decimal list-inside font-mono">
            <li>Tap ··· or Share</li>
            <li>Open in Safari / Chrome</li>
            <li>Or copy the link and paste it there</li>
          </ol>
          <div className="flex flex-wrap gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => void copy()}
              className="min-h-10 px-3 rounded-lg bg-neon text-black text-xs font-bold"
            >
              {copied ? "Copied ✓" : "Copy link"}
            </button>
            <button
              type="button"
              onClick={openExternal}
              className="min-h-10 px-3 rounded-lg border border-amber-400/50 text-amber-50 text-xs font-semibold"
            >
              Try open browser
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="min-h-10 px-2 text-xs text-amber-200/60 hover:text-amber-100"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
