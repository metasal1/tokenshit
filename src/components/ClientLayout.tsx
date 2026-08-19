'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth/solana';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import BetaScrollBanner from '@/components/BetaScrollBanner';
import InAppBrowserBanner from '@/components/InAppBrowserBanner';
import ClaimGlitchToast from '@/components/ClaimGlitchToast';
import SettlementWitness from '@/components/SettlementWitness';
import SafeLoginButton from '@/components/SafeLoginButton';
import PwaLoginSheetHost from '@/components/PwaLoginSheetHost';
import { SolanaFundingBootstrap } from '@/components/OnrampButton';
import { useSafeLogin } from '@/hooks/useSafeLogin';
import { isStandalonePwa } from '@/lib/pwa-auth';
import { TREASURY_ADDRESS, treasurySolscanUrl } from '@/lib/shit-token';
import { getPrivyConfig } from '@/lib/privy-config';
import { pickSolanaAddress } from '@/lib/privy-identity';
import WalletSheet from '@/components/WalletSheet';
import {
  MOBILE_DOCK,
  SITE_NAV,
  navIsActive,
  type NavItem,
} from '@/lib/site-nav';

function navLinkClass(active: boolean, accent?: NavItem["accent"]) {
  if (active) {
    if (accent === "neon") return "text-neon";
    if (accent === "amber") return "text-amber-300";
    return "text-white";
  }
  return "text-zinc-400 hover:text-foreground";
}


function ReferralTracker() {
  const { authenticated, user, getAccessToken } = usePrivy();
  const { wallets } = useWallets();

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
            referredWallet: pickSolanaAddress(wallets, user),
          }),
        });
        localStorage.removeItem('tokenshit_referrer');
      } catch {
        /* ignore */
      }
    })();
  }, [authenticated, user, getAccessToken, wallets]);

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
  const { ready, authenticated, user, logout, linkTwitter, linkGithub } = usePrivy();
  const { wallets } = useWallets();
  const { loginWithTwitter } = useSafeLogin();
  const [showWallet, setShowWallet] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [pwa, setPwa] = useState(false);
  useEffect(() => setPwa(isStandalonePwa()), []);
  useEffect(() => {
    const open = () => {
      setShowMenu(false);
      setShowWallet(true);
    };
    window.addEventListener("tokenshit:open-wallet", open);
    return () => window.removeEventListener("tokenshit:open-wallet", open);
  }, []);

  if (!ready) return null;

  if (authenticated && user) {
    const twitterHandle = user.twitter?.username;
    const githubHandle = user.github?.username;
    const walletAddress = pickSolanaAddress(wallets, user);
    const displayLabel = twitterHandle
      ? `@${twitterHandle}`
      : githubHandle
        ? `gh/${githubHandle}`
        : "Connected";

    return (
      <div className="relative z-[80]">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-xs px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
        >
          {displayLabel}
        </button>

        {showMenu && (
          <>
          <button
            type="button"
            className="fixed inset-0 z-[85] cursor-default"
            aria-label="Close account menu"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-[90] min-w-[160px] rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/80">
            {walletAddress && (
              <button
                onClick={() => {
                  setShowWallet(true);
                  setShowMenu(false);
                }}
                className="w-full text-left text-xs px-4 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors rounded-t-lg"
              >
                Wallet
              </button>
            )}
            {!twitterHandle && (
              <button
                onClick={() => {
                  setShowMenu(false);
                  // PWA: full-page OAuth; browser: Privy link modal
                  if (pwa) void loginWithTwitter();
                  else linkTwitter();
                }}
                className="w-full text-left text-xs px-4 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Link X
              </button>
            )}
            {!githubHandle && (
              <button
                onClick={() => {
                  linkGithub();
                  setShowMenu(false);
                }}
                className="w-full text-left text-xs px-4 py-2.5 text-neon hover:bg-zinc-800 transition-colors font-semibold"
              >
                + Link GitHub
              </button>
            )}
            <button
              onClick={() => {
                logout();
                setShowMenu(false);
              }}
              className="w-full text-left text-xs px-4 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors rounded-b-lg"
            >
              Log out
            </button>
          </div>
          </>
        )}

        {showWallet && walletAddress && (
          <WalletSheet
            address={walletAddress}
            twitterUsername={twitterHandle || undefined}
            onClose={() => setShowWallet(false)}
          />
        )}
      </div>
    );
  }

  return <SafeLoginButton variant="nav" label="Log in" />;
}

function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  const primary = SITE_NAV.filter((n) => n.primary);
  const more = SITE_NAV.filter((n) => !n.primary);

  const nav = (
    <CanvasHeaderFx>
    <nav className="sticky top-0 z-[70] border-b border-border bg-background/95 backdrop-blur-xl pt-[env(safe-area-inset-top,0px)]">
      <HeaderTicker />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3">
        <Link href="/" className="flex items-center group shrink-0" aria-label="TOKEN$HIT home">
          <AnimatedLogo size="nav" />
        </Link>

        {/* Desktop — primary product order */}
        <div className="hidden md:flex items-center gap-1 lg:gap-1.5 text-[11px] lg:text-xs text-zinc-400 font-orbitron tracking-wide uppercase min-w-0">
          {primary.map((item) => {
            const active = navIsActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2 lg:px-2.5 py-1.5 rounded-md transition-colors ${navLinkClass(active, item.accent)} ${
                  active ? "bg-white/5" : "hover:bg-white/[0.03]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* More */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className={`px-2 lg:px-2.5 py-1.5 rounded-md transition-colors ${
                more.some((m) => navIsActive(pathname, m))
                  ? "text-white bg-white/5"
                  : "text-zinc-400 hover:text-foreground hover:bg-white/[0.03]"
              }`}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
            >
              More
              <span className="ml-0.5 opacity-60" aria-hidden>
                ▾
              </span>
            </button>
            {moreOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  aria-label="Close menu"
                  onClick={() => setMoreOpen(false)}
                />
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-1 z-50 min-w-[10.5rem] rounded-xl border border-border bg-zinc-950/98 shadow-2xl py-1 backdrop-blur-xl"
                >
                  {more.map((item) => {
                    const active = navIsActive(pathname, item);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        onClick={() => setMoreOpen(false)}
                        className={`block px-3.5 py-2 text-[11px] font-orbitron uppercase tracking-wide transition-colors ${
                          active
                            ? "text-neon bg-neon/10"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                        }`}
                      >
                        <span className="flex w-full items-center justify-between gap-2">
                          <span>{item.label}</span>
                          {item.badge ? (
                            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 font-orbitron text-[9px] uppercase tracking-wider text-amber-300">
                              {item.badge}
                            </span>
                          ) : null}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="w-px h-4 bg-zinc-800 mx-0.5 shrink-0" aria-hidden />
          <ShitBalanceBadge />
          <XFollowersBadge compact />
          <ShareRefButton variant="compact" path="/" showLogin={false} />
          <SfxMuteToggle />
          {mounted && <LoginButton />}
        </div>

        {/* Tablet / phone top bar */}
        <div className="flex md:hidden items-center gap-1.5">
          <ShitBalanceBadge />
          {mounted && <LoginButton />}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg border border-transparent hover:border-border"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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

      {/* Mobile / tablet full menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background/98 backdrop-blur-xl px-3 py-3 space-y-1">
          <p className="px-2 pb-1 text-[9px] font-orbitron uppercase tracking-[0.18em] text-zinc-600">
            Menu
          </p>
          {SITE_NAV.map((item) => {
            const active = navIsActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-orbitron tracking-wide uppercase transition-colors ${
                  active
                    ? item.accent === "neon"
                      ? "bg-neon/15 text-neon"
                      : item.accent === "amber"
                        ? "bg-amber-500/15 text-amber-300"
                        : "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 font-orbitron text-[9px] uppercase tracking-wider text-amber-300">
                      {item.badge}
                    </span>
                  ) : null}
                </span>
                {active && <span className="text-[10px] opacity-70">●</span>}
              </Link>
            );
          })}
          <div className="flex items-center gap-3 px-2 pt-2 border-t border-border mt-2">
            <XFollowersBadge compact />
            <ShareRefButton variant="compact" path="/" />
            <SfxMuteToggle />
          </div>
        </div>
      )}
    </nav>
    </CanvasHeaderFx>
  );

  return (
    <CanvasShell>
      {nav}
      <InAppBrowserBanner />
      <BetaScrollBanner />
      <SolanaFundingBootstrap />
      <SettlementWitness />
      <ReferralTracker />
      <ClaimGlitchToast />
      <SignupGlitchToast />
      <EmailSignupModal />
      <main className="flex-1 pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        <PageTransition>{children}</PageTransition>
      </main>

      {/* Mobile bottom dock — product order */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom,0px)]"
        aria-label="Primary"
      >
        <div className="grid grid-cols-4 gap-0 max-w-lg mx-auto">
          {MOBILE_DOCK.map((item) => {
            const active = navIsActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-orbitron uppercase tracking-wider transition-colors ${
                  active
                    ? item.accent === "neon"
                      ? "text-neon"
                      : item.accent === "amber"
                        ? "text-amber-300"
                        : "text-white"
                    : "text-zinc-500"
                }`}
              >
                <span
                  className={`h-0.5 w-6 rounded-full mb-0.5 ${
                    active
                      ? item.accent === "neon"
                        ? "bg-neon"
                        : item.accent === "amber"
                          ? "bg-amber-300"
                          : "bg-white"
                      : "bg-transparent"
                  }`}
                  aria-hidden
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <footer className="border-t border-border py-6 text-center text-sm text-zinc-500 font-orbitron tracking-wide hidden md:block">
        <p className="font-sans normal-case tracking-normal">TokenShit — Every token is shit until proven otherwise.</p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-zinc-600 uppercase text-xs">
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
          <span className="text-zinc-700">·</span>
          <Link
            href="/seeker"
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Seeker
          </Link>
          <span className="text-zinc-700">·</span>
          <Link
            href="/terms"
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Terms
          </Link>
          <span className="text-zinc-700">·</span>
          <Link
            href="/privacy"
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Privacy
          </Link>
        </p>
      </footer>
      {/* Compact footer strip on mobile */}
      <footer className="md:hidden border-t border-border py-3 text-center text-[10px] text-zinc-600 font-orbitron tracking-wide mb-[calc(4.25rem+env(safe-area-inset-bottom,0px))]">
        <p className="font-sans normal-case">
          TokenShit ·{" "}
          <Link href="/terms" className="hover:text-zinc-400">
            Terms
          </Link>
          {" · "}
          <Link href="/privacy" className="hover:text-zinc-400">
            Privacy
          </Link>
        </p>
      </footer>
    </CanvasShell>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
  const [redirect, setRedirect] = useState('https://tokenshit.com/auth/oauth-return');
  useEffect(() => {
    setRedirect(`${window.location.origin}/auth/oauth-return`);
  }, []);
  const privyConfig = useMemo(
    () => getPrivyConfig({ oauthRedirectUrl: redirect }),
    [redirect]
  );

  return (
    <PrivyProvider appId={appId} config={privyConfig}>
      <PwaProvider>
        <Layout>{children}</Layout>
        <PwaLoginSheetHost />
      </PwaProvider>
    </PrivyProvider>
  );
}
