"use client";

import { useState } from "react";

export default function CollapsibleSection({
  title,
  count,
  children,
  defaultOpen = false,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-border hover:bg-card-hover transition-colors"
      >
        <h3 className="font-semibold text-foreground">
          {title} {count != null && <span className="text-zinc-500 font-normal text-sm">({count})</span>}
        </h3>
        <span className="text-zinc-500 text-sm transition-transform" style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}>
          ▼
        </span>
      </button>
      {open && children}
    </div>
  );
}
