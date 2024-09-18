import { Network } from '@/models/chain'
import { Token } from '@/models/token'
import { Erc20Balance, fetchAssetHubBalance, fetchEthereumBalance } from '@/services/balance'
import { captureException } from '@sentry/nextjs'
import { Context } from '@snowbridge/api'
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
  const { data: dataWagmi } = useBalance({
    token: token?.address?.startsWith('0x') ? (token.address as `0x${string}`) : undefined,
    address: address?.startsWith('0x') ? (address as `0x${string}`) : undefined,
  })

  const fetchBalance = useCallback(async () => {
    if (!network || !token || !address || !context) return

    try {
      setLoading(true)
      let fetchedBalance: Erc20Balance | undefined

      switch (network) {
        case Network.Ethereum: {
          fetchedBalance = await fetchEthereumBalance(context, token, address)
          break
        }

        case Network.Polkadot: {
          fetchedBalance = await fetchAssetHubBalance(context, token, address)
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
  }, [network, address, token, context])

  useEffect(() => {
    fetchBalance()
  }, [network, token, address, fetchBalance])

  return { data, fetchBalance, loading: loading }
}

export default useErc20Balance
