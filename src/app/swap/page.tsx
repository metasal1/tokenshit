import type { Metadata } from "next";
import Link from "next/link";
import BuyDesk from "@/components/BuyDesk";
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
  title: `Buy $${SHIT_SYMBOL}`,
  description: `Buy $${SHIT_SYMBOL} with card (Crossmint) or SOL. Withdraw to any Solana wallet.`,
  path: "/swap",
});

/** Buy-only desk. Route stays /swap for old links. */
export default function SwapPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 lg:px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-8 lg:py-10 space-y-5 lg:space-y-6">
      <header className="max-w-2xl space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight">
          <span className="neon-text">Buy</span>
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base leading-snug">
          Get ${SHIT_SYMBOL} with <strong className="text-zinc-200">card</strong>{" "}
          or <strong className="text-zinc-200">SOL</strong>. Selling is off —
          withdraw to your own wallet to move bags.
        </p>
        <p className="text-xs text-zinc-600">
          Free drops?{" "}
          <Link href="/claim" className="text-neon-blue hover:underline">
            Claim rewards
          </Link>
        </p>
      </header>

      <BuyDesk />

      {/* Addresses — collapsed on all sizes so they don't dominate */}
      <details className="group rounded-xl border border-border bg-card/80 open:bg-card">
        <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-zinc-300 hover:text-white">
          <span>Contract addresses</span>
          <span className="text-zinc-600 text-xs font-mono group-open:rotate-180 transition-transform">
            ▾
          </span>
        </summary>
        <div className="px-4 pb-4 space-y-3 border-t border-border/60 pt-3">
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
        </div>
      </details>
    </div>
  );
}
