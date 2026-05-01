'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';

export default function PrivyClientProvider({
  children,
  appId,
}: {
  children: React.ReactNode;
  appId: string;
}) {
  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['twitter'],
        appearance: {
          theme: 'dark',
        },
        embeddedWallets: {
          solana: {
            createOnLogin: 'all-users',
          },
        },
        externalWallets: {
          solana: {
            connectors: toSolanaWalletConnectors(),
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
