import { Network } from '@/models/chain'
import { Token } from '@/models/token'
import { Context } from '@snowbridge/api'
import { assetErc20Balance } from '@snowbridge/api/dist/assets'
import { useCallback, useEffect, useState } from 'react'

type EthereumContext = {
  context?: Context
  tokenAddress?: string
}

// TODO: update types once PJS added
type PolkadotContext = {
  api: any
  location: any
  instance: any
}

type NetworkContext = EthereumContext | PolkadotContext

interface useBalanceParams {
  network?: Network
  networkContext?: NetworkContext
  token?: Token // Could be extended to support multiple tokens
  address?: string
}

const useErc20Balance = ({ network, networkContext, address }: useBalanceParams) => {
  const [balance, setBalance] = useState<bigint>()
  const [loading, setLoading] = useState<boolean>(false)

  const fetchBalance = useCallback(async () => {
    if (!network || !networkContext || !address) return

    try {
      setLoading(true)
      switch (network) {
        case Network.Ethereum: {
          const { context, tokenAddress } = networkContext as EthereumContext
          if (!context || !tokenAddress) return

          const { balance, gatewayAllowance } = await assetErc20Balance(
            context,
            tokenAddress,
            address,
          )

          console.log('balance update', balance)

          setBalance(balance)
          break
        }
        case Network.Polkadot: {
          // TODO: Fetch balance from Polkadot
          break
        }
      }
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
