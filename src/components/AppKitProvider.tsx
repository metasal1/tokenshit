'use client'

import { solanaAdapter, projectId, networks } from '@/config/appkit'
import { createAppKit } from '@reown/appkit/react'
import React, { type ReactNode } from 'react'

const metadata = {
  name: 'TokenShit',
  description: 'Every token is shit until proven otherwise',
  url: 'https://tokenshit.com',
  icons: ['https://tokenshit.com/favicon.ico']
}

createAppKit({
  adapters: [solanaAdapter],
  projectId,
  networks,
  metadata,
  features: {
    email: false,
    socials: ['x'],
    emailShowWallets: false,
  },
  allWallets: 'HIDE',
})

export default function AppKitProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
