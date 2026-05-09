'use client';

import { useEffect, useState } from 'react';

const MESSAGES = [
  'Sniffing the blockchain…',
  'Asking the bag holders…',
  'Checking for rugs…',
  'Consulting the chart astrologer…',
  'Polling exit liquidity…',
  'Rolling the degen dice…',
  'Decrypting alpha leaks…',
  'Asking your favorite KOL…',
  'Backtesting vibes…',
  'Counting the chads…',
];

export default function RandomTokenSkeleton() {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    setMsgIdx(Math.floor(Math.random() * MESSAGES.length));
    const id = window.setInterval(
      () => setMsgIdx((i) => (i + 1 + Math.floor(Math.random() * (MESSAGES.length - 1))) % MESSAGES.length),
      1100
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full skeleton shrink-0" />
          <div className="space-y-1.5 min-w-0">
            <div className="skeleton h-3.5 w-24 rounded" />
            <div className="skeleton h-2.5 w-12 rounded" />
          </div>
        </div>
        <div className="skeleton h-7 w-16 rounded-md shrink-0" />
      </div>

      <div className="p-4 space-y-4">
        <div className="text-center">
          <div className="inline-flex items-baseline gap-0 text-2xl sm:text-3xl font-monoton">
            <span className="neon-text loading-pulse">TOKEN</span>
            <span className="neon-dollar">$</span>
            <span className="neon-text loading-pulse">HIT</span>
          </div>
          <p className="mt-3 text-xs text-zinc-500 font-mono min-h-[1.25rem] transition-opacity">
            {MESSAGES[msgIdx]}
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 min-h-[100px] rounded-xl border-[3px] border-green-900/60 bg-green-950/40 flex flex-col items-center justify-center gap-2 loading-rise">
            <span className="text-3xl opacity-40">🎯</span>
            <div className="skeleton h-2.5 w-10 rounded" />
          </div>
          <div className="flex-1 min-h-[100px] rounded-xl border-[3px] border-red-900/60 bg-red-950/40 flex flex-col items-center justify-center gap-2 loading-rise" style={{ animationDelay: '0.15s' }}>
            <span className="text-2xl font-black tracking-tight text-red-500/50">$HIT</span>
            <div className="skeleton h-2.5 w-10 rounded" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        :global(.loading-pulse) {
          animation: loading-pulse 1.4s ease-in-out infinite;
        }
        @keyframes loading-rise {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        :global(.loading-rise) {
          animation: loading-rise 1.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
