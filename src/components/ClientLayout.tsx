'use client';

import { useEffect, useState, useCallback } from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import AnimatedLogo from '@/components/AnimatedLogo';
import PageTransition from '@/components/PageTransition';
import { CanvasShell, CanvasHeaderFx } from '@/components/CanvasShell';
import { TreasuryBalanceBadge } from '@/components/ClaimPanel';
import GlobalTreasuryBanner from '@/components/GlobalTreasuryBanner';
import ShareRefButton from '@/components/ShareRefButton';
import XFollowersBadge from '@/components/XFollowersBadge';
import HeaderTicker from '@/components/HeaderTicker';
import SfxMuteToggle from '@/components/SfxMuteToggle';
import PwaProvider from '@/components/PwaProvider';
import ShitBalanceBadge from '@/components/ShitBalanceBadge';
import EmailSignupModal from '@/components/EmailSignupModal';
import SignupGlitchToast from '@/components/SignupGlitchToast';
import { TREASURY_ADDRESS, treasurySolscanUrl } from '@/lib/shit-token';
import { getPrivyConfig } from '@/lib/privy-config';

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
              <span className="ml-1 text-zinc-500">{copied ? "ok" : "copy"}</span>
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
  const { authenticated, user, getAccessToken } = usePrivy();

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

    (async () => {
      try {
        const token = await getAccessToken();
        await fetch('/api/referral/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            referrerTwitter: referrer,
            referredTwitter: twitterUsername,
            referredWallet: user.wallet?.address || null,
          }),
        });
        localStorage.removeItem('tokenshit_referrer');
      } catch {
        /* ignore */
      }
    })();
  }, [authenticated, user, getAccessToken]);

  return null;
}

function ReferralButton({ twitterUsername }: { twitterUsername?: string }) {
  return (
    <div className="mt-4 pt-4 border-t border-zinc-800">
      <ShareRefButton
        handle={twitterUsername || null}
        path="/"
        variant="full"
        className="!border-0 !bg-transparent !p-0 !rounded-none"
      />
    </div>
  );
}

function LoginButton() {
  const { ready, authenticated, user, login, logout, linkTwitter, linkGithub } = usePrivy();
  const [showWallet, setShowWallet] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (!ready) return null;

  if (authenticated && user) {
    const twitterHandle = user.twitter?.username;
    const githubHandle = user.github?.username;
    const walletAddress = user.wallet?.address;
    const displayLabel = twitterHandle
      ? `@${twitterHandle}`
      : githubHandle
        ? `gh/${githubHandle}`
        : "Connected";

    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-xs px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
        >
          {displayLabel}
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 min-w-[160px]">
            {walletAddress && (
              <button
                onClick={() => { setShowWallet(true); setShowMenu(false); }}
                className="w-full text-left text-xs px-4 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors rounded-t-lg"
              >
                Wallet
              </button>
            )}
            {!twitterHandle && (
              <button
                onClick={() => { linkTwitter(); setShowMenu(false); }}
                className="w-full text-left text-xs px-4 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Link X
              </button>
            )}
            {!githubHandle && (
              <button
                onClick={() => { linkGithub(); setShowMenu(false); }}
                className="w-full text-left text-xs px-4 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Link GitHub
              </button>
            )}
            <button
              onClick={() => { logout(); setShowMenu(false); }}
              className="w-full text-left text-xs px-4 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors rounded-b-lg"
            >
              Log out
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
    <CanvasHeaderFx>
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <HeaderTicker />
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center group shrink-0">
          <AnimatedLogo size="nav" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-4 text-sm text-zinc-400">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link href="/stats" className="hover:text-foreground transition-colors">Stats</Link>
          <Link href="/swap" className="hover:text-foreground transition-colors">Swap</Link>
          <Link href="/claim" className="hover:text-foreground transition-colors">Claim</Link>
          <Link href="/referrals" className="hover:text-foreground transition-colors">Referrals</Link>
          <ShitBalanceBadge />
          <XFollowersBadge compact />
          <ShareRefButton variant="compact" path="/" showLogin={false} />
          <SfxMuteToggle />
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
          <Link href="/swap" className="text-zinc-400 hover:text-foreground transition-colors" onClick={() => setMenuOpen(false)}>Swap</Link>
          <Link href="/claim" className="text-zinc-400 hover:text-foreground transition-colors" onClick={() => setMenuOpen(false)}>Claim</Link>
          <Link href="/referrals" className="text-zinc-400 hover:text-foreground transition-colors" onClick={() => setMenuOpen(false)}>Referrals</Link>
          <ShitBalanceBadge />
          <XFollowersBadge compact />
          <ShareRefButton variant="compact" path="/" />
        </div>
      )}
    </nav>
    </CanvasHeaderFx>
  );

  return (
    <CanvasShell>
      {nav}
      <ReferralTracker />
      <EmailSignupModal />
      <SignupGlitchToast />
      <main className="flex-1"><PageTransition>{children}</PageTransition></main>
      <footer className="border-t border-border py-6 text-center text-sm text-zinc-500">
        <p>TokenShit — Every token is shit until proven otherwise.</p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-zinc-600">
          <TreasuryBalanceBadge />
          <span className="text-zinc-700">·</span>
          <a href="https://tokens.xyz" className="text-neon-blue hover:underline" target="_blank" rel="noopener noreferrer">
            Powered by Tokens.xyz
          </a>
          <span className="text-zinc-700">·</span>
          <a
            href="https://github.com/solana-foundation/tokens"
            className="inline-flex items-center text-zinc-500 hover:text-zinc-200 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Solana Foundation tokens registry on GitHub"
            title="GitHub · solana-foundation/tokens"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.29 0 .32.21.7.82.58C20.56 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z" />
            </svg>
          </a>
          <span className="text-zinc-700">·</span>
          <a
            href={treasurySolscanUrl()}
            className="text-zinc-500 hover:text-zinc-300 transition-colors font-mono text-xs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Treasury
          </a>
          <span className="text-zinc-700">·</span>
          <Link
            href="/brand"
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Brand
          </Link>
        </p>
      </footer>
    </CanvasShell>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';

  return (
    <PrivyProvider appId={appId} config={getPrivyConfig()}>
      <PwaProvider>
        <Layout>{children}</Layout>
      </PwaProvider>
    </PrivyProvider>
  );
}
