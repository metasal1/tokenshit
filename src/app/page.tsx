import SearchBar from "@/components/SearchBar";
import AnimatedLogo from "@/components/AnimatedLogo";
import GlobalTreasuryBanner from "@/components/GlobalTreasuryBanner";
import ShareRefButton from "@/components/ShareRefButton";
import HomePlayTeaser from "@/components/HomePlayTeaser";
import CopyableAddress from "@/components/CopyableAddress";
import ScoutPromoBanner from "@/components/ScoutPromoBanner";
import type { Metadata } from "next";
import { EmojiIcon } from "@/components/EmojiIcon";
import { pageMeta } from "@/lib/seo";
import { SHIT_MINT, SHIT_SYMBOL } from "@/lib/shit-token";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...pageMeta({
    title: "TOKEN$HIT — Every token is shit until proven otherwise",
    description: "Play FOR PRIZES. Claim, memes, swap $TOKENSHIT on Solana.",
    path: "/",
    og: "home",
  }),
  title: {
    absolute: "TOKEN$HIT — Every token is shit until proven otherwise",
  },
};

const QUICK = [
  { href: "/play", label: "Play", emoji: "🎯" },
  { href: "/claim", label: "Claim", emoji: "🎁" },
  { href: "/kols", label: "Scout", emoji: "🔍" },
  { href: "/memes", label: "Memes", emoji: "🎨" },
  { href: "/referrals", label: "Refer", emoji: "🔗" },
  { href: "/swap", label: "Buy", emoji: "💳" },
] as const;

export default function Home() {
  return (
    <div className="flex flex-col pb-10 md:pb-14 lg:pb-16">
      <header className="relative border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neon/[0.09] via-neon/[0.03] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon/30 to-transparent" />

        <div className="relative mx-auto w-full max-w-3xl md:max-w-4xl lg:max-w-6xl px-4 sm:px-5 md:px-6 lg:px-8 pt-5 sm:pt-6 md:pt-8 lg:pt-10 pb-5 sm:pb-6 md:pb-7 lg:pb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 md:gap-6 lg:gap-10">
            <div className="text-center md:text-left min-w-0 md:flex-1 md:max-w-md lg:max-w-xl">
              <h1 className="mb-2 md:mb-2.5 lg:mb-3 scale-95 sm:scale-100 origin-center md:origin-left">
                <AnimatedLogo size="hero" />
              </h1>
              <p className="text-sm md:text-[15px] lg:text-base text-zinc-400 max-w-md mx-auto md:mx-0 leading-relaxed">
                Every token is shit until proven otherwise.
              </p>
            </div>

            <div className="w-full md:w-[min(22rem,46%)] lg:w-[min(28rem,42%)] space-y-2.5 md:space-y-3 shrink-0 mx-auto md:mx-0">
              <CopyableAddress
                address={SHIT_MINT}
                label={`${SHIT_SYMBOL} CA`}
                explorer={`https://solscan.io/token/${SHIT_MINT}`}
              />
              <div className="relative z-[60]">
                <SearchBar big />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl md:max-w-4xl lg:max-w-6xl px-4 sm:px-5 md:px-6 lg:px-8 space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 pt-4 sm:pt-5 md:pt-6 lg:pt-8">
        <HomePlayTeaser />

        <nav
          className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-2.5 lg:gap-3"
          aria-label="Quick links"
        >
          {QUICK.map((q) => {
            const scout = q.href === "/kols";
            return (
              <Link
                key={q.href}
                href={q.href}
                className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 min-h-[4rem] md:min-h-[3.5rem] lg:min-h-[3.25rem] rounded-xl border bg-card/80 hover:bg-card hover:shadow-[0_0_24px_rgba(57,255,20,0.08)] transition-all px-1.5 md:px-2 lg:px-3 active:scale-[0.98] ${
                  scout
                    ? "border-neon/60 bg-neon/10 shadow-[0_0_20px_rgba(57,255,20,0.12)]"
                    : "border-border hover:border-neon/40"
                }`}
              >
                <EmojiIcon size={20}>{q.emoji}</EmojiIcon>
                <span
                  className={`text-[10px] md:text-[11px] lg:text-xs font-orbitron uppercase tracking-wider text-center ${
                    scout ? "text-neon font-bold" : "text-zinc-300"
                  }`}
                >
                  {q.label}
                  {scout ? " · 2.5K" : ""}
                </span>
              </Link>
            );
          })}
        </nav>

        <ScoutPromoBanner variant="card" />

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 md:gap-4 md:items-center">
          <GlobalTreasuryBanner compact />
          <div className="md:justify-self-end w-full md:w-auto">
            <ShareRefButton path="/" />
          </div>
        </div>
      </div>
    </div>
  );
}
