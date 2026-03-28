'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useEffect, useState } from 'react'

export default function WalletButton() {
  const [mounted, setMounted] = useState(false)
  const { login, logout, authenticated, user } = usePrivy()

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  if (authenticated) {
    const displayName =
      user?.twitter?.username
        ? `@${user.twitter.username}`
        : user?.wallet?.address
          ? `${user.wallet.address.slice(0, 4)}...${user.wallet.address.slice(-4)}`
          : 'Connected'

    return (
      <button
        onClick={logout}
        style={{
          background: '#1a1a2e',
          border: '1px solid #333',
          borderRadius: '8px',
          color: '#fff',
          padding: '6px 12px',
          fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        {displayName}
      </button>
    )
  }

  return (
    <button
      onClick={() => login({ loginMethods: ['twitter'] })}
      style={{
        background: '#7c3aed',
        border: 'none',
        borderRadius: '8px',
        color: '#fff',
        padding: '6px 16px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      𝕏 Sign In
    </button>
  )
}
