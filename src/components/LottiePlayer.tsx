"use client";

import { useEffect, useRef, useState } from "react";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";

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
 * Lottie wrapper with interaction hooks:
 * - progress 0..1 → scrub frame (for drag-linked swipe)
 * - playKey change → restart one-shot play
 */
export default function LottiePlayer({
  src,
  className = "",
  loop = true,
  autoplay = true,
  style,
  ariaLabel,
  /** 0–1 scrub while dragging; null = normal play mode */
  progress = null,
  /** bump to replay a one-shot */
  playKey = 0,
}: {
  src: Src;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
  ariaLabel?: string;
  progress?: number | null;
  playKey?: number | string;
}) {
  const [data, setData] = useState<object | null>(
    typeof src === "string" ? null : src
  );
  const lottieRef = useRef<LottieRefCurrentProps>(null);

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

  // Scrub to progress while dragging
  useEffect(() => {
    const api = lottieRef.current;
    if (!api || progress == null || !data) return;
    try {
      const frames = api.getDuration(true) || 60;
      const frame = Math.max(0, Math.min(frames - 1, progress * (frames - 1)));
      api.goToAndStop(frame, true);
    } catch {
      /* ignore */
    }
  }, [progress, data]);

  // Replay one-shot when playKey changes
  useEffect(() => {
    if (progress != null) return;
    const api = lottieRef.current;
    if (!api || !data || !playKey) return;
    try {
      api.stop();
      api.goToAndPlay(0, true);
    } catch {
      /* ignore */
    }
  }, [playKey, data, progress]);

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
      <Lottie
        lottieRef={lottieRef}
        animationData={data}
        loop={progress != null ? false : loop}
        autoplay={progress != null ? false : autoplay}
      />
    </div>
  );
}
