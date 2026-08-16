import type { Metadata } from "next";
import Link from "next/link";
import SwapDesk from "@/components/SwapDesk";
import OnrampButton from "@/components/OnrampButton";
import WalletAddressCard from "@/components/WalletAddressCard";
import CopyableAddress from "@/components/CopyableAddress";
import {
  PLAY_POT_ADDRESS,
  PLAY_REV_ADDRESS,
  SHIT_MINT,
  SHIT_SYMBOL,
  TREASURY_ADDRESS,
  playPotPortfolioUrl,
  playRevPortfolioUrl,
  treasurySolscanUrl,
} from "@/lib/shit-token";
import { USDC_MINT } from "@/lib/buy-fee";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: `Swap $${SHIT_SYMBOL}`,
  description: `Buy $${SHIT_SYMBOL} with SOL, or swap $${SHIT_SYMBOL} ↔ USDC. Amount presets, balances, Jupiter routes.`,
  path: "/swap",
});

export default function SwapPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-3 sm:px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10 space-y-4 sm:space-y-5">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
          <span className="neon-text">Swap</span>
        </h1>
        <p className="text-zinc-400 text-sm leading-snug">
          Buy ${SHIT_SYMBOL} with SOL, or trade ${SHIT_SYMBOL} ↔ USDC. Set exact
          size with presets or %.
        </p>
        <p className="text-xs text-zinc-600">
          Free drops?{" "}
          <Link href="/claim" className="text-neon-blue hover:underline">
            Claim rewards
          </Link>
        </p>
      </header>

      <OnrampButton variant="full" amount="0.3" />

      <WalletAddressCard />

      <SwapDesk />

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
          label="Treasury (claims / house)"
          explorer={treasurySolscanUrl()}
        />
        <CopyableAddress
          address={PLAY_POT_ADDRESS}
          label="Play pot (stakes / prizes)"
          explorer={playPotPortfolioUrl()}
        />
        <CopyableAddress
          address={PLAY_REV_ADDRESS}
          label="Play rev (house 25%)"
          explorer={playRevPortfolioUrl()}
        />
      </section>
    </div>
  );
}
