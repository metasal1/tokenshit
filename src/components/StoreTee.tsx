"use client";

import { useState } from "react";

const SIZES = ["S", "M", "L", "XL", "2XL"] as const;
type Size = (typeof SIZES)[number];

export default function StoreTee() {
  const [size, setSize] = useState<Size>("L");
  const orderHref = `https://x.com/intent/tweet?text=${encodeURIComponent(
    `GM @Tokenshit_ I want a TOKENSHIT tee size ${size}`
  )}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-orbitron text-lg font-bold text-zinc-100">
          TOKEN$HIT Tee
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Black cotton 180G. DTF chest print. Adult unisex.
        </p>
      </div>

      <p className="font-orbitron text-2xl text-neon">$24.99 USD</p>

      <div>
        <p className="font-orbitron text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
          Size
        </p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => {
            const on = s === size;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={on}
                className={`min-w-11 min-h-11 inline-flex items-center justify-center rounded-md border px-3 text-sm font-orbitron ${
                  on
                    ? "border-neon bg-neon/15 text-neon"
                    : "border-zinc-700 text-zinc-200 hover:border-zinc-400"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <ul className="text-sm text-zinc-400 space-y-1.5">
        <li>Ships to Australia. Standard from $11.</li>
        <li>Fast AU about $20. Express about $42.</li>
        <li>Printed on demand. No inventory.</li>
      </ul>

      <a
        href={orderHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center min-h-11 w-full sm:w-auto rounded-md bg-neon px-6 py-3 font-orbitron text-sm font-bold text-black hover:brightness-110"
      >
        Order on X
      </a>
      <p className="text-xs text-zinc-600">
        DM @Tokenshit_ with size {size}.
      </p>
    </div>
  );
}
