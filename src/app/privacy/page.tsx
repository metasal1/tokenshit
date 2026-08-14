import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Privacy Policy",
  description:
    "TOKEN$HIT privacy policy — what we collect, how we use it, and your choices.",
  path: "/privacy",
});

export const dynamic = "force-static";

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-10 sm:py-14 space-y-6 text-sm leading-relaxed text-zinc-300">
      <header className="space-y-2">
        <p className="text-[10px] font-orbitron uppercase tracking-[0.2em] text-neon">
          Legal
        </p>
        <h1 className="text-3xl font-monoton text-white leading-none">
          Privacy Policy
        </h1>
        <p className="text-xs text-zinc-500">
          Last updated: 14 August 2026 · Site:{" "}
          <Link href="/" className="text-neon-blue hover:underline">
            tokenshit.com
          </Link>
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">1. Overview</h2>
        <p>
          TOKEN$HIT (&quot;we&quot;) runs tokenshit.com and related apps (PWA,
          Seeker / dApp Store builds). This policy describes data we process
          when you use the product.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">2. Data we process</h2>
        <ul className="list-disc list-inside space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-200">Account / auth</strong> — via
            Privy: email, X handle, GitHub username, linked Solana wallet
            addresses, and session tokens.
          </li>
          <li>
            <strong className="text-zinc-200">On-chain</strong> — public Solana
            addresses, balances, and transaction signatures you create (visible
            on explorers).
          </li>
          <li>
            <strong className="text-zinc-200">Product activity</strong> — votes,
            play entries, claims metadata, referrals, email list signup, basic
            abuse/rate-limit signals (e.g. IP hashes where needed).
          </li>
          <li>
            <strong className="text-zinc-200">Device / analytics</strong> —
            Google Analytics 4 (measurement ID on site), approximate device and
            usage metrics. PWA may use local storage for prefs (SFX mute,
            install dismiss, celebrate flags).
          </li>
          <li>
            <strong className="text-zinc-200">Support</strong> — messages you
            send to bugs@tokenshit.com or social channels.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">3. How we use data</h2>
        <ul className="list-disc list-inside space-y-1 text-zinc-400">
          <li>Run votes, play, claims, swaps, and referrals</li>
          <li>Prevent fraud and multi-account abuse</li>
          <li>Improve product performance and fix bugs</li>
          <li>Optional marketing list (email) if you join</li>
          <li>Comply with law and enforce Terms</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">4. Processors</h2>
        <p className="text-zinc-400">
          Typical vendors: Privy (auth/wallets), Cloudflare (hosting), Turso
          (app DB), Helius (RPC), Jupiter (swaps), Resend (email list), Google
          Analytics, X/GitHub (if you connect). On-chain data is public by
          design.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">5. Cookies & local storage</h2>
        <p>
          We use essential storage for sessions and prefs, and analytics cookies
          / identifiers where GA is loaded. You can clear site data in the
          browser or OS settings.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">6. Retention</h2>
        <p>
          We keep operational records as long as needed to run the product,
          prevent abuse, and meet legal duties. On-chain history is permanent.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">7. Your choices</h2>
        <ul className="list-disc list-inside space-y-1 text-zinc-400">
          <li>Disconnect wallet / log out</li>
          <li>Unlink social accounts in Privy where available</li>
          <li>Unsubscribe from email list via provider tools or contact us</li>
          <li>Request deletion of off-chain account rows where feasible</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">8. Children</h2>
        <p>
          The App is not directed at children under 13 (or higher age where
          required). Do not use the App if you are under the applicable age.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">9. International</h2>
        <p>
          Infrastructure may process data in the US and other regions. By using
          the App you understand cross-border processing may occur.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">10. Contact</h2>
        <p>
          Privacy questions:{" "}
          <a
            href="mailto:bugs@tokenshit.com"
            className="text-neon-blue hover:underline"
          >
            bugs@tokenshit.com
          </a>
        </p>
        <p>
          Terms:{" "}
          <Link href="/terms" className="text-neon-blue hover:underline">
            Terms of Use
          </Link>
        </p>
      </section>
    </article>
  );
}
