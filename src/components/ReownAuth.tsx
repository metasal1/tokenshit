'use client';

import { useState } from 'react';

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

  const handleConnect = () => {
    // For now, use simple placeholder - Reown SDK can be integrated later
    const mockUser: User = {
      id: 'user_' + Math.random().toString(36).slice(2),
      solanaAddress: 'placeholder...wallet',
      twitterHandle: '@user',
    };
    setUser(mockUser);
    onAuthChange?.(mockUser);

    // Log to console for debugging
    console.log('Mock user connected:', mockUser);
  };

  const handleDisconnect = () => {
    setUser(null);
    onAuthChange?.(null);
  };

  if (!user) {
    return (
      <button
        onClick={handleConnect}
        style={{
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          borderRadius: '6px',
          background: '#000',
          color: '#fff',
          border: '1.5px solid #fff',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.background = '#fff';
          (e.target as HTMLButtonElement).style.color = '#000';
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.background = '#000';
          (e.target as HTMLButtonElement).style.color = '#fff';
        }}
      >
        <span style={{ fontSize: '16px' }}>𝕏</span>
        Sign In
      </button>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '6px 12px',
        borderRadius: '6px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <span style={{ fontSize: '12px', color: '#aaa' }}>
        Connected ✓
      </span>
      <button
        onClick={handleDisconnect}
        style={{
          padding: '4px 8px',
          fontSize: '11px',
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
