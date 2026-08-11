// Tiny WebAudio synth — no assets, lazy AudioContext, mute in localStorage.

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
  const Ctor = window.AudioContext || (window as Win).webkitAudioContext;
  if (!Ctor) return null;
  try {
    if (!ctx || ctx.state === "closed") ctx = new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
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
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(20, opts.sweepTo),
      start + dur
    );
  }

  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + attack);
  g.gain.setValueAtTime(peak, start + Math.max(attack, dur - release));
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);

  osc.connect(g).connect(c.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

function noiseBurst(opts: {
  durationMs: number;
  gain?: number;
  lowpassHz?: number;
  delayMs?: number;
}) {
  const c = getCtx();
  if (!c) return;
  const start = c.currentTime + (opts.delayMs ?? 0) / 1000;
  const dur = opts.durationMs / 1000;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(opts.lowpassHz ?? 500, start);
  filter.frequency.exponentialRampToValueAtTime(80, start + dur);
  const g = c.createGain();
  const peak = opts.gain ?? 0.2;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(filter).connect(g).connect(c.destination);
  src.start(start);
  src.stop(start + dur + 0.02);
}

export const sfx = {
  /** Bright ascending triad — HIT */
  hit() {
    blip({ freq: 523.25, durationMs: 120, type: "triangle", gain: 0.17 });
    blip({
      freq: 659.25,
      durationMs: 120,
      type: "triangle",
      gain: 0.15,
      delayMs: 70,
    });
    blip({
      freq: 783.99,
      durationMs: 180,
      type: "triangle",
      gain: 0.2,
      delayMs: 140,
    });
    blip({
      freq: 2093,
      durationMs: 100,
      type: "sine",
      gain: 0.06,
      delayMs: 160,
      releaseMs: 80,
    });
  },
  /** Low muddy thud + noise — SHIT */
  shit() {
    blip({
      freq: 140,
      sweepTo: 48,
      durationMs: 320,
      type: "sine",
      gain: 0.32,
      releaseMs: 220,
    });
    blip({
      freq: 100,
      sweepTo: 40,
      durationMs: 300,
      type: "sawtooth",
      gain: 0.1,
      delayMs: 40,
      releaseMs: 200,
    });
    noiseBurst({ durationMs: 200, gain: 0.2, lowpassHz: 380, delayMs: 10 });
  },
  whoosh() {
    blip({
      freq: 880,
      sweepTo: 220,
      durationMs: 220,
      type: "sine",
      gain: 0.1,
      releaseMs: 120,
    });
  },
  chime() {
    blip({ freq: 784, durationMs: 140, type: "sine", gain: 0.12 });
    blip({
      freq: 1175,
      durationMs: 220,
      type: "sine",
      gain: 0.14,
      delayMs: 110,
    });
  },
  ding() {
    blip({
      freq: 988,
      durationMs: 320,
      type: "sine",
      gain: 0.12,
      releaseMs: 240,
    });
  },
  tap() {
    blip({
      freq: 240,
      durationMs: 40,
      type: "square",
      gain: 0.04,
      releaseMs: 30,
    });
  },
};
