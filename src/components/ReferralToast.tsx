'use client';

import { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';

export default function ReferralToast() {
  const [referrer, setReferrer] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ referrer: string }>).detail;
      if (!detail?.referrer) return;
      setReferrer(detail.referrer);
      window.setTimeout(() => setReferrer(null), 8000);
    };
    window.addEventListener('tokenshit:referred', handler);
    return () => window.removeEventListener('tokenshit:referred', handler);
  }, []);

  if (!referrer) return null;

  return (
    <div
      className="fixed top-20 right-4 z-[130] max-w-sm animate-[slideIn_0.35s_cubic-bezier(0.2,0.9,0.3,1)_both]"
      role="status"
      aria-live="polite"
    >
      <div className="bg-zinc-900 border border-neon/40 rounded-xl shadow-2xl px-4 py-3 flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5 text-neon drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]" strokeWidth={2.25} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">You were referred</p>
          <p className="text-xs text-zinc-400 mt-0.5">
            By{' '}
            <a
              href={`https://x.com/${referrer}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-blue font-mono hover:underline"
            >
              @{referrer}
            </a>
            {' · '}thanks for joining the shitshow.
          </p>
        </div>
        <button
          onClick={() => setReferrer(null)}
          className="shrink-0 -mr-1 -mt-1 text-zinc-500 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
