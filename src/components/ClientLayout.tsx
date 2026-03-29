'use client';

import { useEffect, useState } from 'react';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { SolanaWalletConnectors } from '@dynamic-labs/solana';
import Link from 'next/link';
import AnimatedLogo from '@/components/AnimatedLogo';
import OnlineCounter from '@/components/OnlineCounter';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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
          <Link href="/stats" className="hover:text-foreground transition-colors">Stats</Link>
          <OnlineCounter />
          {mounted && <DynamicWidget />}
        </div>

        {/* Mobile nav */}
        <div className="flex sm:hidden items-center gap-2">
          {mounted && <DynamicWidget />}
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
          <Link href="/stats" className="text-zinc-400 hover:text-foreground transition-colors" onClick={() => setMenuOpen(false)}>Stats</Link>
          <OnlineCounter />
        </div>
      )}
    </nav>
  );

  const content = (
    <>
      {nav}
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-6 text-center text-sm text-zinc-500">
        <p>💩 TokenShit — Every token is shit until proven otherwise.</p>
        <p className="mt-1 text-zinc-600">
          Data powered by{' '}
          <a href="https://tokens.xyz" className="text-neon-blue hover:underline" target="_blank" rel="noopener noreferrer">
            Tokens.xyz
          </a>
        </p>
      </footer>
    </>
  );

  if (!mounted) return content;

  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || '',
        walletConnectors: [SolanaWalletConnectors],
      }}
    >
      {content}
    </DynamicContextProvider>
  );
}
