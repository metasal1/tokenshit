"use client";

import type { ReactNode } from "react";

/**
 * Plain wrappers — no canvasui Liquid/Ripple.
 * layoutsubtree + overflow:auto + absolute WebGL canvases break
 * Telegram / in-app webviews (black voids, dead taps, clipped sticky nav).
 */

export function CanvasShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-background">{children}</div>
  );
}

export function CanvasHeaderFx({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function CanvasPanelFx({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
