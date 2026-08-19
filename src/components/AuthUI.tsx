'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth/solana';
import { EmojiIcon } from '@/components/EmojiIcon';
import { sfx } from '@/lib/sfx';
import { pickSolanaAddress } from '@/lib/privy-identity';
import WalletSheet from '@/components/WalletSheet';


export function ReferralTracker() {
  const { authenticated, user, getAccessToken } = usePrivy();
  const { wallets } = useWallets();

  useEffect(() => {
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

    getAccessToken().then((token) =>
      fetch('/api/referral/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          referrerTwitter: referrer,
          referredTwitter: twitterUsername,
          referredWallet: pickSolanaAddress(wallets, user),
        }),
      })
    )
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        // Only fire the celebratory toast on a fresh, successful track —
        // not on 409 ("already referred by someone else") or any other failure.
        if (res.ok && data?.success) {
          window.dispatchEvent(
            new CustomEvent('tokenshit:referred', { detail: { referrer } })
          );
          sfx.chime();
        }
        localStorage.removeItem('tokenshit_referrer');
      })
      .catch(() => {});
  }, [authenticated, user, getAccessToken, wallets]);

  return null;
}

function ReferralButton({ twitterUsername }: { twitterUsername?: string }) {
  const [copied, setCopied] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  // Referrals are stored lowercased — match the same casing for lookups and links.
  const handle = twitterUsername?.toLowerCase();

  useEffect(() => {
    if (!handle) return;
    fetch(`/api/referral/stats?username=${encodeURIComponent(handle)}`)
      .then(r => r.json())
      .then(d => setCount(d.totalReferrals ?? 0))
      .catch(() => {});
  }, [handle]);

  if (!handle) return null;

  const link = `https://tokenshit.com/?ref=${handle}`;
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
        <span className="text-white font-medium">{copied ? '✓ Link Copied!' : 'Share & Earn'}</span>
        {count !== null && count > 0 && (
          <span className="block text-[10px] text-zinc-500 mt-0.5">You&apos;ve referred {count} degen{count !== 1 ? 's' : ''}</span>
        )}
      </button>
    </div>
  );
}

export function LoginButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [showWallet, setShowWallet] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (!ready) return null;

  if (authenticated && user) {
    const twitterHandle = user.twitter?.username;
    const walletAddress = pickSolanaAddress(wallets, user);
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
                Wallet
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
          <WalletSheet address={walletAddress} twitterUsername={twitterHandle || undefined} onClose={() => setShowWallet(false)} />
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
