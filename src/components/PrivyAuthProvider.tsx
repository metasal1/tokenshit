'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { type ReactNode, useEffect, useState } from 'react'

export default function PrivyAuthProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <>{children}</>

  return (
    <PrivyProvider
      appId="cmn9qofoh00z50cjuijtbyf10"
      config={{
        loginMethods: ['twitter'],
        appearance: {
          theme: 'dark',
          showWalletLoginFirst: false,
        },
        embeddedWallets: {
          solana: { createOnLogin: 'users-without-wallets' },
        },
      }}
    >
      {children}
    </PrivyProvider>
  )
}
