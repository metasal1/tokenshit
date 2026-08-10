"use client";

import type { ReactNode } from "react";
import { Ripple } from "@/components/canvasui/Ripple";
import { Liquid } from "@/components/canvasui/Liquid";

/** Full-page click ripples — light so data stays readable. */
export function CanvasShell({ children }: { children: ReactNode }) {
  return (
    <Ripple
      className="min-h-screen"
      amplitude={0.3}
      speed={0.7}
      wavelength={96}
      rings={2}
      decay={1.15}
      refraction={48}
      dispersion={0.2}
      shine={0.35}
      trigger="click"
      interval={0}
    >
      {children}
    </Ripple>
  );
}

/** Brand fluid trail for sticky header (neon-ish blue). */
export function CanvasHeaderFx({ children }: { children: ReactNode }) {
  return (
    <Liquid
      className="w-full"
      rainbow={false}
      color={[0.2, 0.75, 1.0]}
      intensity={0.32}
      distortion={0.2}
      blend={0.32}
      force={1.2}
      radius={0.26}
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
      intensity={0.26}
      distortion={0.28}
      blend={0.2}
      force={1.1}
      radius={0.28}
    >
      {children}
    </Liquid>
  );
}
