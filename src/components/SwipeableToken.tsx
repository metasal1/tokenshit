"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import SwipeHint, { SwipeEdgeGlow } from "@/components/SwipeHint";
import LottiePlayer from "@/components/LottiePlayer";
import { sfx } from "@/lib/sfx";

interface Props {
  children: React.ReactNode;
  prevAssetId?: string | null;
  nextAssetId?: string | null;
}

/**
 * Token pager with Lottie swipe affordance (LottieFiles free swipe).
 * Swipe right → prev · swipe left → next
 */
export default function SwipeableToken({
  children,
  prevAssetId,
  nextAssetId,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [visible, setVisible] = useState(true);
  const [burst, setBurst] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    setTransitioning(false);
    setDirection(null);
    setOffsetX(0);
    setVisible(false);
    setBurst(null);
    requestAnimationFrame(() => setVisible(true));
  }, [pathname]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX === null || touchStartY === null) return;
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;
      // ignore mostly-vertical scrolls
      if (Math.abs(dy) > Math.abs(dx) * 1.2) return;
      if (dx > 0 && !prevAssetId) return;
      if (dx < 0 && !nextAssetId) return;
      setOffsetX(dx * 0.45);
    },
    [touchStartX, touchStartY, prevAssetId, nextAssetId]
  );

  const commit = useCallback(
    (dir: "left" | "right", id: string) => {
      setDirection(dir);
      setBurst(dir);
      setTransitioning(true);
      try {
        sfx.whoosh();
      } catch {
        /* ignore */
      }
      setTimeout(() => router.push(`/token/${id}`), 220);
    },
    [router]
  );

  const handleTouchEnd = useCallback(() => {
    if (touchStartX === null) return;
    const threshold = 72;

    if (offsetX < -threshold && nextAssetId) {
      commit("left", nextAssetId);
    } else if (offsetX > threshold && prevAssetId) {
      commit("right", prevAssetId);
    } else {
      setOffsetX(0);
    }

    setTouchStartX(null);
    setTouchStartY(null);
  }, [touchStartX, offsetX, nextAssetId, prevAssetId, commit]);

  const goPrev = useCallback(() => {
    if (!prevAssetId || transitioning) return;
    commit("right", prevAssetId);
  }, [prevAssetId, transitioning, commit]);

  const goNext = useCallback(() => {
    if (!nextAssetId || transitioning) return;
    commit("left", nextAssetId);
  }, [nextAssetId, transitioning, commit]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      )
        return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowLeft" && prevAssetId) {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight" && nextAssetId) {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goPrev, goNext, prevAssetId, nextAssetId]);

  const exitTransform = transitioning
    ? direction === "left"
      ? "translateX(-110%)"
      : "translateX(110%)"
    : `translateX(${offsetX}px)`;

  const intensity = Math.min(1, Math.abs(offsetX) / 120);
  const glowSide: "left" | "right" | null =
    offsetX > 8 ? "left" : offsetX < -8 ? "right" : null;

  return (
    <div className="relative overflow-hidden">
      {/* Lottie coach + text hints */}
      {(prevAssetId || nextAssetId) && (
        <div className="flex flex-col items-center gap-1 px-4 pt-3 pb-1">
          <div className="w-full flex justify-center">
            <SwipeHint mode="nav" />
          </div>
          <div className="w-full flex justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-600 px-1">
            <span>{prevAssetId ? "prev case" : ""}</span>
            <span>{nextAssetId ? "next case" : ""}</span>
          </div>
        </div>
      )}

      <div className="relative">
        {glowSide === "left" && (
          <SwipeEdgeGlow side="left" intensity={intensity} />
        )}
        {glowSide === "right" && (
          <SwipeEdgeGlow side="right" intensity={intensity} />
        )}

        {/* commit burst Lottie */}
        {burst && (
          <div
            className={`pointer-events-none absolute inset-y-0 z-30 flex items-center ${
              burst === "left" ? "right-2" : "left-2"
            }`}
            aria-hidden
          >
            <div
              className="h-20 w-20 opacity-90"
              style={{
                transform: burst === "left" ? "scaleX(-1)" : undefined,
              }}
            >
              <LottiePlayer
                src="/lottie/swipe-phone.json"
                loop={false}
                autoplay
                className="h-full w-full"
              />
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: transitioning
              ? exitTransform
              : visible
                ? `translateX(${offsetX}px)`
                : "translateX(0)",
            transition:
              transitioning || touchStartX === null
                ? "transform 0.22s ease-out, opacity 0.22s ease-out"
                : "none",
            opacity: transitioning ? 0 : 1,
            touchAction: "pan-y",
          }}
        >
          {children}
        </div>
      </div>

      {/* Desktop arrow buttons */}
      <div className="hidden sm:block">
        {prevAssetId && (
          <button
            onClick={goPrev}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-40 bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm border border-zinc-700 transition-colors"
            aria-label="Previous case"
            title="Previous case"
          >
            <span className="sr-only">Previous</span>
            <span aria-hidden className="text-lg font-mono">
              {"<"}
            </span>
          </button>
        )}
        {nextAssetId && (
          <button
            onClick={goNext}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-40 bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full w-12 h-12 flex items-center justify-center backdrop-blur-sm border border-zinc-700 transition-colors overflow-hidden"
            aria-label="Next case"
            title="Next case"
          >
            <span className="absolute inset-0 opacity-70 pointer-events-none">
              <LottiePlayer
                src="/lottie/swipe-hand.json"
                className="h-full w-full scale-150"
                loop
                autoplay
              />
            </span>
            <span aria-hidden className="relative text-lg font-mono z-10">
              {">"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
