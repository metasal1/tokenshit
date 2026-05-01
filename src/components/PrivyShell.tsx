'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const PrivyClientProvider = dynamic(() => import('./PrivyClientProvider'), {
  ssr: false,
});

export default function PrivyShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <>{children}</>;

  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
  return <PrivyClientProvider appId={appId}>{children}</PrivyClientProvider>;
}
