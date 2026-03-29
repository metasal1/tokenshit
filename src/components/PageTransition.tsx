"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase] = useState<"in" | "out" | "idle">("idle");
  const prevPathname = useRef(pathname);
  const touchStartX = useRef<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      // Animate out, then swap, then animate in
      setPhase("out");
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        prevPathname.current = pathname;
        setPhase("in");
        setTimeout(() => setPhase("idle"), 300);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setDisplayChildren(children);
    }
  }, [pathname, children]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    setSwipeOffset(diff * 0.3);
  };

  const handleTouchEnd = () => {
    setSwipeOffset(0);
    touchStartX.current = null;
  };

  const style: React.CSSProperties = {
    transition: phase !== "idle" ? "transform 0.2s ease-out, opacity 0.2s ease-out" : swipeOffset !== 0 ? "none" : "transform 0.2s ease-out, opacity 0.2s ease-out",
    transform: phase === "out"
      ? "translateX(-30px)"
      : phase === "in"
      ? "translateX(0)"
      : `translateX(${swipeOffset}px)`,
    opacity: phase === "out" ? 0 : 1,
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={style}
    >
      {displayChildren}
    </div>
  );
}
