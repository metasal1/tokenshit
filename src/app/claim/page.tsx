import ClaimPanel from "@/components/ClaimPanel";
import GlobalTreasuryBanner from "@/components/GlobalTreasuryBanner";
import ShareRefButton from "@/components/ShareRefButton";
import EmailCaptureCard from "@/components/EmailCaptureCard";
import WalletAddressCard from "@/components/WalletAddressCard";
import CopyableAddress from "@/components/CopyableAddress";
import OnrampButton from "@/components/OnrampButton";
import Link from "next/link";
import type { Metadata } from "next";
import {
  CLAIM_GH_FORK,
  CLAIM_X_FOLLOW,
  CLAIM_X_TWEET,
  CLAIM_X_VERIFIED,
  CLAIM_EMAIL_LIST,
  GH_FORK_UPSTREAM,
  GLOBAL_TREASURY_DAILY_DROP,
  REFERRAL_REWARD_SHIT,
  SHIT_MINT,
  SHIT_SYMBOL,
  TREASURY_ADDRESS,
  X_HANDLE,
  treasurySolscanUrl,
} from "@/lib/shit-token";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: `Claim $${SHIT_SYMBOL}`,
  description: `Tweet+tag @${X_HANDLE}, follow, claim verified/fork rewards. Global treasury +1M daily @ 00:00 UTC.`,
  path: "/claim",
});

export default function ClaimPage() {
  const rewards = [
    { label: `Tweet @${X_HANDLE}`, amt: CLAIM_X_TWEET },
    { label: `Follow @${X_HANDLE}`, amt: CLAIM_X_FOLLOW },
    { label: "Join list", amt: CLAIM_EMAIL_LIST },
    { label: "X verified", amt: CLAIM_X_VERIFIED },
    { label: "GH fork", amt: CLAIM_GH_FORK },
    { label: "Per referral", amt: REFERRAL_REWARD_SHIT },
    { label: "Daily UTC 0", amt: GLOBAL_TREASURY_DAILY_DROP },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-3 sm:px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10 space-y-4 sm:space-y-6">
      <header className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
          <span className="emoji mr-1.5" aria-hidden>
            🎁
          </span>
          <span className="neon-text">Claim</span>
          <span className="text-white"> ${SHIT_SYMBOL}</span>
        </h1>
        <p className="text-zinc-400 text-sm leading-snug sm:leading-relaxed">
          One-time social drops + referrals. Treasury tops up every day at 00:00
          UTC.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/swap"
            className="inline-flex items-center gap-1.5 rounded-lg border border-neon/40 bg-neon/10 px-3 py-2 text-xs font-semibold text-neon hover:bg-neon/20 transition-colors"
          >
            <span className="emoji" aria-hidden>
              🔁
            </span>
            Buy / swap →
          </Link>
        </div>

        <OnrampButton variant="full" amount="0.3" />

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

      <GlobalTreasuryBanner />
      <WalletAddressCard />
      <EmailCaptureCard source="claim-page" />
      <ShareRefButton path="/" />
      <ClaimPanel />

      <section className="rounded-xl border border-border bg-card p-3.5 sm:p-4 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Addresses</h2>
        <CopyableAddress
          address={SHIT_MINT}
          label={`$${SHIT_SYMBOL} mint`}
          explorer={`https://solscan.io/token/${SHIT_MINT}`}
        />
        <CopyableAddress
          address={TREASURY_ADDRESS}
          label="Treasury"
          explorer={treasurySolscanUrl()}
        />
        <p className="text-[11px] text-zinc-600 font-mono break-all">
          fork {GH_FORK_UPSTREAM}
        </p>
      </section>
    </div>
  );
}
