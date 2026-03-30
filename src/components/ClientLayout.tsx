'use client';

import { useEffect, useState, useCallback } from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import Link from 'next/link';
import AnimatedLogo from '@/components/AnimatedLogo';
import OnlineCounter from '@/components/OnlineCounter';
import PageTransition from '@/components/PageTransition';

interface TokenBalance {
  mint: string;
  symbol: string;
  name: string;
  amount: number;
  decimals: number;
  uiAmount: string;
  logoURI?: string;
}

interface UserVote {
  assetId: string;
  vote: string;
  date: string;
}

function WalletPanel({ address, twitterUsername, onClose, children }: { address: string; twitterUsername?: string; onClose: () => void; children?: React.ReactNode }) {
  const [balance, setBalance] = useState<string | null>(null);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [userVotes, setUserVotes] = useState<UserVote[]>([]);
  const [totalUserVotes, setTotalUserVotes] = useState(0);
  const [loadingVotes, setLoadingVotes] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // SOL balance
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

    // Token balances via Helius DAS
    fetch('https://viviyan-bkj12u-fast-mainnet.helius-rpc.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 2, method: 'getAssetsByOwner',
        params: { ownerAddress: address, displayOptions: { showFungible: true, showNativeBalance: false } },
      }),
    })
      .then(r => r.json())
      .then(d => {
        const items = d.result?.items || [];
        const fungible: TokenBalance[] = items
          .filter((item: any) => item.interface === 'FungibleToken' || item.interface === 'FungibleAsset')
          .map((item: any) => {
            const info = item.token_info || {};
            const decimals = info.decimals || 0;
            const rawAmount = info.balance || 0;
            const uiAmount = (rawAmount / Math.pow(10, decimals));
            return {
              mint: item.id,
              symbol: info.symbol || item.content?.metadata?.symbol || '???',
              name: item.content?.metadata?.name || info.symbol || 'Unknown',
              amount: rawAmount,
              decimals,
              uiAmount: uiAmount > 1 ? uiAmount.toLocaleString(undefined, { maximumFractionDigits: 2 }) : uiAmount.toFixed(Math.min(decimals, 6)),
              logoURI: item.content?.links?.image || item.content?.files?.[0]?.uri,
            };
          })
          .filter((t: TokenBalance) => t.amount > 0)
          .sort((a: TokenBalance, b: TokenBalance) => b.amount - a.amount);
        setTokens(fungible);
      })
      .catch(() => {})
      .finally(() => setLoadingTokens(false));

    // User vote history
    if (twitterUsername) {
      fetch(`/api/user-votes?username=${encodeURIComponent(twitterUsername)}`)
        .then(r => r.json())
        .then(d => {
          setUserVotes(d.votes || []);
          setTotalUserVotes(d.total || 0);
        })
        .catch(() => {})
        .finally(() => setLoadingVotes(false));
    } else {
      setLoadingVotes(false);
    }
  }, [address, twitterUsername]);

  const copyAddress = useCallback(() => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [address]);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(address)}&bgcolor=18181b&color=ffffff`;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 max-w-sm w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-semibold text-lg">Your Wallet</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-xl">&times;</button>
        </div>

        {/* QR + Address row */}
        <div className="flex gap-3 items-start mb-4">
          <img src={qrUrl} alt="Wallet QR" className="rounded-lg shrink-0" width={100} height={100} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-zinc-500 mb-1">Solana Address</p>
            <button
              onClick={copyAddress}
              className="w-full text-left text-[10px] text-zinc-300 bg-zinc-800 rounded-md px-2 py-1.5 font-mono break-all hover:bg-zinc-700 transition-colors leading-tight"
            >
              {address}
              <span className="ml-1 text-zinc-500">{copied ? '✓' : '📋'}</span>
            </button>
            <div className="mt-2">
              <p className="text-xs text-zinc-500">SOL Balance</p>
              <p className="text-xl font-bold text-white">
                {balance === null ? '...' : `◎ ${balance}`}
              </p>
            </div>
          </div>
        </div>

        {/* Token Balances */}
        <div>
          <p className="text-xs text-zinc-500 mb-2 font-medium">Token Balances</p>
          {loadingTokens ? (
            <p className="text-xs text-zinc-600 text-center py-3">Loading tokens...</p>
          ) : tokens.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-3">No tokens found</p>
          ) : (
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
              {tokens.map(t => (
                <div key={t.mint} className="flex items-center gap-2 bg-zinc-800/50 rounded-lg px-3 py-2">
                  {t.logoURI ? (
                    <img src={t.logoURI} alt="" className="w-6 h-6 rounded-full shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-zinc-700 shrink-0 flex items-center justify-center text-[8px] text-zinc-400">{t.symbol[0]}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-medium truncate">{t.symbol}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{t.name}</p>
                  </div>
                  <p className="text-xs text-zinc-300 font-mono shrink-0">{t.uiAmount}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vote History */}
        {twitterUsername && (
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 mb-2 font-medium">
              Your Votes {totalUserVotes > 0 && <span className="text-zinc-600">({totalUserVotes} total)</span>}
            </p>
            {loadingVotes ? (
              <p className="text-xs text-zinc-600 text-center py-3">Loading votes...</p>
            ) : userVotes.length === 0 ? (
              <p className="text-xs text-zinc-600 text-center py-3">No votes yet</p>
            ) : (
              <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                {userVotes.map((v, i) => (
                  <a
                    key={i}
                    href={`/token/${v.assetId}`}
                    className="flex items-center gap-2 bg-zinc-800/50 rounded-lg px-3 py-2 hover:bg-zinc-700/50 transition-colors"
                  >
                    <span className="text-base">{v.vote === 'hit' ? '🎯' : '💩'}</span>
                    <span className="text-xs text-zinc-300 font-mono truncate flex-1">{v.assetId.slice(0, 8)}...{v.assetId.slice(-4)}</span>
                    <span className="text-[10px] text-zinc-600 shrink-0">{v.date}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

function ReferralTracker() {
  const { authenticated, user } = usePrivy();

  useEffect(() => {
    // Capture ref param on load
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        localStorage.setItem('tokenshit_referrer', ref.toLowerCase());
      }
    }
  }, []);

  useEffect(() => {
    if (!authenticated || !user) return;
    const referrer = localStorage.getItem('tokenshit_referrer');
    if (!referrer) return;

    const twitterUsername = user.twitter?.username?.toLowerCase();
    if (!twitterUsername) return;
    if (referrer === twitterUsername) {
      localStorage.removeItem('tokenshit_referrer');
      return;
    }

    fetch('/api/referral/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referrerTwitter: referrer,
        referredTwitter: twitterUsername,
        referredWallet: user.wallet?.address || null,
      }),
    })
      .then(() => localStorage.removeItem('tokenshit_referrer'))
      .catch(() => {});
  }, [authenticated, user]);

  return null;
}

function ReferralButton({ twitterUsername }: { twitterUsername?: string }) {
  const [copied, setCopied] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!twitterUsername) return;
    fetch(`/api/referral/stats?username=${encodeURIComponent(twitterUsername)}`)
      .then(r => r.json())
      .then(d => setCount(d.totalReferrals ?? 0))
      .catch(() => {});
  }, [twitterUsername]);

  if (!twitterUsername) return null;

  const link = `https://tokenshit.com/?ref=${twitterUsername}`;
  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 pt-4 border-t border-zinc-800">
      <button
        onClick={copy}
        className="w-full text-left text-xs bg-zinc-800 hover:bg-zinc-700 rounded-lg px-3 py-2.5 transition-colors"
      >
        <span className="text-white font-medium">{copied ? '✓ Link Copied!' : 'Share & Earn 💩'}</span>
        {count !== null && count > 0 && (
          <span className="block text-[10px] text-zinc-500 mt-0.5">You&apos;ve referred {count} degen{count !== 1 ? 's' : ''}</span>
        )}
      </button>
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
          <WalletPanel address={walletAddress} twitterUsername={twitterHandle || undefined} onClose={() => setShowWallet(false)}>
            <ReferralButton twitterUsername={twitterHandle || undefined} />
          </WalletPanel>
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
          <Link href="/referrals" className="hover:text-foreground transition-colors">Referrals</Link>
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
      <main className="flex-1"><PageTransition>{children}</PageTransition></main>
      <footer className="border-t border-border py-6 text-center text-sm text-zinc-500">
        <p>💩 TokenShit — Every token is shit until proven otherwise.</p>
        <p className="mt-1 text-zinc-600">
          Data powered by{' '}
          <a href="https://tokens.xyz" className="text-neon-blue hover:underline" target="_blank" rel="noopener noreferrer">
            Tokens.xyz
          </a>
          {' · '}
          <a href="https://x.com/tokenshit_" className="text-neon-blue hover:underline" target="_blank" rel="noopener noreferrer">
            𝕏
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
