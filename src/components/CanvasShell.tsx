"use client";

import type { ReactNode } from "react";
import { Liquid } from "@/components/canvasui/Liquid";

/**
 * Page shell — plain flex column.
 * Full-page Ripple was clipping long pages (stats) to a black void
 * because canvas capture only covers viewport height.
 */
export function CanvasShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">{children}</div>
  );
}

/** Brand fluid trail for sticky header (neon-ish blue). */
export function CanvasHeaderFx({ children }: { children: ReactNode }) {
  return (
    <Liquid
      className="w-full"
      rainbow={false}
      color={[0.2, 0.75, 1.0]}
      intensity={0.28}
      distortion={0.18}
      blend={0.28}
      force={1.1}
      radius={0.24}
      densityDissipation={0.97}
      velocityDissipation={0.98}
    >
      {children}
    </Liquid>
  );
}

/** Soft liquid wash for share / CTA panels. */
export function CanvasPanelFx({ children }: { children: ReactNode }) {
  return (
    <Liquid
      className="w-full rounded-2xl overflow-hidden"
      rainbow
      intensity={0.22}
      distortion={0.24}
      blend={0.18}
      force={1.0}
      radius={0.26}
    >
      {children}
    </Liquid>
  );
}
