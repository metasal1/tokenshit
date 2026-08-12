'use client';

import { useEffect, useState, useCallback } from 'react';
import { EmojiIcon } from '@/components/EmojiIcon';

type Shortcut = { keys: string[]; label: string };
type Group = { title: string; items: Shortcut[] };

const GROUPS: Group[] = [
  {
    title: 'Voting',
    items: [
      { keys: ['H'], label: 'Vote HIT on the current token' },
      { keys: ['S'], label: 'Vote SHIT on the current token' },
      { keys: ['R'], label: 'Random token' },
    ],
  },
  {
    title: 'Navigation',
    items: [
      { keys: ['/'], label: 'Focus search' },
      { keys: ['←'], label: 'Previous adjacent token' },
      { keys: ['→'], label: 'Next adjacent token' },
      { keys: ['Esc'], label: 'Blur search / close modal' },
    ],
  },
  {
    title: 'Help',
    items: [
      { keys: ['?'], label: 'Show this list' },
    ],
  },
];

export default function ShortcutsModal() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const editing =
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if (!open && !editing && e.key === '?') {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (open && e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    };
    const openHandler = () => setOpen(true);
    window.addEventListener('keydown', handler);
    window.addEventListener('tokenshit:show-shortcuts', openHandler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('tokenshit:show-shortcuts', openHandler);
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center pt-20 sm:pt-32 bg-black/70 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold text-lg">Keyboard shortcuts</h3>
          <button
            onClick={close}
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <EmojiIcon size={18}>❌</EmojiIcon>
          </button>
        </div>

        <div className="space-y-5">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mb-2">
                {group.title}
              </p>
              <ul className="space-y-1.5">
                {group.items.map((s) => (
                  <li key={s.label} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-zinc-300">{s.label}</span>
                    <span className="flex gap-1 shrink-0">
                      {s.keys.map((k) => (
                        <kbd
                          key={k}
                          className="px-2 py-0.5 text-[11px] font-mono font-semibold text-zinc-200 bg-zinc-800 border border-zinc-700 border-b-2 rounded shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-zinc-600 mt-5 text-center">
          Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 border border-zinc-700 rounded">?</kbd> any time
        </p>
      </div>
    </div>
  );
}
