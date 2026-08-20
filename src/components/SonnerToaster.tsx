"use client";

import { Toaster } from "sonner";

/** Site-wide Sonner host — dark, brand-aligned. */
export default function SonnerToaster() {
  return (
    <Toaster
      theme="dark"
      position="top-right"
      richColors
      closeButton
      expand={false}
      visibleToasts={4}
      gap={10}
      offset={{ top: "4.5rem", right: "0.75rem" }}
      toastOptions={{
        classNames: {
          toast:
            "border border-zinc-700/80 bg-zinc-950/95 text-zinc-100 shadow-xl backdrop-blur-md font-sans",
          title: "text-sm font-semibold text-white",
          description: "text-xs text-zinc-400",
          success: "border-neon/40",
          error: "border-red-500/40",
          info: "border-sky-400/35",
          closeButton: "border-zinc-600 bg-zinc-900 text-zinc-300",
        },
      }}
    />
  );
}
