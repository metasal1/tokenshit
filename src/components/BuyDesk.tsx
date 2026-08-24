"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import OnrampButton from "@/components/OnrampButton";
import SwapDesk from "@/components/SwapDesk";
import WalletAddressCard from "@/components/WalletAddressCard";
import WithdrawPanel from "@/components/WithdrawPanel";
import { EmojiIcon } from "@/components/EmojiIcon";

const CrossmintBuyCard = dynamic(
  () => import("@/components/CrossmintBuyCard"),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse h-40 rounded-xl bg-zinc-900/60 border border-border" />
    ),
  }
);

type Tab = "card" | "sol";

/**
 * Buy desk layout — desktop 2-col, single primary panel with Card | SOL tabs.
 * Avoids stacked Crossmint + MoonPay + SwapDesk mess.
 * Crossmint is client-only (ssr:false) so it never hits the CF Worker bundle.
 */
export default function BuyDesk() {
  const [tab, setTab] = useState<Tab>("card");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
      {/* Primary */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-3 min-w-0">
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.25)]">
          <div
            className="grid grid-cols-2 border-b border-border"
            role="tablist"
            aria-label="Buy method"
          >
            <TabBtn
              active={tab === "card"}
              onClick={() => setTab("card")}
              icon="💳"
              label="Card"
              sub="Crossmint"
            />
            <TabBtn
              active={tab === "sol"}
              onClick={() => setTab("sol")}
              icon="◎"
              label="SOL"
              sub="Swap in-app"
            />
          </div>

          <div className="p-3 sm:p-4 lg:p-5">
            {tab === "card" ? (
              <div className="space-y-3">
                <CrossmintBuyCard embedded />
                <div className="rounded-xl border border-border/80 bg-zinc-950/60 p-3 space-y-2">
                  <p className="text-[11px] text-zinc-500 leading-snug">
                    Prefer MoonPay → SOL first? (then swap on the SOL tab)
                  </p>
                  <OnrampButton variant="compact" amount="0.3" autoSwap />
                </div>
              </div>
            ) : (
              <SwapDesk embedded />
            )}
          </div>
        </div>
      </div>

      <aside className="lg:col-span-5 xl:col-span-4 space-y-3 min-w-0 lg:sticky lg:top-24">
        <WalletAddressCard />
        <div id="withdraw">
          <WithdrawPanel defaultAsset="shit" />
        </div>
      </aside>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-3 sm:py-3.5 transition-colors min-h-12 ${
        active
          ? "bg-neon/10 text-neon"
          : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03]"
      }`}
    >
      <span className="inline-flex items-center gap-1.5 text-sm font-bold font-orbitron uppercase tracking-wide">
        <EmojiIcon size={16}>{icon}</EmojiIcon>
        {label}
      </span>
      <span
        className={`text-[10px] font-mono ${
          active ? "text-neon/70" : "text-zinc-600"
        }`}
      >
        {sub}
      </span>
      {active && (
        <span
          className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-neon"
          aria-hidden
        />
      )}
    </button>
  );
}
