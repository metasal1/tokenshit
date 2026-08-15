"use client";

import { useEffect, useState } from "react";
import {
  ensureSw,
  getNotificationPermission,
  requestNotificationPermission,
  resumeDropReminderIfArmed,
  scheduleDropReminder,
  isDropReminderArmed,
  showLocalNotification,
} from "@/lib/notifications";
import PwaBootSplash from "@/components/PwaBootSplash";

type BannerKind = "install" | "ios-install" | "notify" | "update" | null;

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia("(display-mode: standalone)").matches;
  const ios = Boolean(
    (navigator as Navigator & { standalone?: boolean }).standalone
  );
  return mq || ios;
}

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const iOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const webkit = /WebKit/.test(ua);
  const notCriOS = !/CriOS|FxiOS|EdgiOS/.test(ua);
  return iOS && webkit && notCriOS;
}

/**
 * SW + boot splash + install / notify / update prompts.
 */
export default function PwaProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [banner, setBanner] = useState<BannerKind>(null);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null
  );

  useEffect(() => {
    void ensureSw().then(() => {
      if (!("serviceWorker" in navigator)) return;
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (!reg) return;
        if (reg.waiting) {
          setWaitingWorker(reg.waiting);
          setBanner("update");
        }
        reg.addEventListener("updatefound", () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener("statechange", () => {
            if (nw.state === "installed" && navigator.serviceWorker.controller) {
              setWaitingWorker(nw);
              setBanner("update");
            }
          });
        });
      });
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    });
    resumeDropReminderIfArmed();

    if (isStandalone()) {
      try {
        const seen = localStorage.getItem("tokenshit_notify_prompt_v2");
        const perm = getNotificationPermission();
        if (!seen && perm === "default") {
          const t = window.setTimeout(() => setBanner("notify"), 12_000);
          return () => clearTimeout(t);
        }
      } catch {
        /* ignore */
      }
      return;
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      try {
        if (!localStorage.getItem("tokenshit_install_dismiss_v2")) {
          setBanner("install");
        }
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("beforeinstallprompt", onBip);

    try {
      if (!localStorage.getItem("tokenshit_install_dismiss_v2")) {
        const t = window.setTimeout(() => {
          setBanner((b) => {
            if (b === "install" || b === "update") return b;
            if (isIosSafari()) return "ios-install";
            return b;
          });
        }, 4_000);
        const t2 = window.setTimeout(() => {
          setBanner((b) => {
            if (b) return b;
            if (isIosSafari()) return "ios-install";
            return "install";
          });
        }, 6_500);
        return () => {
          clearTimeout(t);
          clearTimeout(t2);
          window.removeEventListener("beforeinstallprompt", onBip);
        };
      }
    } catch {
      /* ignore */
    }

    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  async function enableNotify() {
    const p = await requestNotificationPermission();
    localStorage.setItem("tokenshit_notify_prompt_v2", "1");
    setBanner(null);
    if (p === "granted") {
      await showLocalNotification({
        title: "TOKEN$HIT",
        body: "Notifications on. Arm drop reminder anytime on /test or Claim.",
        url: "/claim",
      });
      if (!isDropReminderArmed()) {
        try {
          await scheduleDropReminder();
        } catch {
          /* ignore */
        }
      }
    }
  }

  async function install() {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
    }
    setBanner(null);
    localStorage.setItem("tokenshit_install_dismiss_v2", "1");
  }

  function applyUpdate() {
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
    setBanner(null);
  }

  function dismiss() {
    if (banner === "notify") {
      localStorage.setItem("tokenshit_notify_prompt_v2", "1");
    }
    if (banner === "install" || banner === "ios-install") {
      localStorage.setItem("tokenshit_install_dismiss_v2", "1");
    }
    setBanner(null);
  }

  const title =
    banner === "notify"
      ? "Get pinged when the treasury reloads?"
      : banner === "ios-install"
        ? "Add TOKEN$HIT to your Home Screen"
        : banner === "update"
          ? "Update available"
          : "Install TOKEN$HIT as an app";

  const body =
    banner === "notify"
      ? null
      : banner === "ios-install"
        ? "Tap Share → Add to Home Screen. Full screen, boot splash, faster loads."
        : banner === "update"
          ? "A new TOKEN$HIT build is ready. Reload to get the latest."
          : deferred
            ? "One tap — home screen icon, full screen, loading splash."
            : "Use your browser menu → Install app / Add to Home Screen.";

  return (
    <>
      <PwaBootSplash />
      {children}
      {banner && (
        <div
          className="fixed left-3 right-3 sm:left-auto sm:right-4 sm:max-w-sm z-[90] rounded-xl border border-neon/40 bg-zinc-950/95 backdrop-blur-xl p-4 shadow-2xl space-y-3"
          style={{
            bottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
          }}
          role="dialog"
          aria-label={title}
        >
          <p className="text-sm text-zinc-100 font-semibold leading-snug">
            {title}
          </p>
          {body && (
            <p className="text-xs text-zinc-400 leading-relaxed">{body}</p>
          )}
          {banner === "ios-install" && (
            <ol className="text-[11px] text-zinc-300 space-y-1 font-mono list-decimal list-inside">
              <li>Tap the Share button</li>
              <li>Scroll → Add to Home Screen</li>
              <li>Tap Add</li>
            </ol>
          )}
          <div className="flex gap-2">
            {banner === "notify" ? (
              <button
                type="button"
                onClick={() => void enableNotify()}
                className="flex-1 min-h-11 rounded-lg bg-neon text-black text-sm font-bold"
              >
                Enable
              </button>
            ) : banner === "update" ? (
              <button
                type="button"
                onClick={applyUpdate}
                className="flex-1 min-h-11 rounded-lg bg-neon text-black text-sm font-bold"
              >
                Reload
              </button>
            ) : banner === "ios-install" ? (
              <button
                type="button"
                onClick={dismiss}
                className="flex-1 min-h-11 rounded-lg bg-neon text-black text-sm font-bold"
              >
                Got it
              </button>
            ) : deferred ? (
              <button
                type="button"
                onClick={() => void install()}
                className="flex-1 min-h-11 rounded-lg bg-neon text-black text-sm font-bold"
              >
                Install
              </button>
            ) : (
              <button
                type="button"
                onClick={dismiss}
                className="flex-1 min-h-11 rounded-lg bg-neon text-black text-sm font-bold"
              >
                OK
              </button>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="min-h-11 px-4 rounded-lg border border-zinc-700 text-sm text-zinc-400"
            >
              Later
            </button>
          </div>
          <p className="text-[10px] text-zinc-600 font-mono">
            {banner === "notify"
              ? "/test · notifications"
              : banner === "update"
                ? "PWA · tokenshit-v5"
                : "PWA · home screen"}
          </p>
        </div>
      )}
    </>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
