import { Network } from '@/models/chain'
import { Token } from '@/models/token'
import * as Snowbridge from '@snowbridge/api'
import { erc20TokenToAssetLocation, palletAssetsBalance } from '@snowbridge/api/dist/assets'
import { useCallback, useEffect, useState } from 'react'
import { useBalance } from 'wagmi'
import useEnvironment from './useEnvironment'

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
  const { environment } = useEnvironment()

  const wagmiData = useBalance({
    token: token?.address as `0x${string}`,
    address: address as `0x${string}`,
    query: {
      enabled: false,
    },
  })
  const { refetch } = wagmiData

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
          if (!context?.polkadot.api) {
            console.error('API is not initialized')
            return
          }
          console.log('dot selected')

          const chainId = (await context.ethereum.api.getNetwork()).chainId

          const multiLocation = erc20TokenToAssetLocation(
            context.polkadot.api.assetHub.registry,
            chainId,
            token.address,
          )
          console.log('multiLocation', multiLocation.toPrimitive())

          // The same snowbridge uses. Also not working.
          /* const account = await context.polkadot.api.assetHub.query.assets.account(
            multiLocation,
            address,
          ) */

          // that works
          const foreignAsset = (
            await context.polkadot.api.assetHub.query.foreignAssets.asset(multiLocation)
          ).toPrimitive() as { status: 'Live' }

          console.log('foreignAsset', foreignAsset)

          // that fails
          const dotBalance = await palletAssetsBalance(
            context.polkadot.api.assetHub,
            multiLocation,
            address,
          )
          console.log('dot balance')
          break
        }
      }
      console.log('Fetched balance', fetchedBalance)
      setData(fetchedBalance)
    } catch (error) {
      console.error('Failed to fetch balance', error)
    } finally {
      setLoading(false)
    }
  }, [network, address, token, refetch])

  useEffect(() => {
    fetchBalance()
  }, [network, token, address, fetchBalance])

  return { data, loading: loading || wagmiData.isLoading }
}

export default useErc20Balance
