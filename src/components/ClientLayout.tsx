'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import AnimatedLogo from '@/components/AnimatedLogo';
import OnlineCounter from '@/components/OnlineCounter';
import PageTransition from '@/components/PageTransition';
import PrivyShell from '@/components/PrivyShell';
import { ChevronDown, Menu, X } from 'lucide-react';
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
const ReferralToast = dynamic(() => import('./ReferralToast'), {
  ssr: false,
});

function Layout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState<number | null>(null);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted) return;
    fetch('/api/category-counts')
      .then((r) => r.json())
      .then((d) => {
        setCounts(d?.counts || {});
        setTotal(typeof d?.total === 'number' ? d.total : null);
      })
      .catch(() => {});
  }, [mounted]);

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
              <ChevronDown className="w-3 h-3" strokeWidth={2.5} />
            </button>
            {categoryOpen && (
              <div className="absolute left-0 top-full pt-1.5 z-50 min-w-[200px]">
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden">
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.key}
                      href={`/c/${c.key}`}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      onClick={() => setCategoryOpen(false)}
                    >
                      <span>{c.label}</span>
                      <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
                        {counts[c.key] != null ? counts[c.key] : '·'}
                      </span>
                    </Link>
                  ))}
                  <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm text-neon border-t border-zinc-800 bg-neon/5">
                    <span className="font-semibold">Total</span>
                    <span className="text-[11px] font-mono tabular-nums">
                      {total != null ? total : '·'}
                    </span>
                  </div>
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
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
              className="flex items-center justify-between text-zinc-400 hover:text-foreground transition-colors pl-2 pr-1"
              onClick={() => setMenuOpen(false)}
            >
              <span>{c.label}</span>
              <span className="text-[11px] font-mono text-zinc-600 tabular-nums">
                {counts[c.key] != null ? counts[c.key] : '·'}
              </span>
            </Link>
          ))}
          <div className="flex items-center justify-between text-neon pl-2 pr-1 pt-1 border-t border-zinc-800 mt-1">
            <span className="font-semibold text-sm">Total</span>
            <span className="text-[11px] font-mono tabular-nums">
              {total != null ? total : '·'}
            </span>
          </div>
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
      {mounted && <ReferralToast />}
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
