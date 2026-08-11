import type { Metadata } from "next";
import Link from "next/link";
import AudioTestClient from "@/components/AudioTestClient";
import NotifyTestClient from "@/components/NotifyTestClient";
import PwaClientStatus from "@/components/PwaClientStatus";

export const metadata: Metadata = {
  title: "Test — SFX & notifications · TOKENSHIT",
  description: "Test vote sounds, PWA install, and browser notifications.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-static";

export default function TestPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-3 sm:px-4 py-8 sm:py-12 space-y-10">
      <header className="space-y-2">
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">
          Dev / QA
        </p>
        <h1 className="text-3xl font-black text-white">
          <span className="text-neon">/test</span>
        </h1>
        <p className="text-sm text-zinc-400">
          Audio, notifications, PWA status. Not indexed.
        </p>
        <Link href="/" className="text-xs text-neon-blue hover:underline">
          ← Home
        </Link>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">Vote sounds</h2>
        <AudioTestClient />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">Notifications</h2>
        <NotifyTestClient />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">PWA</h2>
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-zinc-400 space-y-2 font-mono text-xs">
          <p>
            Manifest:{" "}
            <a
              href="/manifest.webmanifest"
              className="text-neon-blue hover:underline"
            >
              /manifest.webmanifest
            </a>
          </p>
          <p>
            Service worker:{" "}
            <a href="/sw.js" className="text-neon-blue hover:underline">
              /sw.js
            </a>
          </p>
          <p className="text-zinc-500">
            Install: browser menu → Add to Home Screen / Install app
          </p>
          <PwaClientStatus />
        </div>
      </section>
    </div>
  );
}
