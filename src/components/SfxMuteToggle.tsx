"use client";

import { useEffect, useState } from "react";
import { isMuted, toggleMuted } from "@/lib/sfx";

/** Header mute toggle for vote SFX */
export default function SfxMuteToggle() {
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    setMutedState(isMuted());
    const onToggle = () => setMutedState(isMuted());
    window.addEventListener("tokenshit:sfx-toggle", onToggle);
    return () => window.removeEventListener("tokenshit:sfx-toggle", onToggle);
  }, []);

  return (
    <button
      type="button"
      onClick={() => setMutedState(toggleMuted())}
      title={muted ? "Unmute vote sounds" : "Mute vote sounds"}
      aria-label={muted ? "Unmute" : "Mute"}
      className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-zinc-700 text-zinc-400 hover:border-neon hover:text-neon transition-colors text-sm"
    >
      <span className="emoji" aria-hidden>{muted ? "🔇" : "🔊"}</span>
    </button>
  );
}
