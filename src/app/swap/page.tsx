import type { Metadata } from "next";
import Link from "next/link";
import BuyShitPanel from "@/components/BuyShitPanel";
import SwapShitUsdcPanel from "@/components/SwapShitUsdcPanel";
import WalletAddressCard from "@/components/WalletAddressCard";
import CopyableAddress from "@/components/CopyableAddress";
import {
  SHIT_MINT,
  SHIT_SYMBOL,
  TREASURY_ADDRESS,
  treasurySolscanUrl,
} from "@/lib/shit-token";
import { USDC_MINT } from "@/lib/buy-fee";

export const metadata: Metadata = {
  title: `Swap $${SHIT_SYMBOL} — TokenShit`,
  description: `Buy $${SHIT_SYMBOL} with SOL, or swap $${SHIT_SYMBOL} ↔ USDC. Copy wallet & mint.`,
};

export default function SwapPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-3 sm:px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10 space-y-4 sm:space-y-5">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
          <span className="emoji mr-1.5" aria-hidden>
            🔁
          </span>
          <span className="neon-text">Swap</span>
        </h1>
        <p className="text-zinc-400 text-sm leading-snug">
          SOL → ${SHIT_SYMBOL}, or ${SHIT_SYMBOL} ↔ USDC. Same Privy wallet.
        </p>
        <p className="text-xs text-zinc-600">
          Need free drops?{" "}
          <Link href="/claim" className="text-neon-blue hover:underline">
            Claim rewards →
          </Link>
        </p>
      </header>

      <WalletAddressCard />

      <BuyShitPanel />
      <SwapShitUsdcPanel />

      <section className="rounded-xl border border-border bg-card p-3.5 sm:p-4 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Addresses</h2>
        <CopyableAddress
          address={SHIT_MINT}
          label={`$${SHIT_SYMBOL} mint`}
          explorer={`https://solscan.io/token/${SHIT_MINT}`}
        />
        <CopyableAddress
          address={USDC_MINT}
          label="USDC mint"
          explorer={`https://solscan.io/token/${USDC_MINT}`}
        />
        <CopyableAddress
          address={TREASURY_ADDRESS}
          label="Treasury"
          explorer={treasurySolscanUrl()}
        />
      </section>
    </div>
  );
}
