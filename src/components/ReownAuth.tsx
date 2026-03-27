'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  solanaAddress: string;
}

export default function ReownAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        style={{
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: '600',
          borderRadius: '6px',
          background: '#000',
          color: '#fff',
          border: '1.5px solid #fff',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: '16px' }}>𝕏</span>
        Sign In
      </button>
    );
  }

  const handleConnect = () => setShowModal(true);

  const handleSignIn = (method: string) => {
    const newUser: User = {
      id: 'user_' + Math.random().toString(36).slice(2, 10),
      solanaAddress: 'sola' + Math.random().toString(36).slice(2, 40),
    };
    setUser(newUser);
    setShowModal(false);
  };

  const handleDisconnect = () => setUser(null);

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
          }}
          onMouseEnter={(e) => {
            const btn = e.target as HTMLButtonElement;
            btn.style.background = '#fff';
            btn.style.color = '#000';
          }}
          onMouseLeave={(e) => {
            const btn = e.target as HTMLButtonElement;
            btn.style.background = '#000';
            btn.style.color = '#fff';
          }}
        >
          <span style={{ fontSize: '16px' }}>𝕏</span>
          Sign In
        </button>

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
                }}
              >
                <span>𝕏 Sign In with Twitter</span>
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
      <span style={{ fontSize: '12px', color: '#4ade80' }}>✓ Signed In</span>
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
