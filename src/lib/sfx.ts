// Tiny WebAudio synth — no assets, lazy AudioContext, mute in localStorage.
// iOS: call sfx.unlock() inside a click/tap handler before first play.

type Win = Window & { webkitAudioContext?: typeof AudioContext };

const MUTE_KEY = "tokenshit_sfx_muted";
let ctx: AudioContext | null = null;
let muted: boolean | null = null;
let unlocked = false;

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

/** Call from a user gesture so iOS allows audio. */
export function unlockAudio(): boolean {
  if (readMuted()) return false;
  const c = getCtx();
  if (!c) return false;
  try {
    if (c.state === "suspended") void c.resume();
    // silent tick to fully unlock
    const g = c.createGain();
    g.gain.value = 0.0001;
    const o = c.createOscillator();
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.01);
    unlocked = true;
    return true;
  } catch {
    return false;
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
  if (c.state === "suspended") void c.resume();
  const start = c.currentTime + (opts.delayMs ?? 0) / 1000;
  const dur = opts.durationMs / 1000;
  const attack = (opts.attackMs ?? 4) / 1000;
  const release = (opts.releaseMs ?? 80) / 1000;
  // Mobile speakers are quiet — higher default peak
  const peak = opts.gain ?? 0.28;

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
  if (c.state === "suspended") void c.resume();
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
  const peak = opts.gain ?? 0.28;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(filter).connect(g).connect(c.destination);
  src.start(start);
  src.stop(start + dur + 0.02);
}

export const sfx = {
  unlock: unlockAudio,
  isUnlocked: () => unlocked,

  /** Bright ascending triad — HIT / UP */
  hit() {
    unlockAudio();
    blip({ freq: 523.25, durationMs: 140, type: "triangle", gain: 0.32 });
    blip({
      freq: 659.25,
      durationMs: 140,
      type: "triangle",
      gain: 0.3,
      delayMs: 70,
    });
    blip({
      freq: 783.99,
      durationMs: 200,
      type: "triangle",
      gain: 0.34,
      delayMs: 140,
    });
    blip({
      freq: 2093,
      durationMs: 120,
      type: "sine",
      gain: 0.12,
      delayMs: 160,
      releaseMs: 80,
    });
  },
  /** Low muddy thud + noise — SHIT / DOWN */
  shit() {
    unlockAudio();
    blip({
      freq: 140,
      sweepTo: 48,
      durationMs: 360,
      type: "sine",
      gain: 0.42,
      releaseMs: 220,
    });
    blip({
      freq: 100,
      sweepTo: 40,
      durationMs: 320,
      type: "sawtooth",
      gain: 0.16,
      delayMs: 40,
      releaseMs: 200,
    });
    noiseBurst({ durationMs: 220, gain: 0.28, lowpassHz: 380, delayMs: 10 });
  },
  whoosh() {
    unlockAudio();
    blip({
      freq: 880,
      sweepTo: 220,
      durationMs: 240,
      type: "sine",
      gain: 0.18,
      releaseMs: 120,
    });
  },
  chime() {
    unlockAudio();
    blip({ freq: 784, durationMs: 160, type: "sine", gain: 0.22 });
    blip({
      freq: 1175,
      durationMs: 240,
      type: "sine",
      gain: 0.24,
      delayMs: 110,
    });
  },
  ding() {
    unlockAudio();
    blip({
      freq: 988,
      durationMs: 340,
      type: "sine",
      gain: 0.22,
      releaseMs: 240,
    });
  },
  /** Cash-in / pot grew / ticket locked */
  potUp() {
    unlockAudio();
    blip({ freq: 523.25, durationMs: 100, type: "triangle", gain: 0.28 });
    blip({
      freq: 659.25,
      durationMs: 110,
      type: "triangle",
      gain: 0.3,
      delayMs: 55,
    });
    blip({
      freq: 783.99,
      durationMs: 150,
      type: "triangle",
      gain: 0.32,
      delayMs: 110,
    });
    blip({
      freq: 1046.5,
      durationMs: 240,
      type: "sine",
      gain: 0.22,
      delayMs: 170,
      releaseMs: 160,
    });
  },
  /** Ticket locked success — juicier than potUp */
  lock() {
    unlockAudio();
    blip({ freq: 392, durationMs: 80, type: "square", gain: 0.14 });
    blip({ freq: 523.25, durationMs: 100, type: "triangle", gain: 0.28, delayMs: 50 });
    blip({ freq: 659.25, durationMs: 120, type: "triangle", gain: 0.3, delayMs: 110 });
    blip({ freq: 783.99, durationMs: 160, type: "triangle", gain: 0.32, delayMs: 180 });
    blip({
      freq: 1568,
      durationMs: 280,
      type: "sine",
      gain: 0.18,
      delayMs: 240,
      releaseMs: 200,
    });
  },
  tap() {
    unlockAudio();
    blip({
      freq: 420,
      durationMs: 50,
      type: "square",
      gain: 0.1,
      releaseMs: 35,
    });
  },
  /** Side switch UP */
  sideUp() {
    unlockAudio();
    blip({ freq: 600, durationMs: 70, type: "triangle", gain: 0.18 });
    blip({ freq: 900, durationMs: 90, type: "triangle", gain: 0.2, delayMs: 45 });
  },
  /** Side switch DOWN */
  sideDown() {
    unlockAudio();
    blip({ freq: 500, durationMs: 70, type: "triangle", gain: 0.18 });
    blip({ freq: 280, durationMs: 110, type: "triangle", gain: 0.2, delayMs: 40 });
  },
  error() {
    unlockAudio();
    blip({
      freq: 220,
      sweepTo: 110,
      durationMs: 220,
      type: "sawtooth",
      gain: 0.16,
      releaseMs: 140,
    });
  },
};
