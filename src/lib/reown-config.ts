import { createAppKit } from '@reown/appkit';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { solana, solanaTestnet } from '@reown/appkit/networks';

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

if (!projectId) {
  throw new Error('NEXT_PUBLIC_REOWN_PROJECT_ID is not set');
}

// Initialize Reown AppKit with Solana adapter
export const appKit = createAppKit({
  projectId,
  adapters: [new SolanaAdapter()],
  networks: [solana, solanaTestnet],
  metadata: {
    name: 'TokenShit',
    description: 'Every token is shit until proven otherwise',
    url: 'https://tokenshit.com',
    icons: ['https://tokenshit.com/icon.svg'],
  },
  // Enable social login providers
  allWallets: 'ONLY_MOBILE', // Solana mobile wallet priority
  features: {
    socials: ['twitter', 'google', 'github', 'discord'] as const,
    analytics: true,
  },
});

// Subscribe to authentication state
let cachedUser: any = null;

appKit.subscribeConnectedWallet((account) => {
  if (account) {
    cachedUser = {
      id: account.address, // Use wallet address as user ID for now
      solanaAddress: account.address,
      email: account.email,
      profileImage: account.profileImage,
    };
  } else {
    cachedUser = null;
  }
});

export function getAuthenticatedUser() {
  return cachedUser;
}

export function isAuthenticated() {
  return cachedUser !== null;
}
