import ClaimPanel from "@/components/ClaimPanel";
import BuyShitPanel from "@/components/BuyShitPanel";
import {
  CLAIM_GH_FORK,
  CLAIM_X_FOLLOW,
  CLAIM_X_TWEET,
  CLAIM_X_VERIFIED,
  GH_FORK_UPSTREAM,
  REFERRAL_REWARD_SHIT,
  SHIT_MINT,
  SHIT_SYMBOL,
  TREASURY_ADDRESS,
  X_HANDLE,
} from "@/lib/shit-token";
import { BUY_FEE_BPS } from "@/lib/buy-fee";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Buy & Claim $${SHIT_SYMBOL} — TokenShit`,
  description: `Buy $${SHIT_SYMBOL}, tweet+tag @${X_HANDLE}, follow, claim verified/fork rewards.`,
};

function short(addr: string, n = 4) {
  return `${addr.slice(0, n)}…${addr.slice(-n)}`;
}

export default function ClaimPage() {
  const rewards = [
    { label: `Tweet @${X_HANDLE}`, amt: CLAIM_X_TWEET },
    { label: `Follow @${X_HANDLE}`, amt: CLAIM_X_FOLLOW },
    { label: "X verified", amt: CLAIM_X_VERIFIED },
    { label: "GH fork", amt: CLAIM_GH_FORK },
    { label: "Per referral", amt: REFERRAL_REWARD_SHIT },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-3 sm:px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10 space-y-4 sm:space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
          <span className="neon-text">${SHIT_SYMBOL}</span>
          <span className="text-white"> buy & claim</span>
        </h1>
        <p className="text-zinc-400 text-sm leading-snug sm:leading-relaxed">
          Card → SOL → swap. One-time treasury drops for tweet, follow, verified
          X, and GH fork.
        </p>

        {/* Reward chips — horizontal scroll on mobile */}
        <div className="-mx-3 px-3 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar">
          <ul className="flex sm:flex-wrap gap-2 min-w-max sm:min-w-0 pb-1">
            {rewards.map((r) => (
              <li
                key={r.label}
                className="shrink-0 rounded-full border border-zinc-700/80 bg-zinc-900/80 px-3 py-1.5 text-xs font-mono text-zinc-300"
              >
                <span className="text-zinc-500">{r.label}</span>{" "}
                <span className="text-neon font-semibold">
                  {r.amt.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <BuyShitPanel />
      <ClaimPanel />

      <details className="rounded-xl border border-border bg-card overflow-hidden group">
        <summary className="cursor-pointer list-none px-4 py-3.5 text-sm font-semibold text-zinc-200 flex items-center justify-between gap-2 select-none [&::-webkit-details-marker]:hidden">
          <span>Details</span>
          <span className="text-zinc-500 text-xs font-mono group-open:hidden">
            mint · treasury · fees
          </span>
          <span className="text-zinc-500 text-xs font-mono hidden group-open:inline">
            hide
          </span>
        </summary>
        <div className="px-4 pb-4 space-y-2.5 text-xs sm:text-sm text-zinc-400 font-mono border-t border-border/60 pt-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-zinc-600">mint</span>
            <a
              href={`https://solscan.io/token/${SHIT_MINT}`}
              className="break-all text-zinc-200 hover:text-neon active:text-neon"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sm:hidden">{short(SHIT_MINT, 6)}</span>
              <span className="hidden sm:inline">{SHIT_MINT}</span>
            </a>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-zinc-600">treasury</span>
            <a
              href={`https://solscan.io/account/${TREASURY_ADDRESS}`}
              className="break-all text-zinc-200 hover:text-neon active:text-neon"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sm:hidden">{short(TREASURY_ADDRESS, 6)}</span>
              <span className="hidden sm:inline">{TREASURY_ADDRESS}</span>
            </a>
          </div>
          <div>
            <span className="text-zinc-600">buy fee </span>
            {BUY_FEE_BPS / 100}% → treasury
          </div>
          <div className="text-zinc-500 break-all">
            fork {GH_FORK_UPSTREAM}
          </div>
        </div>
      </details>
    </div>
  );
}
