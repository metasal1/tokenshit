"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface Props {
  children: React.ReactNode;
  prevAssetId?: string | null;
  nextAssetId?: string | null;
}

export default function SwipeableToken({ children, prevAssetId, nextAssetId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [visible, setVisible] = useState(true);

  // Reset animation on pathname change
  useEffect(() => {
    setTransitioning(false);
    setDirection(null);
    setOffsetX(0);
    setVisible(false);
    // Slide in from the opposite direction
    requestAnimationFrame(() => {
      setVisible(true);
    });
  }, [pathname]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = e.touches[0].clientX - touchStartX;
    // Only allow swipe if there's a target in that direction
    if (diff > 0 && !prevAssetId) return;
    if (diff < 0 && !nextAssetId) return;
    setOffsetX(diff * 0.4); // dampened
  }, [touchStartX, prevAssetId, nextAssetId]);

  const handleTouchEnd = useCallback(() => {
    if (touchStartX === null) return;
    const threshold = 80;

    if (offsetX < -threshold && nextAssetId) {
      setDirection("left");
      setTransitioning(true);
      setTimeout(() => router.push(`/token/${nextAssetId}`), 250);
    } else if (offsetX > threshold && prevAssetId) {
      setDirection("right");
      setTransitioning(true);
      setTimeout(() => router.push(`/token/${prevAssetId}`), 250);
    } else {
      setOffsetX(0);
    }

    setTouchStartX(null);
  }, [touchStartX, offsetX, nextAssetId, prevAssetId, router]);

  const exitTransform = transitioning
    ? direction === "left"
      ? "translateX(-100%)"
      : "translateX(100%)"
    : `translateX(${offsetX}px)`;

  const enterTransform = visible ? "translateX(0)" : "translateX(0)";

  return (
    <div className="relative overflow-hidden">
      {/* Navigation hints */}
      {(prevAssetId || nextAssetId) && (
        <div className="flex justify-between px-4 py-2 text-xs text-zinc-600">
          <span>{prevAssetId ? "← swipe right" : ""}</span>
          <span>{nextAssetId ? "swipe left →" : ""}</span>
        </div>
      )}

      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: transitioning ? exitTransform : enterTransform,
          transition: transitioning || touchStartX === null ? "transform 0.25s ease-out, opacity 0.25s ease-out" : "none",
          opacity: transitioning ? 0 : 1,
        }}
      >
        {children}
      </div>

      {/* Desktop arrow buttons */}
      <div className="hidden sm:block">
        {prevAssetId && (
          <button
            onClick={() => {
              setDirection("right");
              setTransitioning(true);
              setTimeout(() => router.push(`/token/${prevAssetId}`), 250);
            }}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-40 bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm border border-zinc-700 transition-colors"
            aria-label="Previous token"
          >
            ←
          </button>
        )}
        {nextAssetId && (
          <button
            onClick={() => {
              setDirection("left");
              setTransitioning(true);
              setTimeout(() => router.push(`/token/${nextAssetId}`), 250);
            }}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-40 bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm border border-zinc-700 transition-colors"
            aria-label="Next token"
          >
            →
          </button>
        )}
      </div>
    </div>
  );
}
