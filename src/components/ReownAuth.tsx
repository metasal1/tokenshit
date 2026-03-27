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
  const [showModal, setShowModal] = useState(false);

  const handleConnect = () => {
    setShowModal(true);
  };

  const handleSignIn = (method: 'wallet' | 'twitter') => {
    // Create mock user
    const mockUser: User = {
      id: 'user_' + Math.random().toString(36).slice(2).substring(0, 8),
      solanaAddress: method === 'wallet' 
        ? 'sola' + Math.random().toString(36).slice(2).substring(0, 40)
        : 'sola' + Math.random().toString(36).slice(2).substring(0, 40),
      twitterHandle: method === 'twitter' ? '@user' : undefined,
    };
    setUser(mockUser);
    onAuthChange?.(mockUser);
    setShowModal(false);
  };

  const handleDisconnect = () => {
    setUser(null);
    onAuthChange?.(null);
  };

  if (!user) {
    return (
      <>
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

        {/* Modal */}
        {showModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowModal(false)}
          >
            <div
              style={{
                background: '#111',
                border: '1px solid #333',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '400px',
                textAlign: 'center',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ color: '#fff', marginBottom: '24px', fontSize: '20px' }}>
                Sign In to TOKENSHIT
              </h2>
              
              <button
                onClick={() => handleSignIn('twitter')}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '12px',
                  background: '#000',
                  color: '#fff',
                  border: '1px solid #fff',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>𝕏</span>
                Sign In with Twitter
              </button>

              <button
                onClick={() => handleSignIn('wallet')}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1a1a1a',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Connect Wallet
              </button>

              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '12px',
                  background: 'transparent',
                  color: '#888',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </>
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
        background: 'rgba(34, 197, 94, 0.1)',
        border: '1px solid rgba(34, 197, 94, 0.3)',
      }}
    >
      <span style={{ fontSize: '12px', color: '#4ade80' }}>
        ✓ Signed In
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
