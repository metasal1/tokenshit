'use client'

import { type ReactNode } from 'react'

// Temporarily disabled Privy to debug render crash
// Will re-enable after fixing initialization issue

export default function PrivyAuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
