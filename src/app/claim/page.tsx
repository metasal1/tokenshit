import ClaimPanel from "@/components/ClaimPanel";
import GlobalTreasuryBanner from "@/components/GlobalTreasuryBanner";
import ShareRefButton from "@/components/ShareRefButton";
import EmailCaptureCard from "@/components/EmailCaptureCard";
import WalletAddressCard from "@/components/WalletAddressCard";
import WithdrawPanel from "@/components/WithdrawPanel";
import CopyableAddress from "@/components/CopyableAddress";
import OnrampButton from "@/components/OnrampButton";
import Link from "next/link";
import type { Metadata } from "next";
import { EmojiIcon } from "@/components/EmojiIcon";
import {
  CLAIM_GH_FORK,
  CLAIM_X_FOLLOW,
  CLAIM_X_PREMIUM,
  CLAIM_X_TWEET,
  CLAIM_X_VERIFIED,
  CLAIM_EMAIL_LIST,
  CLAIM_JUP_VERIFIED,
  GH_FORK_UPSTREAM,
  GLOBAL_TREASURY_DAILY_DROP,
  PLAY_POT_ADDRESS,
  PLAY_REV_ADDRESS,
  REFERRAL_REWARD_SHIT,
  SHIT_MINT,
  SHIT_SYMBOL,
  TREASURY_ADDRESS,
  X_HANDLE,
  playPotPortfolioUrl,
  playRevPortfolioUrl,
  treasurySolscanUrl,
} from "@/lib/shit-token";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: `Claim $${SHIT_SYMBOL}`,
  description: `Tweet+tag @${X_HANDLE}, follow, claim verified/fork rewards. Global treasury tops up daily @ 00:00 UTC.`,
  path: "/claim",
  og: "claim",
});

const REWARDS = [
  { label: `Tweet @${X_HANDLE}`, amt: CLAIM_X_TWEET, emoji: "🐦" },
  { label: `Follow @${X_HANDLE}`, amt: CLAIM_X_FOLLOW, emoji: "➕" },
  { label: "Join list", amt: CLAIM_EMAIL_LIST, emoji: "✉️" },
  { label: "X verified", amt: CLAIM_X_VERIFIED, emoji: "✅" },
  { label: "X premium", amt: CLAIM_X_PREMIUM, emoji: "💎" },
  { label: "Jupiter VRFD", amt: CLAIM_JUP_VERIFIED, emoji: "🪐" },
  { label: "GH fork", amt: CLAIM_GH_FORK, emoji: "🍴" },
  { label: "Per referral", amt: REFERRAL_REWARD_SHIT, emoji: "🔗" },
  { label: "Daily UTC 0", amt: GLOBAL_TREASURY_DAILY_DROP, emoji: "🏦" },
] as const;

export default function ClaimPage() {
  return (
    <div className="flex flex-col pb-10 md:pb-14 lg:pb-16">
      {/* Hero — match home / referrals / boards */}
      <header className="relative border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neon/[0.09] via-neon/[0.03] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon/30 to-transparent" />

        <div className="relative mx-auto w-full max-w-3xl md:max-w-4xl lg:max-w-6xl px-4 sm:px-5 md:px-6 lg:px-8 pt-5 sm:pt-6 md:pt-8 lg:pt-10 pb-5 sm:pb-6 md:pb-7">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
            <div className="text-center md:text-left min-w-0">
              <p className="text-[10px] font-orbitron uppercase tracking-[0.22em] text-neon mb-1.5">
                Rewards
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-monoton leading-none text-white">
                <span className="inline-flex items-center gap-2">
                  <EmojiIcon size={36}>🎁</EmojiIcon>
                  <span>
                    <span className="neon-text">Claim</span> ${SHIT_SYMBOL}
                  </span>
                </span>
              </h1>
              <p className="mt-2 text-sm md:text-[15px] text-zinc-400 max-w-md mx-auto md:mx-0 leading-relaxed">
                One-time social drops + referrals. Treasury tops up every day at
                00:00 UTC.
              </p>
            </div>

            <nav
              className="flex flex-wrap justify-center md:justify-end gap-2 shrink-0"
              aria-label="Claim shortcuts"
            >
              {(
                [
                  { href: "/swap", label: "Buy", emoji: "💵" },
                  { href: "/play", label: "Play", emoji: "🎯" },
                  { href: "/referrals", label: "Referrals", emoji: "🔗" },
                  { href: "/boards", label: "Boards", emoji: "📊" },
                ] as const
              ).map((q) => (
                <Link
                  key={q.href}
                  href={q.href}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/80 hover:border-neon/40 hover:bg-card px-3 py-2 text-[11px] font-orbitron uppercase tracking-wider text-zinc-300 transition-colors"
                >
                  <EmojiIcon size={14}>{q.emoji}</EmojiIcon>
                  {q.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Reward chips */}
          <div className="mt-5 md:mt-6 -mx-1 overflow-x-auto no-scrollbar">
            <ul className="flex md:flex-wrap gap-2 min-w-max md:min-w-0 px-1 pb-1">
              {REWARDS.map((r) => (
                <li
                  key={r.label}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-3 py-1.5 text-[11px] font-mono text-zinc-300"
                >
                  <EmojiIcon size={12}>{r.emoji}</EmojiIcon>
                  <span className="text-zinc-500">{r.label}</span>
                  <span className="text-neon font-semibold tabular-nums">
                    {r.amt.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl md:max-w-4xl lg:max-w-6xl px-4 sm:px-5 md:px-6 lg:px-8 space-y-4 sm:space-y-5 md:space-y-6 pt-5 sm:pt-6 md:pt-8 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <GlobalTreasuryBanner />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,20rem)] gap-4 md:gap-5 lg:items-start">
          <div className="space-y-4 sm:space-y-5 min-w-0">
            <OnrampButton variant="full" amount="0.3" />
            <WalletAddressCard />
            <EmailCaptureCard source="claim-page" />
            <ShareRefButton path="/" />
            <ClaimPanel />
            <WithdrawPanel defaultAsset="shit" compact />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20">
            <section className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2">
                <EmojiIcon size={16}>📍</EmojiIcon>
                <h2 className="text-sm font-bold font-orbitron uppercase tracking-wide text-zinc-200">
                  Addresses
                </h2>
              </div>
              <CopyableAddress
                address={SHIT_MINT}
                label={`$${SHIT_SYMBOL} mint`}
                explorer={`https://solscan.io/token/${SHIT_MINT}`}
              />
              <CopyableAddress
                address={TREASURY_ADDRESS}
                label="Treasury (claims)"
                explorer={treasurySolscanUrl()}
              />
              <CopyableAddress
                address={PLAY_POT_ADDRESS}
                label="Play pot"
                explorer={playPotPortfolioUrl()}
              />
              <CopyableAddress
                address={PLAY_REV_ADDRESS}
                label="Play rev (house 25%)"
                explorer={playRevPortfolioUrl()}
              />
              <p className="text-[10px] text-zinc-600 font-mono break-all pt-1 border-t border-border">
                fork {GH_FORK_UPSTREAM}
              </p>
            </section>

            <section className="rounded-2xl border border-neon/25 bg-neon/5 p-4 space-y-2">
              <p className="text-[10px] font-orbitron uppercase tracking-[0.16em] text-neon">
                Quick rules
              </p>
              <ul className="text-xs text-zinc-400 space-y-1.5 leading-snug">
                <li>· Login with X · 100+ followers · real PFP</li>
                <li>· Payouts → your Privy Solana wallet</li>
                <li>· 1 major claim (verified / premium / GH) per IP / day</li>
                <li>· Tweet claim every 24h</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
