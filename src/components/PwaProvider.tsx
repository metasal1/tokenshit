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

/**
 * Registers SW, resumes drop reminder, optional install/notify prompts.
 */
export default function PwaProvider({ children }: { children?: React.ReactNode }) {
  const [banner, setBanner] = useState<"notify" | "install" | null>(null);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );

  useEffect(() => {
    void ensureSw();
    resumeDropReminderIfArmed();

    // Soft prompt once for notifications (not every session)
    try {
      const seen = localStorage.getItem("tokenshit_notify_prompt_v1");
      const perm = getNotificationPermission();
      if (!seen && perm === "default") {
        const t = window.setTimeout(() => setBanner("notify"), 8000);
        return () => clearTimeout(t);
      }
    } catch {
      /* ignore */
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      try {
        if (!localStorage.getItem("tokenshit_install_dismiss_v1")) {
          setBanner((b) => b || "install");
        }
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  async function enableNotify() {
    const p = await requestNotificationPermission();
    localStorage.setItem("tokenshit_notify_prompt_v1", "1");
    setBanner(null);
    if (p === "granted") {
      await showLocalNotification({
        title: "TOKENSHIT",
        body: "You're on the list. Arm drop reminder anytime on /test or Claim.",
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
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setBanner(null);
    localStorage.setItem("tokenshit_install_dismiss_v1", "1");
  }

  function dismiss() {
    if (banner === "notify") {
      localStorage.setItem("tokenshit_notify_prompt_v1", "1");
    }
    if (banner === "install") {
      localStorage.setItem("tokenshit_install_dismiss_v1", "1");
    }
    setBanner(null);
  }

  return (
    <>
      {children}
      {banner && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-sm z-[90] rounded-xl border border-neon/40 bg-zinc-950/95 backdrop-blur-xl p-4 shadow-2xl space-y-3">
          <p className="text-sm text-zinc-200 font-medium">
            {banner === "notify"
              ? "Get pinged when the treasury reloads?"
              : "Install TOKENSHIT on your home screen?"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={banner === "notify" ? enableNotify : install}
              className="flex-1 min-h-10 rounded-lg bg-neon text-black text-sm font-semibold"
            >
              {banner === "notify" ? "Enable" : "Install"}
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="min-h-10 px-3 rounded-lg border border-zinc-700 text-sm text-zinc-400"
            >
              Later
            </button>
          </div>
          <p className="text-[10px] text-zinc-600 font-mono">
            {banner === "notify" ? "/test · notifications" : "PWA · standalone"}
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
