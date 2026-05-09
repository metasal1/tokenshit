// Tiny WebAudio synth — no assets, lazy AudioContext, mute persisted in localStorage.

type Win = Window & { webkitAudioContext?: typeof AudioContext };

const MUTE_KEY = "tokenshit_sfx_muted";
let ctx: AudioContext | null = null;
let muted: boolean | null = null;

function readMuted(): boolean {
  if (muted !== null) return muted;
  if (typeof window === "undefined") return false;
  muted = window.localStorage.getItem(MUTE_KEY) === "1";
  return muted;
}

export function isMuted(): boolean {
  return readMuted();
}

export function setMuted(next: boolean) {
  muted = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    window.dispatchEvent(new CustomEvent("tokenshit:sfx-toggle"));
  }
}

export function toggleMuted(): boolean {
  setMuted(!readMuted());
  return readMuted();
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (readMuted()) return null;
  if (ctx) return ctx;
  const Ctor = window.AudioContext || (window as Win).webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
    return ctx;
  } catch {
    return null;
  }
}

function blip(opts: {
  freq: number;
  durationMs: number;
  type?: OscillatorType;
  attackMs?: number;
  releaseMs?: number;
  gain?: number;
  sweepTo?: number;
  delayMs?: number;
}) {
  const c = getCtx();
  if (!c) return;
  const start = c.currentTime + (opts.delayMs ?? 0) / 1000;
  const dur = opts.durationMs / 1000;
  const attack = (opts.attackMs ?? 4) / 1000;
  const release = (opts.releaseMs ?? 80) / 1000;
  const peak = opts.gain ?? 0.18;

  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.freq, start);
  if (opts.sweepTo != null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.sweepTo), start + dur);
  }

  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + attack);
  g.gain.setValueAtTime(peak, start + Math.max(attack, dur - release));
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);

  osc.connect(g).connect(c.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

export const sfx = {
  hit() {
    // bright triad C5 → E5 → G5
    blip({ freq: 523.25, durationMs: 110, type: "triangle", gain: 0.16 });
    blip({ freq: 659.25, durationMs: 110, type: "triangle", gain: 0.14, delayMs: 70 });
    blip({ freq: 783.99, durationMs: 160, type: "triangle", gain: 0.18, delayMs: 140 });
  },
  shit() {
    // low descending sawtooth — flush-y
    blip({ freq: 220, sweepTo: 90, durationMs: 380, type: "sawtooth", gain: 0.18, releaseMs: 200 });
    blip({ freq: 110, sweepTo: 55, durationMs: 360, type: "square", gain: 0.05, delayMs: 30, releaseMs: 200 });
  },
  whoosh() {
    // quick downward sine sweep
    blip({ freq: 880, sweepTo: 220, durationMs: 220, type: "sine", gain: 0.1, releaseMs: 120 });
  },
  chime() {
    // friendly two-note success
    blip({ freq: 784, durationMs: 140, type: "sine", gain: 0.12 });
    blip({ freq: 1175, durationMs: 220, type: "sine", gain: 0.14, delayMs: 110 });
  },
  ding() {
    // single soft confirmation
    blip({ freq: 988, durationMs: 320, type: "sine", gain: 0.12, releaseMs: 240 });
  },
};
