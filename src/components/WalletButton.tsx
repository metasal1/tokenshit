'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useEffect, useState, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'

function QRModal({ address, onClose }: { address: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 flex flex-col items-center gap-4 max-w-xs w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-zinc-400">Solana Wallet</p>
        <div className="bg-white p-3 rounded-lg">
          <QRCodeSVG value={address} size={200} />
        </div>
        <p className="text-xs text-zinc-500 font-mono break-all text-center">{address}</p>
        <button
          onClick={onClose}
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default function WalletButton() {
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const { login, logout, authenticated, user } = usePrivy()

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const solanaWallet = user?.linkedAccounts?.find(
    (a) => a.type === 'wallet' && 'chainType' in a && (a as unknown as { chainType: string }).chainType === 'solana'
  ) as { address: string } | undefined
  const walletAddress = solanaWallet?.address || user?.wallet?.address

  const copyAddress = useCallback(() => {
    if (!walletAddress) return
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [walletAddress])

  if (authenticated) {
    const twitterName = user?.twitter?.username ? `@${user.twitter.username}` : null
    const truncatedAddr = walletAddress
      ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
      : null

    return (
      <>
        {showQR && walletAddress && (
          <QRModal address={walletAddress} onClose={() => setShowQR(false)} />
        )}
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Wallet info */}
          <div className="flex flex-col items-end min-w-0 shrink">
            {twitterName && (
              <span className="text-xs text-zinc-300 truncate max-w-[120px]">{twitterName}</span>
            )}
            {truncatedAddr && (
              <span className="text-[10px] text-zinc-500 font-mono">{truncatedAddr}</span>
            )}
          </div>

          {/* Copy button */}
          {walletAddress && (
            <button
              onClick={copyAddress}
              title="Copy address"
              className="p-1 text-zinc-500 hover:text-white transition-colors shrink-0"
            >
              {copied ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              )}
            </button>
          )}

          {/* QR button */}
          {walletAddress && (
            <button
              onClick={() => setShowQR(true)}
              title="Show QR"
              className="p-1 text-zinc-500 hover:text-white transition-colors shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="3" height="3" /><rect x="18" y="18" width="3" height="3" />
              </svg>
            </button>
          )}

          {/* Logout */}
          <button
            onClick={logout}
            title="Sign out"
            className="shrink-0 bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      </>
    )
  }

  return (
    <button
      onClick={() => login({ loginMethods: ['twitter'] })}
      className="shrink-0 bg-violet-600 hover:bg-violet-500 rounded-lg text-white px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
    >
      𝕏 Sign In
    </button>
  )
}
