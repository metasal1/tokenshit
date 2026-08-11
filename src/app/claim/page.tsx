import ClaimPanel from "@/components/ClaimPanel";
import {
  GH_FORK_UPSTREAM,
  SHIT_MINT,
  TOKENOMICS_BLURB,
  TREASURY_ADDRESS,
  CLAIM_GH_FORK,
  CLAIM_X_VERIFIED,
} from "@/lib/shit-token";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claim $SHIT — TokenShit",
  description:
    "Claim treasury $SHIT if your X is verified or you forked solana-foundation/tokens.",
};

export default function ClaimPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-black">
          <span className="neon-text">$SHIT</span> claims
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed">{TOKENOMICS_BLURB}</p>
      </header>

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
