import { solana } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'

export const projectId = '4499e1781ee00a4aee0b53ee5d1df999'

export const networks = [solana] as [AppKitNetwork, ...AppKitNetwork[]]

export const solanaAdapter = new SolanaAdapter()
