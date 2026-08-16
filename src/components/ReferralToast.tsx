'use client';

import { useEffect, useState } from 'react';

export default function ReferralToast() {
  const [referrer, setReferrer] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ referrer: string }>).detail;
      if (!detail?.referrer) return;
      setReferrer(detail.referrer);
      window.setTimeout(() => setReferrer(null), 3200);
    };
    window.addEventListener('tokenshit:referred', handler);
    return () => window.removeEventListener('tokenshit:referred', handler);
  }, []);

  if (!referrer) return null;

  return (
    <div
      className="fixed z-[130] top-[max(4.25rem,calc(env(safe-area-inset-top)+3.25rem))] left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 w-[min(16rem,calc(100vw-1rem))] pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <div className="rounded-xl border border-neon/35 bg-zinc-950/90 backdrop-blur-md shadow-sm px-2.5 py-2 flex items-center gap-2 pointer-events-auto">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-orbitron uppercase tracking-wider text-neon/90">Referred</p>
          <p className="text-[12px] text-white truncate">
            by{' '}
            <a
              href={`https://x.com/${referrer}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-blue font-mono hover:underline"
            >
              @{referrer}
            </a>
          </p>
        </div>
        <button
          onClick={() => setReferrer(null)}
          className="shrink-0 text-zinc-500 hover:text-white text-sm leading-none px-1"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
