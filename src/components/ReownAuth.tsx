'use client';

import { useEffect, useState } from 'react';
import { appKit, getAuthenticatedUser, isAuthenticated } from '@/lib/reown-config';

interface User {
  id: string;
  solanaAddress: string;
  twitterHandle?: string;
  email?: string;
}

interface ReownAuthProps {
  onAuthChange?: (user: User | null) => void;
}

export default function ReownAuth({ onAuthChange }: ReownAuthProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    setLoading(true);
    const authenticatedUser = getAuthenticatedUser();
    if (authenticatedUser) {
      setUser(authenticatedUser);
      onAuthChange?.(authenticatedUser);
    }
    setLoading(false);

    // Subscribe to auth state changes
    const unsubscribe = appKit.subscribeConnectedWallet((account: any) => {
      if (account?.address) {
        const newUser: User = {
          id: account.address,
          solanaAddress: account.address,
          email: account.email,
        };
        setUser(newUser);
        onAuthChange?.(newUser);

        // Sync user to backend
        syncUserToBackend(newUser);
      } else {
        setUser(null);
        onAuthChange?.(null);
      }
    });

    return () => unsubscribe?.();
  }, [onAuthChange]);

  async function syncUserToBackend(userData: User) {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        console.error('Failed to sync user:', await res.text());
      }
    } catch (error) {
      console.error('Error syncing user:', error);
    }
  }

  const handleConnect = () => {
    appKit.open({ view: 'Connect' });
  };

  const handleDisconnect = async () => {
    await appKit.disconnect();
    setUser(null);
    onAuthChange?.(null);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '8px 16px', color: '#888' }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={handleConnect}
        style={{
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          borderRadius: '6px',
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          color: '#000',
          border: 'none',
          boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.transform = 'scale(1)';
        }}
      >
        ✕ Sign In
      </button>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        borderRadius: '6px',
        background: 'rgba(34, 197, 94, 0.1)',
        border: '1px solid #22c55e',
      }}
    >
      <span style={{ fontSize: '12px', color: '#888' }}>
        {user.solanaAddress.slice(0, 4)}...{user.solanaAddress.slice(-4)}
      </span>
      <button
        onClick={handleDisconnect}
        style={{
          padding: '4px 8px',
          fontSize: '12px',
          background: 'transparent',
          color: '#888',
          border: '1px solid #444',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
