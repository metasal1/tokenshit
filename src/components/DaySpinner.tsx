"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type SpinMajor = {
  assetId: string;
  name: string;
  symbol: string;
  logo: string;
  price: number;
};

type Props = {
  majors: SpinMajor[];
  side: "hit" | "shit";
  selectedId?: string | null;
  onSelect: (m: SpinMajor) => void;
  disabled?: boolean;
};

const HIT_COLORS = ["#14532d", "#166534", "#15803d", "#22c55e", "#4ade80", "#86efac"];
const SHIT_COLORS = ["#7f1d1d", "#991b1b", "#b91c1c", "#ef4444", "#f87171", "#fca5a5"];
const NEON = "#39ff14";
const GOLD = "#f0c040";

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Fun majors wheel — spin to pick a bag for Hit/Shit of the Day.
 * Canvas 2D only (PWA / webview safe). No full-page WebGL.
 */
export default function DaySpinner({
  majors,
  side,
  selectedId,
  onSelect,
  disabled,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0); // radians, 0 = pointer at top
  const [result, setResult] = useState<SpinMajor | null>(null);
  const animRef = useRef<number | null>(null);
  const logoCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Cap segments so labels stay readable
  const slices = useMemo(() => {
    const list = majors.slice(0, 16);
    if (list.length >= 6) return list;
    // pad with duplicates of available for a fuller wheel look
    if (!list.length) return list;
    const out = [...list];
    while (out.length < 8) out.push(list[out.length % list.length]!);
    return out.slice(0, 8);
  }, [majors]);

  const n = Math.max(1, slices.length);
  const slice = (Math.PI * 2) / n;
  const colors = side === "hit" ? HIT_COLORS : SHIT_COLORS;

  // preload logos
  useEffect(() => {
    for (const m of slices) {
      if (!m.logo || logoCache.current.has(m.logo)) continue;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = m.logo;
      logoCache.current.set(m.logo, img);
    }
  }, [slices]);

  const draw = useCallback(
    (rot: number, highlightIndex: number | null) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const css = canvas.clientWidth || 320;
      if (canvas.width !== Math.floor(css * dpr)) {
        canvas.width = Math.floor(css * dpr);
        canvas.height = Math.floor(css * dpr);
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const size = css;
      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.46;

      ctx.clearRect(0, 0, size, size);

      // outer glow ring
      ctx.beginPath();
      ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
      ctx.strokeStyle = side === "hit" ? "rgba(57,255,20,0.35)" : "rgba(239,68,68,0.4)";
      ctx.lineWidth = 10;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);

      for (let i = 0; i < n; i++) {
        const a0 = i * slice - Math.PI / 2;
        const a1 = a0 + slice;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, r, a0, a1);
        ctx.closePath();
        const hi = highlightIndex === i;
        ctx.fillStyle = hi ? GOLD : colors[i % colors.length]!;
        ctx.fill();
        ctx.strokeStyle = "rgba(10,10,15,0.85)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // label
        const mid = a0 + slice / 2;
        ctx.save();
        ctx.rotate(mid);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const label = (slices[i]?.symbol || slices[i]?.name || "?").slice(0, 8);
        ctx.fillStyle = hi ? "#0a0a0f" : "#fff8e7";
        ctx.font = `bold ${Math.max(11, Math.min(16, size * 0.045))}px ui-monospace, monospace`;
        ctx.fillText(label, r * 0.62, 0);

        // mini logo
        const logo = slices[i]?.logo;
        const img = logo ? logoCache.current.get(logo) : null;
        if (img && img.complete && img.naturalWidth > 0) {
          const lr = Math.max(10, size * 0.04);
          ctx.beginPath();
          ctx.arc(r * 0.38, 0, lr, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, r * 0.38 - lr, -lr, lr * 2, lr * 2);
        }
        ctx.restore();
      }

      // hub
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
      ctx.fillStyle = "#0a0a0f";
      ctx.fill();
      ctx.strokeStyle = NEON;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = NEON;
      ctx.font = `bold ${Math.max(10, size * 0.04)}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(side === "hit" ? "HIT" : "SHIT", 0, 0);

      ctx.restore();

      // pointer at top
      ctx.beginPath();
      ctx.moveTo(cx, cy - r - 2);
      ctx.lineTo(cx - 12, cy - r - 22);
      ctx.lineTo(cx + 12, cy - r - 22);
      ctx.closePath();
      ctx.fillStyle = NEON;
      ctx.fill();
      ctx.strokeStyle = "#0a0a0f";
      ctx.lineWidth = 2;
      ctx.stroke();
    },
    [n, slice, colors, slices, side]
  );

  useEffect(() => {
    // index under pointer: angle 0 → first slice center at top after -PI/2 start
    // segment i is under pointer when normalized rotation maps accordingly
    let hi: number | null = null;
    if (result) {
      hi = slices.findIndex((s) => s.assetId === result.assetId);
      if (hi < 0) hi = null;
    } else if (selectedId) {
      hi = slices.findIndex((s) => s.assetId === selectedId);
      if (hi < 0) hi = null;
    }
    draw(angle, hi);
  }, [angle, draw, result, selectedId, slices]);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  function indexAtPointer(rot: number): number {
    // slices drawn starting at -PI/2 with rotation rot
    // pointer is at -PI/2 in screen space
    // world angle under pointer = -PI/2 - rot
    let a = -Math.PI / 2 - rot;
    // normalize to [0, 2PI)
    a = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    // our slice i covers [i*slice - PI/2, ...) in unrotated space; easier:
    // in rotated frame, pointer maps to angle relative to first edge
    const fromFirst = (a + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
    const idx = Math.floor(fromFirst / slice) % n;
    return idx;
  }

  function spin() {
    if (spinning || disabled || !slices.length) return;
    setSpinning(true);
    setResult(null);

    const start = angle;
    // 4–7 full turns + random landing
    const turns = 4 + Math.random() * 3;
    const targetIndex = Math.floor(Math.random() * n);
    // land so targetIndex center is under pointer
    // center of slice i in unrotated: -PI/2 + i*slice + slice/2
    // want: rot + center = -PI/2  (mod 2pi) for pointer alignment...
    // pointer fixed at top (-PI/2). After rot, center angle on screen = rot + (-PI/2 + i*slice + slice/2)
    // set equal to -PI/2 => rot = - (i*slice + slice/2)  (mod 2pi)
    const land =
      -targetIndex * slice - slice / 2 + turns * Math.PI * 2;
    // keep continuous from start
    let delta = land - start;
    // normalize so we always spin forward a lot
    while (delta < turns * Math.PI * 2 - Math.PI) delta += Math.PI * 2;

    const duration = 3200 + Math.random() * 900;
    const t0 = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const e = easeOutCubic(t);
      const cur = start + delta * e;
      setAngle(cur);
      if (t < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        const idx = indexAtPointer(cur);
        const picked = slices[idx] || slices[targetIndex]!;
        setResult(picked);
        onSelect(picked);
        setSpinning(false);
        // micro bounce feel
        try {
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(18);
          }
        } catch {
          /* ignore */
        }
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }

  return (
    <div className="space-y-3">
      <div className="relative mx-auto w-full max-w-[320px] aspect-square">
        {/* ambient ring */}
        <div
          className={`absolute inset-0 rounded-full blur-xl opacity-40 pointer-events-none ${
            side === "hit" ? "bg-neon/30" : "bg-red-500/30"
          } ${spinning ? "animate-pulse" : ""}`}
        />
        <canvas
          ref={canvasRef}
          className="relative z-10 h-full w-full rounded-full touch-none"
          style={{ width: "100%", height: "100%" }}
          aria-label="Majors spin wheel"
        />
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          disabled={spinning || disabled || !slices.length}
          onClick={() => spin()}
          className={`min-h-12 w-full max-w-[320px] rounded-xl font-bold text-sm border-2 transition-all active:scale-[0.98] disabled:opacity-50 ${
            side === "hit"
              ? "border-neon bg-neon text-black shadow-[0_0_24px_rgba(57,255,20,0.35)]"
              : "border-red-400 bg-red-500 text-white shadow-[0_0_24px_rgba(239,68,68,0.35)]"
          }`}
        >
          {spinning
            ? "🌀 Spinning…"
            : side === "hit"
              ? "🎰 Spin a HIT bag"
              : "🎰 Spin a SHIT bag"}
        </button>

        {(result || (selectedId && slices.find((s) => s.assetId === selectedId))) && (
          <div
            className={`w-full max-w-[320px] rounded-xl border px-3 py-2 text-center text-sm ${
              side === "hit"
                ? "border-green-700/50 bg-green-950/40 text-green-200"
                : "border-red-700/50 bg-red-950/40 text-red-200"
            }`}
          >
            {(() => {
              const m =
                result ||
                slices.find((s) => s.assetId === selectedId) ||
                null;
              if (!m) return null;
              return (
                <>
                  <span className="font-bold">{m.symbol || m.name}</span>
                  <span className="text-zinc-500"> · </span>
                  <span className="text-zinc-400 text-xs">{m.name}</span>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
