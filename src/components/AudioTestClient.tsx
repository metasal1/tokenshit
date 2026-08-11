"use client";

import { useEffect, useState } from "react";
import { sfx, isMuted, toggleMuted, setMuted } from "@/lib/sfx";

type LogLine = { t: number; msg: string };

export default function AudioTestClient() {
  const [muted, setMutedUi] = useState(false);
  const [log, setLog] = useState<LogLine[]>([]);
  const [ctxState, setCtxState] = useState<string>("—");

  function push(msg: string) {
    setLog((L) => [{ t: Date.now(), msg }, ...L].slice(0, 12));
  }

  useEffect(() => {
    setMutedUi(isMuted());
    const on = () => setMutedUi(isMuted());
    window.addEventListener("tokenshit:sfx-toggle", on);
    return () => window.removeEventListener("tokenshit:sfx-toggle", on);
  }, []);

  function play(kind: keyof typeof sfx) {
    try {
      if (isMuted()) {
        push("muted — unmute first");
        return;
      }
      sfx[kind]();
      push(`played: ${kind}`);
      // probe AudioContext state if present
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AC) {
        // sfx keeps private ctx — show last known via user gesture ok
        setCtxState("running (gesture)");
      }
    } catch (e) {
      push(`error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            const m = toggleMuted();
            setMutedUi(m);
            push(m ? "muted" : "unmuted");
          }}
          className="min-h-11 px-4 rounded-lg border border-zinc-600 text-sm font-semibold hover:border-neon"
        >
          {muted ? "🔇 Unmute" : "🔊 Mute"}
        </button>
        <button
          type="button"
          onClick={() => {
            setMuted(false);
            setMutedUi(false);
            sfx.ding();
            push("force unmute + ding");
          }}
          className="min-h-11 px-4 rounded-lg bg-neon text-black text-sm font-semibold"
        >
          Unlock audio
        </button>
        <span className="text-xs font-mono text-zinc-500">ctx: {ctxState}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {(
          [
            ["hit", "HIT chime", "bg-neon text-black"],
            ["shit", "SHIT thud", "bg-red-600 text-white"],
            ["tap", "Tap", "border border-zinc-600"],
            ["whoosh", "Whoosh", "border border-zinc-600"],
            ["chime", "Chime", "border border-zinc-600"],
            ["ding", "Ding", "border border-zinc-600"],
          ] as const
        ).map(([key, label, cls]) => (
          <button
            key={key}
            type="button"
            onClick={() => play(key)}
            className={`min-h-14 rounded-xl text-sm font-bold active:scale-[0.98] transition ${cls}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">
          Log
        </h3>
        {log.length === 0 ? (
          <p className="text-sm text-zinc-600">Tap a sound…</p>
        ) : (
          <ul className="space-y-1 font-mono text-xs text-zinc-400">
            {log.map((l) => (
              <li key={l.t + l.msg}>
                <span className="text-zinc-600">
                  {new Date(l.t).toLocaleTimeString()}
                </span>{" "}
                {l.msg}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
