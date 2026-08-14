"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MemeBox } from "@/lib/meme-render";
import { blankSrc } from "@/lib/meme-render";

type Mode = "move" | "resize";

type Props = {
  blankUrl: string;
  boxes: MemeBox[];
  texts: string[];
  activeIndex: number;
  onActiveChange: (i: number) => void;
  onBoxesChange: (boxes: MemeBox[]) => void;
  onSwipe?: (dir: -1 | 1) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Monoton is wider than Impact — slightly smaller estimate */
function estimateFontPx(
  text: string,
  boxWpx: number,
  boxHpx: number,
  fontScale: number
): number {
  const t = text.trim();
  if (!t) return Math.max(14, boxHpx * 0.26 * fontScale);
  let size = Math.min(boxHpx * 0.48, boxWpx * 0.16, 100) * fontScale;
  const min = 12;
  const avgChar = 0.72;
  while (size > min) {
    const maxChars = Math.max(3, Math.floor((boxWpx * 0.94) / (size * avgChar)));
    const words = t.split(/\s+/);
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const next = cur ? `${cur} ${w}` : w;
      if (next.length <= maxChars) cur = next;
      else {
        if (cur) lines.push(cur);
        cur = w;
      }
    }
    if (cur) lines.push(cur);
    const nl = t.split("\n").length - 1;
    const lineCount = Math.max(lines.length, nl + 1);
    const totalH = lineCount * size * 1.2;
    if (totalH <= boxHpx * 0.94) return size;
    size -= 1;
  }
  return min;
}

export default function MemeStage({
  blankUrl,
  boxes,
  texts,
  activeIndex,
  onActiveChange,
  onBoxesChange,
  onSwipe,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    mode: Mode;
    index: number;
    startX: number;
    startY: number;
    orig: MemeBox;
  } | null>(null);
  const swipe = useRef<{ x: number; y: number; active: boolean } | null>(null);
  const [ready, setReady] = useState(false);
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setStageSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    const r = el.getBoundingClientRect();
    setStageSize({ w: r.width, h: r.height });
    return () => ro.disconnect();
  }, [blankUrl, ready]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const el = stageRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - d.startX) / r.width;
      const dy = (e.clientY - d.startY) / r.height;
      const o = d.orig;
      const next = [...boxes];
      if (d.mode === "move") {
        next[d.index] = {
          ...o,
          x: clamp(o.x + dx, 0, 1 - o.w),
          y: clamp(o.y + dy, 0, 1 - o.h),
        };
      } else {
        next[d.index] = {
          ...o,
          w: clamp(o.w + dx, 0.12, 1 - o.x),
          h: clamp(o.h + dy, 0.08, 1 - o.y),
        };
      }
      onBoxesChange(next);
    };
    const onUp = (e: PointerEvent) => {
      if (drag.current) {
        drag.current = null;
        return;
      }
      const s = swipe.current;
      swipe.current = null;
      if (!s?.active || !onSwipe) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      if (Math.abs(dx) < 56) return;
      if (Math.abs(dx) < Math.abs(dy) * 1.25) return;
      onSwipe(dx < 0 ? 1 : -1);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [boxes, onBoxesChange, onSwipe]);

  const startDrag = (
    e: React.PointerEvent,
    index: number,
    mode: Mode
  ) => {
    e.preventDefault();
    e.stopPropagation();
    swipe.current = null;
    onActiveChange(index);
    drag.current = {
      mode,
      index,
      startX: e.clientX,
      startY: e.clientY,
      orig: { ...boxes[index]! },
    };
  };

  return (
    <div
      ref={stageRef}
      className="relative w-full touch-pan-y select-none overflow-hidden rounded-xl border border-white/10 bg-black"
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        onActiveChange(-1);
        swipe.current = { x: e.clientX, y: e.clientY, active: true };
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={blankSrc(blankUrl)}
        alt="Meme blank"
        draggable={false}
        onLoad={() => setReady(true)}
        className="pointer-events-none block w-full"
      />
      {ready &&
        boxes.map((box, i) => {
          const active = i === activeIndex;
          const text = (texts[i] || "").trim().toUpperCase();
          const boxW = box.w * stageSize.w;
          const boxH = box.h * stageSize.h;
          const fontPx = estimateFontPx(
            text || "Drag",
            boxW,
            boxH,
            box.fontScale ?? 1
          );
          const dark = box.style === "plain" || box.style === "dark";
          return (
            <div
              key={box.id}
              role="button"
              tabIndex={0}
              onPointerDown={(e) => startDrag(e, i, "move")}
              className={`absolute touch-none ${
                active
                  ? "z-20 ring-2 ring-neon cursor-grabbing"
                  : "z-10 ring-1 ring-white/25 hover:ring-neon/50 cursor-grab"
              }`}
              style={{
                left: `${box.x * 100}%`,
                top: `${box.y * 100}%`,
                width: `${box.w * 100}%`,
                height: `${box.h * 100}%`,
              }}
            >
              <div
                className="flex h-full w-full items-center justify-center overflow-hidden px-[3%] text-center uppercase leading-[1.2]"
                style={{
                  fontSize: `${fontPx}px`,
                  fontFamily:
                    'Monoton, "Monoton Regular", cursive, system-ui, sans-serif',
                  color: dark ? "#0a0a0f" : "#fff8e7",
                  textShadow: dark
                    ? "0 0 1px rgba(255,255,255,0.35)"
                    : "0 0 10px rgba(240,192,64,0.75), 0 0 2px rgba(57,255,20,0.35), 0 1px 2px rgba(0,0,0,0.85)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  justifyContent:
                    box.align === "left"
                      ? "flex-start"
                      : box.align === "right"
                        ? "flex-end"
                        : "center",
                  textAlign: box.align || "center",
                  // prevent mirrored / transform weirdness
                  transform: "none",
                  direction: "ltr",
                }}
              >
                {text || (
                  <span
                    className="normal-case tracking-wide"
                    style={{
                      fontSize: Math.max(11, fontPx * 0.5),
                      color: "rgba(255,255,255,0.35)",
                      textShadow: "none",
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >
                    Drag · resize
                  </span>
                )}
              </div>
              <div
                onPointerDown={(e) => startDrag(e, i, "resize")}
                className="absolute bottom-0 right-0 h-4 w-4 translate-x-1/3 translate-y-1/3 rounded-sm bg-neon shadow"
                style={{ cursor: "nwse-resize" }}
                aria-label="Resize caption"
              />
            </div>
          );
        })}
    </div>
  );
}
