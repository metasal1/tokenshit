'use client';

import { useEffect, useState } from 'react';
import { isMuted, toggleMuted, sfx } from '@/lib/sfx';

export default function SoundToggle() {
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    setMutedState(isMuted());
    const sync = () => setMutedState(isMuted());
    window.addEventListener('tokenshit:sfx-toggle', sync);
    return () => window.removeEventListener('tokenshit:sfx-toggle', sync);
  }, []);

  return (
    <button
      onClick={() => {
        const next = toggleMuted();
        if (!next) sfx.ding();
      }}
      className="p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors"
      aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
      title={muted ? 'Sounds off' : 'Sounds on'}
    >
      {muted ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  );
}
