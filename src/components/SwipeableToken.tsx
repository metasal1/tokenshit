"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import InteractiveSwipeLottie, {
  SwipeEdgeGlow,
} from "@/components/InteractiveSwipeLottie";
import { sfx } from "@/lib/sfx";

interface Props {
  children: React.ReactNode;
  prevAssetId?: string | null;
  nextAssetId?: string | null;
}

/**
 * Token pager — Lottie follows the finger, bursts on commit.
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
  const [burstKey, setBurstKey] = useState(0);
  const [hintOnce, setHintOnce] = useState(true);

  useEffect(() => {
    setTransitioning(false);
    setDirection(null);
    setOffsetX(0);
    setVisible(false);
    setBurst(null);
    requestAnimationFrame(() => setVisible(true));
  }, [pathname]);

  useEffect(() => {
    // one-time idle coach: brief auto-progress pulse then hide
    try {
      if (sessionStorage.getItem("tokenshit_swipe_lottie_hint") === "1") {
        setHintOnce(false);
        return;
      }
    } catch {
      /* ignore */
    }
    const t = window.setTimeout(() => {
      setHintOnce(false);
      try {
        sessionStorage.setItem("tokenshit_swipe_lottie_hint", "1");
      } catch {
        /* ignore */
      }
    }, 2800);
    return () => window.clearTimeout(t);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setHintOnce(false);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX === null || touchStartY === null) return;
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;
      if (Math.abs(dy) > Math.abs(dx) * 1.15) return;
      if (dx > 0 && !prevAssetId) return;
      if (dx < 0 && !nextAssetId) return;
      setOffsetX(dx * 0.55);
    },
    [touchStartX, touchStartY, prevAssetId, nextAssetId]
  );

  const commit = useCallback(
    (dir: "left" | "right", id: string) => {
      setDirection(dir);
      setBurst(dir);
      setBurstKey((k) => k + 1);
      setTransitioning(true);
      setOffsetX(dir === "left" ? -140 : 140);
      try {
        sfx.whoosh();
      } catch {
        /* ignore */
      }
      setTimeout(() => router.push(`/token/${id}`), 280);
    },
    [router]
  );

  const handleTouchEnd = useCallback(() => {
    if (touchStartX === null) return;
    const threshold = 64;

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

  const intensity = Math.min(1, Math.abs(offsetX) / 100);
  const glowSide: "left" | "right" | null =
    offsetX > 8 ? "left" : offsetX < -8 ? "right" : null;

  // idle coach: gentle synthetic offset so Lottie scrubs once
  const idleOffset =
    hintOnce && nextAssetId && Math.abs(offsetX) < 1 && !burst
      ? -36
      : offsetX;

  return (
    <div className="relative overflow-hidden">
      {(prevAssetId || nextAssetId) && (
        <div className="w-full flex justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-600 px-4 pt-2 pb-1">
          <span>{prevAssetId ? "swipe right · prev" : ""}</span>
          <span>{nextAssetId ? "swipe left · next" : ""}</span>
        </div>
      )}

      <div className="relative min-h-[120px]">
        {glowSide === "left" && (
          <SwipeEdgeGlow side="left" intensity={intensity} mode="nav" />
        )}
        {glowSide === "right" && (
          <SwipeEdgeGlow side="right" intensity={intensity} mode="nav" />
        )}

        <InteractiveSwipeLottie
          offsetX={idleOffset}
          threshold={90}
          burst={burst}
          burstKey={burstKey}
          variant="phone"
          mode="nav"
          size={104}
        />

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
                ? "transform 0.28s cubic-bezier(.2,.8,.2,1), opacity 0.22s ease-out"
                : "none",
            opacity: transitioning ? 0.15 : 1,
            touchAction: "pan-y",
          }}
        >
          {children}
        </div>
      </div>

      {/* Desktop: buttons fire the same Lottie burst via commit */}
      <div className="hidden sm:block">
        {prevAssetId && (
          <button
            onClick={goPrev}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-40 bg-zinc-900/90 hover:bg-zinc-800 text-white rounded-full w-12 h-12 flex items-center justify-center backdrop-blur-sm border border-zinc-600 hover:border-neon/50 transition-colors"
            aria-label="Previous case"
            title="Previous case"
          >
            <span aria-hidden className="text-lg font-mono">
              {"<"}
            </span>
          </button>
        )}
        {nextAssetId && (
          <button
            onClick={goNext}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-40 bg-zinc-900/90 hover:bg-zinc-800 text-white rounded-full w-12 h-12 flex items-center justify-center backdrop-blur-sm border border-zinc-600 hover:border-neon/50 transition-colors"
            aria-label="Next case"
            title="Next case"
          >
            <span aria-hidden className="text-lg font-mono">
              {">"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
