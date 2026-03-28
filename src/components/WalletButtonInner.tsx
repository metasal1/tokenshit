'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useState, useCallback } from 'react'

export default function WalletButtonInner() {
  const [copied, setCopied] = useState(false)
  const { login, logout, authenticated, user, ready } = usePrivy()

  if (!ready) return null

  const solanaAddress = user?.wallet?.address
  const truncated = solanaAddress
    ? `${solanaAddress.slice(0, 4)}...${solanaAddress.slice(-4)}`
    : null

  const copyAddress = useCallback(() => {
    if (!solanaAddress) return
    navigator.clipboard.writeText(solanaAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [solanaAddress])

  if (authenticated) {
    const twitterName = user?.twitter?.username ? `@${user.twitter.username}` : null
    return (
      <div className="flex items-center gap-1.5 min-w-0">
        <div className="flex flex-col items-end min-w-0 shrink">
          {twitterName && <span className="text-xs text-zinc-300 truncate max-w-[120px]">{twitterName}</span>}
          {truncated && (
            <button onClick={copyAddress} className="text-[10px] text-zinc-500 font-mono hover:text-zinc-300 transition-colors cursor-pointer" title={copied ? 'Copied!' : 'Copy address'}>
              {copied ? '✓ copied' : truncated}
            </button>
          )}
        </div>
        <button onClick={logout} title="Sign out" className="shrink-0 bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors cursor-pointer">✕</button>
      </div>
    )
  }

  return (
    <button onClick={() => login({ loginMethods: ['twitter'] })} className="shrink-0 bg-violet-600 hover:bg-violet-500 rounded-lg text-white px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors">
      𝕏 Sign In
    </button>
  )
}
