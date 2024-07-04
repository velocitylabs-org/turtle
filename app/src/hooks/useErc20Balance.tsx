import { Network } from '@/models/chain'
import { Token } from '@/models/token'
import { toHuman } from '@/utils/transfer'
import * as Sentry from '@sentry/nextjs'
import * as Snowbridge from '@snowbridge/api'
import { erc20TokenToAssetLocation, palletAssetsBalance } from '@snowbridge/api/dist/assets'
import { useCallback, useEffect, useState } from 'react'
import { useBalance } from 'wagmi'

interface UseBalanceParams {
  network?: Network
  token?: Token // Could be extended to support multiple tokens
  address?: string
  context?: Snowbridge.Context
}

interface Erc20Balance {
  value: bigint
  decimals: number
  symbol: string
  formatted: string
}

/**
 * hook to fetch ERC20 balance for a given address. Supports Ethereum and Polkadot networks.
 * @remarks Doesn't provide metadata like decimals as we use a static registy.
 */
const useErc20Balance = ({ network, token, address, context }: UseBalanceParams) => {
  const [data, setData] = useState<Erc20Balance | undefined>()
  const [loading, setLoading] = useState<boolean>(false)

  const wagmiData = useBalance({
    token: token?.address as `0x${string}`,
    address: address as `0x${string}`,
    query: {
      enabled: false,
    },
  })
  const { refetch, isLoading: wagmiLoading } = wagmiData

  const fetchBalance = useCallback(async () => {
    if (!network || !token || !address) return

    try {
      setLoading(true)
      let fetchedBalance: Erc20Balance | undefined

      switch (network) {
        case Network.Ethereum: {
          fetchedBalance = (await refetch()).data
          break
        }

        case Network.Polkadot: {
          if (!context?.polkadot.api) return

          const chainId = (await context.ethereum.api.getNetwork()).chainId
          const multiLocation = erc20TokenToAssetLocation(
            context.polkadot.api.assetHub.registry,
            BigInt(chainId),
            token.address,
          )

          const balance = await palletAssetsBalance(
            context.polkadot.api.assetHub,
            multiLocation,
            address,
            'foreignAssets',
          )

          fetchedBalance = {
            value: balance ?? 0n,
            decimals: token.decimals,
            symbol: token.symbol,
            formatted: toHuman(balance ?? 0n, token).toString(),
          }
          break
        }

        default:
          throw new Error('Unsupported network')
      }

      setData(fetchedBalance)
    } catch (error) {
      console.error('Failed to fetch balance', error)
      Sentry.captureException(error)
    } finally {
      setLoading(false)
    }
  }, [network, address, token, refetch, context])

  useEffect(() => {
    fetchBalance()
  }, [network, token, address, fetchBalance])

  return { data, loading: loading || wagmiLoading }
}

export default useErc20Balance
