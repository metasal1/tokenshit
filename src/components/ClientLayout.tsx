'use client';

import { useEffect, useState } from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import Link from 'next/link';
import AnimatedLogo from '@/components/AnimatedLogo';
import OnlineCounter from '@/components/OnlineCounter';

function LoginButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) return null;

  if (authenticated && user) {
    // Show truncated wallet address or Twitter handle
    const twitterHandle = user.twitter?.username;
    const walletAddress = user.wallet?.address;
    const displayLabel = twitterHandle
      ? `@${twitterHandle}`
      : walletAddress
      ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
      : 'Connected';

    return (
      <button
        onClick={() => logout()}
        className="text-xs px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
      >
        {displayLabel}
      </button>
    );
  }

  return (
    <button
      onClick={() => login()}
      className="text-xs px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
    >
      Log in
    </button>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
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
          {mounted && <LoginButton />}
        </div>

        {/* Mobile nav */}
        <div className="flex sm:hidden items-center gap-2">
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
          <Link href="/stats" className="text-zinc-400 hover:text-foreground transition-colors" onClick={() => setMenuOpen(false)}>Stats</Link>
          <OnlineCounter />
        </div>
      )}
    </nav>
  );

  return (
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
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['wallet', 'twitter'],
        appearance: {
          theme: 'dark',
        },
        externalWallets: {
          solana: {
            connectors: toSolanaWalletConnectors(),
          },
        },
      }}
    >
      <Layout>{children}</Layout>
    </PrivyProvider>
  );
}
