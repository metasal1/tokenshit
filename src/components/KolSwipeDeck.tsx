"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { EmojiIcon } from "@/components/EmojiIcon";

export type KolCard = {
  id?: number;
  handle: string;
  displayName: string | null;
  avatarUrl: string | null;
  followers: number | null;
  status?: string;
};

type Props = {
  kols: KolCard[];
  onSwipeRight?: (k: KolCard) => void; // e.g. open recommend modal or toast
  onSwipeLeft?: (k: KolCard) => void;
};

function fmtFollowers(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n) || n <= 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default function KolSwipeDeck({ kols: initialKols, onSwipeRight, onSwipeLeft }: Props) {
  const [deck, setDeck] = useState<KolCard[]>(initialKols);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const top = deck[0];
  const remaining = deck.length;

  const resetDrag = () => {
    setDragX(0);
    setIsDragging(false);
  };

  const removeTop = (dir: "left" | "right") => {
    if (!top) return;
    if (dir === "right" && onSwipeRight) onSwipeRight(top);
    if (dir === "left" && onSwipeLeft) onSwipeLeft(top);
    setDeck((d) => d.slice(1));
    resetDrag();
  };

  // Pointer / mouse + touch drag
  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    setDragX(dx);
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    const threshold = 65;
    if (dragX > threshold) {
      removeTop("right");
    } else if (dragX < -threshold) {
      removeTop("left");
    } else {
      resetDrag();
    }
  };

  const swipeManual = (dir: "left" | "right") => {
    // Animate off
    const target = dir === "right" ? 400 : -400;
    setDragX(target);
    setTimeout(() => {
      removeTop(dir);
    }, 180);
  };

  if (!top) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <p className="text-lg font-semibold">Deck cleared</p>
        <p className="text-sm text-zinc-500 mt-1">Adjust filters or refresh to load more.</p>
        <button
          onClick={() => setDeck(initialKols)}
          className="mt-4 rounded-full border border-neon/60 px-4 py-1.5 text-sm hover:bg-neon/10"
        >
          Reload deck
        </button>
      </div>
    );
  }

  const avatar =
    top.avatarUrl?.replace("_normal", "_bigger").replace("_normal", "_400x400") ||
    `https://unavatar.io/twitter/${encodeURIComponent(top.handle)}`;

  const rotate = Math.max(Math.min(dragX / 12, 18), -18);
  const opacity = Math.max(0.6, 1 - Math.abs(dragX) / 300);

  const showRightHint = dragX > 30;
  const showLeftHint = dragX < -30;

  return (
    <div className="select-none">
      <div className="relative h-[420px] w-full max-w-[340px] mx-auto sm:max-w-[380px]">
        {/* Stacked cards (subtle behind cards) */}
        {deck.slice(1, 3).map((k, i) => (
          <div
            key={`${k.handle}-${i}`}
            className="absolute inset-0 rounded-3xl border border-border bg-card"
            style={{
              transform: `scale(${1 - (i + 1) * 0.04}) translateY(${(i + 1) * 10}px)`,
              zIndex: 10 - i,
              opacity: 0.4 - i * 0.1,
            }}
          />
        ))}

        {/* Top swipe card */}
        <div
          className="absolute inset-0 z-20 touch-none cursor-grab active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <div
            className="relative h-full w-full rounded-3xl border-2 border-border bg-card overflow-hidden shadow-xl active:scale-[0.995] transition-transform"
            style={{
              transform: `translateX(${dragX}px) rotate(${rotate}deg)`,
              transition: isDragging ? "none" : "transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1)",
              opacity,
            }}
          >
            {/* Large media / avatar area */}
            <div className="relative h-[260px] w-full bg-zinc-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatar}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Live / status badge */}
              {top.status && (
                <div className="absolute top-3 right-3 rounded-full border border-white/20 bg-black/60 px-2 py-0.5 text-[10px] font-orbitron uppercase tracking-widest">
                  {top.status === "live" ? "LIVE" : top.status.toUpperCase()}
                </div>
              )}

              {/* Hint overlays during drag */}
              {showRightHint && (
                <div className="absolute right-4 top-6 rounded-xl border-2 border-neon bg-neon/10 px-4 py-1 text-neon font-bold text-lg rotate-12">
                  HIT
                </div>
              )}
              {showLeftHint && (
                <div className="absolute left-4 top-6 rounded-xl border-2 border-red-500 bg-red-500/10 px-4 py-1 text-red-400 font-bold text-lg -rotate-12">
                  SHIT
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xl font-semibold text-white truncate">
                    {top.displayName || `@${top.handle}`}
                  </div>
                  <div className="font-mono text-sm text-neon-blue/80">@{top.handle}</div>
                </div>
                <div className="text-right text-xs font-mono text-zinc-400 shrink-0 pt-0.5">
                  {fmtFollowers(top.followers)}<br />followers
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Link
                  href={`/kols/${encodeURIComponent(top.handle)}`}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-zinc-300 hover:border-neon/40"
                  onClick={(e) => e.stopPropagation()}
                >
                  View card →
                </Link>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSwipeRight) onSwipeRight(top);
                  }}
                  className="ml-auto text-xs rounded-full border border-neon/70 px-3 py-0.5 text-neon hover:bg-neon/10 active:scale-95"
                >
                  Recommend 💚
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-5 flex items-center justify-center gap-4">
        <button
          onClick={() => swipeManual("left")}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-900/60 bg-red-950/30 text-2xl text-red-400 active:scale-95 transition hover:border-red-500/60"
          aria-label="Swipe left — SHIT"
        >
          💀
        </button>

        <div className="font-mono text-[10px] uppercase tracking-[2px] text-zinc-500 px-2">
          {remaining} left
        </div>

        <button
          onClick={() => swipeManual("right")}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-neon/60 bg-neon/10 text-2xl text-neon active:scale-95 transition hover:border-neon"
          aria-label="Swipe right — HIT / recommend"
        >
          💚
        </button>
      </div>

      <p className="mt-2 text-center text-[10px] text-zinc-500">
        Swipe or tap the buttons. Right = HIT (recommend vibe)
      </p>
    </div>
  );
}
