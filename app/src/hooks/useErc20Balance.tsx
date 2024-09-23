import { Network } from '@/models/chain'
import { Token } from '@/models/token'
import { Erc20Balance } from '@/services/balance'
import { toHuman } from '@/utils/transfer'
import {
  dotAh,
  dotRelay,
  XcmV3Junction,
  XcmV3JunctionNetworkId,
  XcmV3Junctions,
} from '@polkadot-api/descriptors'
import { captureException } from '@sentry/nextjs'
import { Context } from '@snowbridge/api'
import { createClient, FixedSizeBinary, TypedApi } from 'polkadot-api'
import { chainSpec as chainSpecRelay } from 'polkadot-api/chains/polkadot'
import { chainSpec } from 'polkadot-api/chains/polkadot_asset_hub'
import { getSmProvider } from 'polkadot-api/sm-provider'
import { start } from 'polkadot-api/smoldot'
import { useCallback, useEffect, useState } from 'react'
import { useBalance } from 'wagmi'

interface UseBalanceParams {
  network?: Network
  token?: Token // Could be extended to support multiple tokens
  address?: string
  context?: Context
}

/**
 * hook to fetch ERC20 balance for a given address. Supports Ethereum and Polkadot networks.
 * @remarks Doesn't provide metadata like decimals as we use a static registy.
 */
const useErc20Balance = ({ network, token, address, context }: UseBalanceParams) => {
  const [data, setData] = useState<Erc20Balance | undefined>()
  const [loading, setLoading] = useState<boolean>(false)
  const { refetch: fetchEthereum, isLoading: loadingEthBalance } = useBalance({
    token: token?.address?.startsWith('0x') ? (token.address as `0x${string}`) : undefined,
    address: address?.startsWith('0x') ? (address as `0x${string}`) : undefined,
    query: {
      enabled: false, // disable auto-fetching
    },
  })
  const [dotAssetHubApi, setDotAssetHubApi] = useState<TypedApi<typeof dotAh>>()

  const fetchBalance = useCallback(async () => {
    if (!network || !token || !address || !context) return

    try {
      setLoading(true)
      let fetchedBalance: Erc20Balance | undefined

      switch (network) {
        case Network.Ethereum: {
          fetchedBalance = (await fetchEthereum()).data
          if (fetchedBalance)
            fetchedBalance.formatted = toHuman(fetchedBalance.value, token).toString()
          break
        }

        case Network.Polkadot: {
          console.log('before')
          const parsed = JSON.parse(
            '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"}}]}}',
          )
          const m2 = {
            parents: 2,
            interior: XcmV3Junctions.X2([
              XcmV3Junction.GlobalConsensus(XcmV3JunctionNetworkId.Ethereum({ chain_id: 1n })),
              XcmV3Junction.AccountKey20({
                network: undefined,
                key: new FixedSizeBinary(
                  new Uint8Array(Buffer.from('a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 'hex')),
                ),
              }),
            ]),
          }

          console.log('parsed', parsed)

          const result = await dotAssetHubApi?.query.ForeignAssets.Account.getValue(m2, address)
          if (result) {
            fetchedBalance = {
              value: result.balance,
              formatted: toHuman(result.balance, token).toString(),
              decimals: token.decimals,
              symbol: token.symbol,
            }
          }

          console.log('after')
          //const result = await dotAssetHubApi?.query.System.Account.getValue(address)
          console.log(result)
          if (result) {
            /* fetchedBalance = {
              value: result.data.free,
              formatted: toHuman(result.data.free, token).toString(),
              decimals: token.decimals,
              symbol: token.symbol,
            } */
          }
          break
        }

        default:
          throw new Error('Unsupported network')
      }

      setData(fetchedBalance)
    } catch (error) {
      console.error('Failed to fetch balance', error)
      captureException(error)
    } finally {
      setLoading(false)
    }
  }, [network, address, token, context, fetchEthereum])

  useEffect(() => {
    fetchBalance()
  }, [network, token, address, fetchBalance])

  useEffect(() => {
    const startClient = async () => {
      const smoldot = start()
      console.log(dotRelay)
      const relayChain = await smoldot.addChain({ chainSpec: chainSpecRelay })
      const chain = await smoldot.addChain({
        chainSpec: chainSpec,
        potentialRelayChains: [relayChain],
      })

      const client = createClient(getSmProvider(chain))

      client.finalizedBlock$.subscribe(finalizedBlock =>
        console.log(finalizedBlock.number, finalizedBlock.hash),
      )

      const dotAssetHubApi = client.getTypedApi(dotAh)
      setDotAssetHubApi(dotAssetHubApi)
    }

    startClient()
  }, [])

  return { data, fetchBalance, loading: loading || loadingEthBalance }
}

export default useErc20Balance
