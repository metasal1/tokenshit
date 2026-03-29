'use client';

import { useEffect, useState, useCallback } from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import Link from 'next/link';
import AnimatedLogo from '@/components/AnimatedLogo';
import OnlineCounter from '@/components/OnlineCounter';

function WalletPanel({ address, onClose }: { address: string; onClose: () => void }) {
  const [balance, setBalance] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('https://viviyan-bkj12u-fast-mainnet.helius-rpc.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1, method: 'getBalance', params: [address],
      }),
    })
      .then(r => r.json())
      .then(d => setBalance((d.result?.value / 1e9).toFixed(4)))
      .catch(() => setBalance('Error'));
  }, [address]);

  const copyAddress = useCallback(() => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [address]);

  // Generate QR code URL via quickchart
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}&bgcolor=18181b&color=ffffff`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold text-lg">Your Wallet</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-xl">&times;</button>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-4">
          <img src={qrUrl} alt="Wallet QR" className="rounded-lg" width={180} height={180} />
        </div>

        {/* Address */}
        <div className="mb-4">
          <p className="text-xs text-zinc-500 mb-1">Solana Address</p>
          <button
            onClick={copyAddress}
            className="w-full text-left text-xs text-zinc-300 bg-zinc-800 rounded-md px-3 py-2 font-mono break-all hover:bg-zinc-700 transition-colors"
          >
            {address}
            <span className="ml-2 text-zinc-500">{copied ? '✓' : '📋'}</span>
          </button>
        </div>

        {/* Balance */}
        <div className="text-center">
          <p className="text-xs text-zinc-500 mb-1">SOL Balance</p>
          <p className="text-2xl font-bold text-white">
            {balance === null ? '...' : `◎ ${balance}`}
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [showWallet, setShowWallet] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (!ready) return null;

  if (authenticated && user) {
    const twitterHandle = user.twitter?.username;
    const walletAddress = user.wallet?.address;
    const displayLabel = twitterHandle ? `@${twitterHandle}` : 'Connected';

    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-xs px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
        >
          {displayLabel}
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 min-w-[140px]">
            {walletAddress && (
              <button
                onClick={() => { setShowWallet(true); setShowMenu(false); }}
                className="w-full text-left text-xs px-4 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors rounded-t-lg"
              >
                💰 Wallet
              </button>
            )}
            <button
              onClick={() => { logout(); setShowMenu(false); }}
              className="w-full text-left text-xs px-4 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors rounded-b-lg"
            >
              🚪 Log out
            </button>
          </div>
        )}

        {showWallet && walletAddress && (
          <WalletPanel address={walletAddress} onClose={() => setShowWallet(false)} />
        )}
      </div>
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
        loginMethods: ['twitter'],
        appearance: {
          theme: 'dark',
        },
        embeddedWallets: {
          solana: {
            createOnLogin: 'all-users',
          },
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
