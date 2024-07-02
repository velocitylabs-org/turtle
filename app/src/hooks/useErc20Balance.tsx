import { Network } from '@/models/chain'
import { Token } from '@/models/token'
import { Context } from '@snowbridge/api'
import { assetErc20Balance } from '@snowbridge/api/dist/assets'
import { useCallback, useEffect, useState } from 'react'
import { useBalance } from 'wagmi'

interface EthereumContext {
  context?: Context
  tokenAddress?: string
}

// TODO: update types once PJS added
interface PolkadotContext {
  api: any
  location: any
  instance: any
}

type NetworkContext = EthereumContext | PolkadotContext

interface UseBalanceParams {
  network?: Network
  networkContext?: NetworkContext
  token?: Token // Could be extended to support multiple tokens
  address?: string
}

/**
 * hook to fetch ERC20 balance for a given address. Supports Ethereum and Polkadot networks.
 * @remarks Doesn't provide metadata like decimals as we use a static registy.
 */
const useErc20Balance = ({ network, networkContext, address }: UseBalanceParams) => {
  const [balance, setBalance] = useState<bigint | undefined>()
  const [loading, setLoading] = useState<boolean>(false)

  const fetchBalance = useCallback(async () => {
    if (!network || !networkContext || !address) return

    setLoading(true)
    try {
      let fetchedBalance: bigint | undefined
      switch (network) {
        case Network.Ethereum: {
          const { context, tokenAddress } = networkContext as EthereumContext
          if (!context || !tokenAddress) return

          useBalance

          const { balance } = await assetErc20Balance(context, tokenAddress, address)
          fetchedBalance = balance
          break
        }
        case Network.Polkadot: {
          // TODO: Fetch balance from Polkadot
          break
        }
      }
      setBalance(fetchedBalance)
    } catch (error) {
      console.error('Failed to fetch balance', error)
    } finally {
      setLoading(false)
    }
  }, [network, networkContext, address])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  return { balance, loading }
}

export default useErc20Balance
