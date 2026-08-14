"use client";

import { useEffect, useState } from "react";
import { EmojiIcon } from "@/components/EmojiIcon";

/**
 * Boot / loading screen for PWA + first paint.
 * Hides after load or max timeout. Noto spinner only.
 */
export default function PwaBootSplash() {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    let gone = false;
    const hide = () => {
      if (gone) return;
      gone = true;
      setFade(true);
      window.setTimeout(() => setShow(false), 320);
    };

    // Hide when page is interactive
    if (document.readyState === "complete") {
      window.setTimeout(hide, 400);
    } else {
      window.addEventListener("load", () => window.setTimeout(hide, 350), {
        once: true,
      });
    }
    // Hard cap so we never block forever
    const max = window.setTimeout(hide, 2200);
    return () => {
      gone = true;
      window.clearTimeout(max);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0f] transition-opacity duration-300 ${
        fade ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading TOKEN$HIT"
    >
      {/* ambient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 42%, rgba(57,255,20,0.18), transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-5 px-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/icon-512.png"
          alt=""
          width={96}
          height={96}
          className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl shadow-[0_0_40px_rgba(57,255,20,0.25)]"
          draggable={false}
        />

        <h1 className="font-monoton text-3xl sm:text-4xl leading-none tracking-wide">
          <span className="neon-text">TOKEN</span>
          <span className="neon-dollar">$</span>
          <span className="neon-text">HIT</span>
        </h1>

        <p className="text-[11px] sm:text-xs text-zinc-500 text-center max-w-xs font-orbitron uppercase tracking-[0.14em]">
          Every token is shit until proven otherwise
        </p>

        <div className="mt-2 flex items-center gap-2 text-zinc-400">
          <EmojiIcon size={22} className="animate-spin" label="Loading">
            💫
          </EmojiIcon>
          <span className="text-xs font-orbitron uppercase tracking-wider">
            Loading
          </span>
        </div>
      </div>
    </div>
  );
}
