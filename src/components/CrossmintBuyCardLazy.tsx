"use client";

import dynamic from "next/dynamic";

const CrossmintBuyCard = dynamic(() => import("@/components/CrossmintBuyCard"), {
  ssr: false,
  loading: () => (
    <section className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-zinc-500">Loading card checkout…</p>
    </section>
  ),
});

export default function CrossmintBuyCardLazy() {
  return <CrossmintBuyCard />;
}
