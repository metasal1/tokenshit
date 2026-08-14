import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Terms of Use",
  description: "TOKEN$HIT terms of use — product rules, risks, and acceptable use.",
  path: "/terms",
});

export const dynamic = "force-static";

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-10 sm:py-14 space-y-6 text-sm leading-relaxed text-zinc-300">
      <header className="space-y-2">
        <p className="text-[10px] font-orbitron uppercase tracking-[0.2em] text-neon">
          Legal
        </p>
        <h1 className="text-3xl font-monoton text-white leading-none">
          Terms of Use
        </h1>
        <p className="text-xs text-zinc-500">
          Last updated: 14 August 2026 · Site:{" "}
          <Link href="/" className="text-neon-blue hover:underline">
            tokenshit.com
          </Link>
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">1. The product</h2>
        <p>
          TOKEN$HIT (&quot;we&quot;, &quot;the App&quot;) is an entertainment product on Solana.
          Features may include HIT/SHIT voting on registry assets,{" "}
          <strong className="text-zinc-100">$SHIT OF THE DAY</strong> play
          rounds, claims, swaps, memes, and related tools. The App is provided
          as-is for fun and community engagement — not as financial advice.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">2. Not advice</h2>
        <p>
          Nothing on the App is investment, legal, or tax advice. Crypto is
          volatile. You can lose all value. Do your own research. Play and claim
          only what you can afford to lose.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">3. Eligibility</h2>
        <p>
          You must be old enough to use crypto products where you live and able
          to enter a binding agreement. You are responsible for complying with
          local law. We may refuse or limit access (including claims) for abuse,
          fraud, sanctions, or policy violations.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">4. Accounts & wallets</h2>
        <p>
          Login may use Privy (email, X, GitHub) and Solana wallets. You control
          your keys and devices. We never custody your seed phrase. You are
          responsible for wallet security and for transactions you approve.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">5. Tokens & claims</h2>
        <ul className="list-disc list-inside space-y-1 text-zinc-400">
          <li>
            $TOKENSHIT and in-app rewards are experimental utility/meme tokens —
            not equity, deposits, or guaranteed returns.
          </li>
          <li>
            Claim amounts, eligibility (followers, fork, tweet age, etc.), and
            kill switches can change.
          </li>
          <li>
            Play pots use on-chain transfers and VRF-style draws when configured;
            empty pots, failed txs, or network issues can happen.
          </li>
          <li>Treasury operations may pause without notice.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">6. Acceptable use</h2>
        <p>Don&apos;t:</p>
        <ul className="list-disc list-inside space-y-1 text-zinc-400">
          <li>Farm, multi-account, or automate claims/votes against the spirit of the rules</li>
          <li>Attack, scrape abusively, or reverse engineer for exploit</li>
          <li>Impersonate TOKEN$HIT or phish users</li>
          <li>Use the App for illegal activity</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">7. Third parties</h2>
        <p>
          The App may rely on Solana, Privy, Jupiter, Helius, Tokens.xyz, wallet
          apps (including Solana Mobile / Seeker), and other services. Their
          terms and availability are outside our control.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">8. Seeker & mobile</h2>
        <p>
          When installed as a PWA or Solana Mobile dApp Store / TWA build, these
          Terms still apply. Wallet connect and OAuth behave differently in
          standalone mode — see in-app login help.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">9. Disclaimers</h2>
        <p>
          THE APP IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND.
          TO THE MAXIMUM EXTENT PERMITTED BY LAW WE DISCLAIM LIABILITY FOR
          LOSSES FROM USE OF THE APP, SMART CONTRACTS, NETWORK FEES, OR THIRD
          PARTY SERVICES.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">10. Contact</h2>
        <p>
          Bugs:{" "}
          <a
            href="mailto:bugs@tokenshit.com"
            className="text-neon-blue hover:underline"
          >
            bugs@tokenshit.com
          </a>
          · X:{" "}
          <a
            href="https://x.com/Tokenshit_"
            className="text-neon-blue hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            @Tokenshit_
          </a>
        </p>
        <p>
          Privacy:{" "}
          <Link href="/privacy" className="text-neon-blue hover:underline">
            Privacy Policy
          </Link>
        </p>
      </section>
    </article>
  );
}
