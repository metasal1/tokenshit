'use client'

import { useEffect, useState, type ComponentType } from 'react'

export default function WalletButton() {
  const [Inner, setInner] = useState<ComponentType | null>(null)

  useEffect(() => {
    import('./WalletButtonInner').then((mod) => setInner(() => mod.default))
  }, [])

  if (!Inner) return null
  return <Inner />
}
