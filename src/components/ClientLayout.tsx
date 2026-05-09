'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import AnimatedLogo from '@/components/AnimatedLogo';
import OnlineCounter from '@/components/OnlineCounter';
import PageTransition from '@/components/PageTransition';
import PrivyShell from '@/components/PrivyShell';
import { CATEGORIES } from '@/lib/categories';

const LoginButton = dynamic(() => import('./AuthUI').then(m => ({ default: m.LoginButton })), {
  ssr: false,
});
const ReferralTracker = dynamic(() => import('./AuthUI').then(m => ({ default: m.ReferralTracker })), {
  ssr: false,
});
const EmailSignupModal = dynamic(() => import('./EmailSignupModal'), {
  ssr: false,
});
const ShortcutsModal = dynamic(() => import('./ShortcutsModal'), {
  ssr: false,
});
const SoundToggle = dynamic(() => import('./SoundToggle'), {
  ssr: false,
});
const LoginChime = dynamic(() => import('./LoginChime'), {
  ssr: false,
});

function Layout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  const nav = (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center group shrink-0">
          <AnimatedLogo size="nav" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-4 text-sm text-zinc-400">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <div className="relative" onMouseLeave={() => setCategoryOpen(false)}>
            <button
              onClick={() => setCategoryOpen((v) => !v)}
              onMouseEnter={() => setCategoryOpen(true)}
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              Category
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {categoryOpen && (
              <div className="absolute left-0 top-full pt-1.5 z-50 min-w-[180px]">
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden">
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.key}
                      href={`/c/${c.key}`}
                      className="block px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      onClick={() => setCategoryOpen(false)}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link href="/stats" className="hover:text-foreground transition-colors">Stats</Link>
          <Link href="/referrals" className="hover:text-foreground transition-colors">Referrals</Link>
          <OnlineCounter />
          {mounted && <SoundToggle />}
          {mounted && <LoginButton />}
        </div>

        {/* Mobile nav */}
        <div className="flex sm:hidden items-center gap-2">
          {mounted && <SoundToggle />}
          {mounted && <LoginButton />}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
            aria-label="Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-border bg-background/95 backdrop-blur-xl px-4 py-3 flex flex-col gap-3 text-sm">
          <Link href="/" className="text-zinc-400 hover:text-foreground transition-colors" onClick={() => setMenuOpen(false)}>Home</Link>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 mt-2 font-semibold">Category</p>
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={`/c/${c.key}`}
              className="text-zinc-400 hover:text-foreground transition-colors pl-2"
              onClick={() => setMenuOpen(false)}
            >
              {c.label}
            </Link>
          ))}
          <Link href="/stats" className="text-zinc-400 hover:text-foreground transition-colors mt-2" onClick={() => setMenuOpen(false)}>Stats</Link>
          <Link href="/referrals" className="text-zinc-400 hover:text-foreground transition-colors" onClick={() => setMenuOpen(false)}>Referrals</Link>
          <OnlineCounter />
        </div>
      )}
    </nav>
  );

  return (
    <>
      {nav}
      <ReferralTracker />
      {mounted && <LoginChime />}
      {mounted && <EmailSignupModal />}
      {mounted && <ShortcutsModal />}
      <main className="flex-1"><PageTransition>{children}</PageTransition></main>
      <footer className="border-t border-border py-6 text-center text-sm text-zinc-500">
        <p>TOKENSHIT — Every token is shit until proven otherwise.</p>
        <p className="mt-1 text-zinc-600">
          Data powered by{' '}
          <a href="https://tokens.xyz" className="text-neon-blue hover:underline" target="_blank" rel="noopener noreferrer">
            Tokens.xyz
          </a>
          {' · '}
          <a href="https://x.com/tokenshit_" className="text-neon-blue hover:underline" target="_blank" rel="noopener noreferrer">
            𝕏
          </a>
          {' · '}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('tokenshit:show-shortcuts'))}
            className="text-zinc-500 hover:text-zinc-300 underline-offset-2 hover:underline"
          >
            shortcuts
          </button>
        </p>
      </footer>
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <PrivyShell>
      <Layout>{children}</Layout>
    </PrivyShell>
  );
}
