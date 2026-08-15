"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[tokenshit] route error", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="font-monoton text-3xl sm:text-4xl mb-3">
        <span className="neon-text">TOKEN</span>
        <span className="neon-dollar">$</span>
        <span className="neon-text">HIT</span>
      </h1>
      <p className="text-zinc-400 text-sm max-w-sm mb-6">
        Something broke on this page. Reload usually fixes a stuck install or old
        cache.
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          type="button"
          onClick={() => {
            try {
              if ("serviceWorker" in navigator) {
                navigator.serviceWorker.getRegistrations().then((regs) => {
                  regs.forEach((r) => r.unregister());
                });
              }
              if ("caches" in window) {
                caches.keys().then((keys) =>
                  Promise.all(keys.map((k) => caches.delete(k)))
                );
              }
            } catch {
              /* */
            }
            reset();
            window.location.href = "/";
          }}
          className="min-h-11 px-5 rounded-xl bg-neon text-black text-sm font-bold"
        >
          Clear cache & reload
        </button>
        <Link
          href="/"
          className="min-h-11 px-5 rounded-xl border border-zinc-700 text-sm text-zinc-300 inline-flex items-center"
        >
          Home
        </Link>
      </div>
      {error?.digest && (
        <p className="mt-4 text-[10px] font-mono text-zinc-700">
          {error.digest}
        </p>
      )}
    </div>
  );
}
