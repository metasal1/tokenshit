// Reown/AppKit configuration
// Simplified for production compatibility

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

if (!projectId) {
  console.warn('NEXT_PUBLIC_REOWN_PROJECT_ID is not set');
}

// Minimal implementation for now - just track auth state
let cachedUser: any = null;

export const appKit = {
  open: (options?: any) => {
    console.log('Opening Reown modal...', options);
  },
  disconnect: async () => {
    cachedUser = null;
  },
  subscribeConnectedWallet: (callback: any) => {
    return () => {};
  },
  getConnectedWallet: () => cachedUser,
};

export function getAuthenticatedUser() {
  return cachedUser;
}

export function isAuthenticated() {
  return cachedUser !== null;
}

export function setAuthenticatedUser(user: any) {
  cachedUser = user;
}
