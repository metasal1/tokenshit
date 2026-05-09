'use client';

import { useEffect, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { sfx } from '@/lib/sfx';

export default function LoginChime() {
  const { ready, authenticated } = usePrivy();
  const prev = useRef<boolean | null>(null);

  useEffect(() => {
    if (!ready) return;
    // Skip the very first observation — that's "page load with existing session",
    // not a fresh login.
    if (prev.current === null) {
      prev.current = authenticated;
      return;
    }
    if (!prev.current && authenticated) sfx.chime();
    prev.current = authenticated;
  }, [ready, authenticated]);

  return null;
}
