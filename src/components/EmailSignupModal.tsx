'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { X } from 'lucide-react';
import { sfx } from '@/lib/sfx';

const STORAGE_KEY = 'tokenshit_email_state';
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

type EmailState = { collected?: boolean; dismissedAt?: number };

function readState(): EmailState {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeState(s: EmailState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export default function EmailSignupModal() {
  const { ready, authenticated, user } = usePrivy();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !authenticated || !user) {
      setOpen(false);
      return;
    }
    const state = readState();
    if (state.collected) return;
    if (state.dismissedAt && Date.now() - state.dismissedAt < DISMISS_COOLDOWN_MS) return;

    // Prefill if Privy has an email already
    const privyEmail = user.email?.address;
    if (privyEmail) setEmail(privyEmail);

    const t = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(t);
  }, [ready, authenticated, user]);

  if (!open || !user) return null;

  const close = (dismissed: boolean) => {
    if (dismissed) writeState({ ...readState(), dismissedAt: Date.now() });
    setOpen(false);
  };

  const submit = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid email');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          twitterHandle: user.twitter?.username || null,
          walletAddress: user.wallet?.address || null,
          privyId: user.id,
          source: 'post-login-modal',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setSubmitting(false);
        return;
      }
      writeState({ ...readState(), collected: true });
      setDone(true);
      sfx.chime();
      window.setTimeout(() => setOpen(false), 1500);
    } catch {
      setError('Network error');
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-start justify-center pt-20 sm:pt-32 bg-black/60 backdrop-blur-sm"
      onClick={() => close(true)}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-white font-semibold text-lg">
            {done ? '✓ You’re in' : 'Stay in the loop'}
          </h3>
          <button
            onClick={() => close(true)}
            className="text-zinc-400 hover:text-white transition-colors -mt-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <p className="text-sm text-zinc-300">
            Welcome email sent. See you on the leaderboard, degen.
          </p>
        ) : (
          <>
            <p className="text-sm text-zinc-400 mb-4">
              Drop your email for daily winners, new features, and the occasional drop. No spam.
            </p>
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !submitting) submit();
              }}
              placeholder="you@example.com"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              disabled={submitting}
            />
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => close(true)}
                disabled={submitting}
                className="flex-1 text-xs px-3 py-2 rounded-md border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors disabled:opacity-50"
              >
                Maybe later
              </button>
              <button
                onClick={submit}
                disabled={submitting || !email}
                className="flex-1 text-xs px-3 py-2.5 min-h-11 rounded-md bg-neon hover:brightness-110 text-black font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Sending..." : "Sign me up"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
