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
        loginMethods: ['twitter', 'github'],
        appearance: {
          theme: 'dark',
          accentColor: '#39ff14',
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
        fundingMethodConfig: {
          moonpay: {
            useSandbox: false,
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
