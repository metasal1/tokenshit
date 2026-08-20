import ClaimPanel from "@/components/ClaimPanel";
import WithdrawPanel from "@/components/WithdrawPanel";
import Link from "next/link";
import type { Metadata } from "next";
import { EmojiIcon } from "@/components/EmojiIcon";
import { SHIT_SYMBOL, X_HANDLE } from "@/lib/shit-token";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: `Claim $${SHIT_SYMBOL}`,
  description: `Tweet+tag @${X_HANDLE}, follow, claim verified rewards. Global treasury tops up daily @ 00:00 UTC.`,
  path: "/claim",
  og: "claim",
});

export default function ClaimPage() {
  return (
    <div className="flex flex-col pb-10 md:pb-14">
      <header className="relative border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neon/[0.07] via-transparent to-transparent" />
        <div className="relative mx-auto w-full max-w-xl px-4 sm:px-5 pt-6 sm:pt-8 pb-4 sm:pb-5">
          <p className="text-[10px] font-orbitron uppercase tracking-[0.22em] text-neon mb-1">
            Rewards
          </p>
          <h1 className="text-3xl sm:text-4xl font-monoton leading-none text-white flex items-center gap-2">
            <EmojiIcon size={32}>🎁</EmojiIcon>
            <span>
              <span className="neon-text">Claim</span> ${SHIT_SYMBOL}
            </span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500 max-w-md leading-relaxed">
            Login with X · grab free ${SHIT_SYMBOL} · one clean feed.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-orbitron uppercase tracking-wider text-zinc-500">
            <Link href="/play" className="hover:text-neon">
              Play
            </Link>
            <span className="text-zinc-700">·</span>
            <Link href="/kols" className="hover:text-neon">
              Scout KOLs
            </Link>
            <span className="text-zinc-700">·</span>
            <Link href="/swap" className="hover:text-neon">
              Buy
            </Link>
            <span className="text-zinc-700">·</span>
            <Link href="/referrals" className="hover:text-neon">
              Refer
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-xl px-4 sm:px-5 pt-5 sm:pt-6 space-y-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <ClaimPanel />
        <details className="rounded-xl border border-border bg-card/60 open:bg-card group">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-zinc-300 flex items-center justify-between">
            <span>Withdraw / move tokens</span>
            <span className="text-zinc-600 text-xs font-orbitron uppercase group-open:rotate-180 transition">
              ▾
            </span>
          </summary>
          <div className="px-3 pb-3">
            <WithdrawPanel defaultAsset="shit" compact />
          </div>
        </details>
      </div>
    </div>
  );
}
