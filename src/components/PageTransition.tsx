"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

/**
 * Light page fade only — no global touch hijack.
 * Touch intercept + preventDefault broke scroll/taps in Telegram webviews.
 */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase] = useState<"in" | "out" | "idle">("idle");
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      setPhase("out");
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        prevPathname.current = pathname;
        setPhase("in");
        setTimeout(() => setPhase("idle"), 220);
      }, 140);
      return () => clearTimeout(timer);
    }
    setDisplayChildren(children);
  }, [pathname, children]);

  const style: React.CSSProperties = {
    transition: "opacity 0.16s ease-out",
    opacity: phase === "out" ? 0.35 : 1,
  };

  return <div style={style}>{displayChildren}</div>;
}
