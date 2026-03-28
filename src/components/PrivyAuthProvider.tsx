'use client'

import { type ReactNode } from 'react'

// Privy disabled - causes crashes on Vercel
// Will re-enable with a lighter auth solution later

export default function PrivyAuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
