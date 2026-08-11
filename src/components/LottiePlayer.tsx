"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

type Src = object | string;

const cache = new Map<string, object>();

async function loadJson(src: string): Promise<object | null> {
  if (cache.has(src)) return cache.get(src)!;
  try {
    const res = await fetch(src, { cache: "force-cache" });
    if (!res.ok) return null;
    const data = (await res.json()) as object;
    cache.set(src, data);
    return data;
  } catch {
    return null;
  }
}

/**
 * Lightweight Lottie wrapper — fetches JSON once, loops by default.
 * Free swipe assets from LottieFiles live under /public/lottie/
 */
export default function LottiePlayer({
  src,
  className = "",
  loop = true,
  autoplay = true,
  style,
  ariaLabel,
}: {
  src: Src;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
  ariaLabel?: string;
}) {
  const [data, setData] = useState<object | null>(
    typeof src === "string" ? null : src
  );

  useEffect(() => {
    if (typeof src !== "string") {
      setData(src);
      return;
    }
    let alive = true;
    loadJson(src).then((d) => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
    };
  }, [src]);

  if (!data) {
    return (
      <div
        className={`animate-pulse rounded-full bg-zinc-800/60 ${className}`}
        style={style}
        aria-hidden
      />
    );
  }

  return (
    <div className={className} style={style} aria-label={ariaLabel} role="img">
      <Lottie animationData={data} loop={loop} autoplay={autoplay} />
    </div>
  );
}
