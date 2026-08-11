import ClaimPanel from "@/components/ClaimPanel";
import BuyShitPanel from "@/components/BuyShitPanel";
import {
  GH_FORK_UPSTREAM,
  SHIT_MINT,
  TOKENOMICS_BLURB,
  TREASURY_ADDRESS,
  CLAIM_GH_FORK,
  CLAIM_X_VERIFIED,
} from "@/lib/shit-token";
import { BUY_FEE_BPS } from "@/lib/buy-fee";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buy & Claim $SHIT — TokenShit",
  description:
    "Buy $SHIT with card (Privy) + 1% treasury fee. Claim if X verified or GH fork.",
};

export default function ClaimPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-black">
          <span className="neon-text">$SHIT</span> buy &amp; claim
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed">{TOKENOMICS_BLURB}</p>
      </header>

      <BuyShitPanel />
      <ClaimPanel />

      <div className="rounded-xl border border-border bg-card p-5 text-sm text-zinc-400 space-y-2 font-mono">
        <div>
          <span className="text-zinc-600">mint </span>
          <span className="break-all text-zinc-200">{SHIT_MINT}</span>
        </div>
        <div>
          <span className="text-zinc-600">treasury </span>
          <span className="break-all text-zinc-200">{TREASURY_ADDRESS}</span>
        </div>
        <div>
          <span className="text-zinc-600">buy fee </span>
          {BUY_FEE_BPS / 100}% → treasury
        </div>
        <div>
          <span className="text-zinc-600">X verified </span>
          {CLAIM_X_VERIFIED.toLocaleString()} $SHIT once
        </div>
        <div>
          <span className="text-zinc-600">fork {GH_FORK_UPSTREAM} </span>
          {CLAIM_GH_FORK.toLocaleString()} $SHIT once
        </div>
      </div>
    </div>
  );
}
