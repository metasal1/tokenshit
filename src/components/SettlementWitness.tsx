"use client";

import { useEffect, useState } from "react";
import HourCelebrate, { useHourCelebrate } from "@/components/HourCelebrate";
import { EmojiIcon } from "@/components/EmojiIcon";
import { sfx } from "@/lib/sfx";

/**
 * Sitewide witness for hour finalize + prize distribution.
 * Mount once in layout so every page (not just /play) sees the spectacle.
 */
export default function SettlementWitness() {
  const [nextCloseAt, setNextCloseAt] = useState<string | null>(null);
  const [currentHour, setCurrentHour] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch("/api/day", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (!alive) return;
          if (d?.nextCloseAt) setNextCloseAt(String(d.nextCloseAt));
          if (d?.utcHour || d?.utcDay)
            setCurrentHour(String(d.utcHour || d.utcDay));
        })
        .catch(() => {});
    };
    load();
    const t = setInterval(load, 25_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const { payload, waiting, dismiss } = useHourCelebrate({
    nextCloseAt,
    currentHour,
    enabled: true,
  });

  // Fanfare when settle overlay opens
  useEffect(() => {
    if (!payload) return;
    try {
      sfx.potUp();
      window.setTimeout(() => sfx.hit(), 400);
      window.setTimeout(() => sfx.shit(), 1800);
    } catch {
      /* */
    }
    try {
      window.dispatchEvent(
        new CustomEvent("tokenshit:hour-settled", { detail: payload })
      );
    } catch {
      /* */
    }
  }, [payload?.utcHour]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {waiting && !payload && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[250] max-w-[min(92vw,28rem)] rounded-2xl border border-neon/50 bg-black/95 px-4 py-3 flex items-center gap-3 shadow-[0_0_40px_rgba(57,255,20,0.2)]">
          <EmojiIcon size={22} className="animate-spin" label="Finalizing">
            💫
          </EmojiIcon>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white font-orbitron uppercase tracking-wide">
              Finalizing hour
            </p>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Everyone is watching · bags + prize distribution on-chain
            </p>
          </div>
        </div>
      )}
      {payload && <HourCelebrate payload={payload} onClose={dismiss} />}
    </>
  );
}
