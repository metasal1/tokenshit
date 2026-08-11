"use client";

import { useEffect, useState } from "react";

export default function PwaClientStatus() {
  const [sw, setSw] = useState<string>("checking…");
  const [standalone, setStandalone] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );

  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    setStandalone(mq.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);

    if (!("serviceWorker" in navigator)) {
      setSw("unsupported");
      return;
    }
    navigator.serviceWorker.getRegistration().then((reg) => {
      setSw(reg ? `active · ${reg.scope}` : "not registered yet");
    });

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setCanInstall(false);
    setDeferred(null);
    setSw(`install: ${choice.outcome}`);
  }

  return (
    <div className="space-y-2 pt-2 border-t border-border/60">
      <p>
        display-mode:{" "}
        <span className="text-zinc-200">
          {standalone ? "standalone (installed)" : "browser"}
        </span>
      </p>
      <p>
        SW: <span className="text-zinc-200 break-all">{sw}</span>
      </p>
      {canInstall && (
        <button
          type="button"
          onClick={install}
          className="min-h-10 px-4 rounded-lg bg-neon text-black text-sm font-semibold"
        >
          Install app
        </button>
      )}
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
