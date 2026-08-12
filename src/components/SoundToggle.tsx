'use client';

import { useEffect, useState } from 'react';
import { isMuted, toggleMuted, sfx } from '@/lib/sfx';
import { EmojiIcon } from '@/components/EmojiIcon';

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
      <EmojiIcon size={18}>{muted ? '🔇' : '🔊'}</EmojiIcon>
    </button>
  );
}
