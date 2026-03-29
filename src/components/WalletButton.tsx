'use client'

import { useSession, signIn, signOut } from 'next-auth/react'

export default function WalletButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') return null

  if (session?.user) {
    const username = (session.user as any).twitterUsername
    return (
      <div className="flex items-center gap-1.5">
        {session.user.image && (
          <img src={session.user.image} alt="" className="w-6 h-6 rounded-full" />
        )}
        <span className="text-xs text-zinc-300 truncate max-w-[100px]">
          @{username || session.user.name}
        </span>
        <button
          onClick={() => signOut()}
          className="shrink-0 bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('twitter')}
      className="shrink-0 bg-violet-600 hover:bg-violet-500 rounded-lg text-white px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
    >
      𝕏 Sign In
    </button>
  )
}
