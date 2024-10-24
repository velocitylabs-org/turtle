import { getNativeToken } from '@/config/registry'
import { Chain, Network } from '@/models/chain'
import { Token } from '@/models/token'
import { Erc20Balance } from '@/services/balance'
import { Environment } from '@/store/environmentStore'
import { getNativeBalance, getNonNativeBalance, SupportedChains } from '@/utils/papi'
import { toHuman } from '@/utils/transfer'
import { captureException } from '@sentry/nextjs'
import { TypedApi } from 'polkadot-api'
import { useCallback, useEffect, useState } from 'react'
import { useBalance as useBalanceWagmi } from 'wagmi'

interface UseBalanceParams {
  env: Environment
  api?: TypedApi<SupportedChains>
  chain?: Chain | null
  token?: Token
  address?: string
}

/** Hook to fetch different balances for a given address and token. Supports Ethereum and Polkadot networks. */
const useBalance = ({ env, api, chain, token, address }: UseBalanceParams) => {
  const [balance, setBalance] = useState<Erc20Balance | undefined>()
  const [loading, setLoading] = useState<boolean>(false)
  // Wagmi token balance
  const { refetch: fetchErc20Balance, isLoading: loadingErc20Balance } = useBalanceWagmi({
    address: address?.startsWith('0x') ? (address as `0x${string}`) : undefined,
    token: token?.address?.startsWith('0x') ? (token.address as `0x${string}`) : undefined,
    query: {
      enabled: false, // disable auto-fetching
    },
  })
  // Wagmi native balance
  const { refetch: fetchEthBalance, isLoading: loadingEthBalance } = useBalanceWagmi({
    address: address?.startsWith('0x') ? (address as `0x${string}`) : undefined,
    query: {
      enabled: false, // disable auto-fetching
    },
  })

  const fetchBalance = useCallback(async () => {
    // Reset balance first to avoid showing the balance on another
    // chain or for another token while fetching the new one.
    setBalance(undefined)

    if (!env || !chain || !token || !address) return

    try {
      setLoading(true)
      let fetchedBalance: Erc20Balance | undefined

      switch (chain.network) {
        case Network.Ethereum: {
          fetchedBalance =
            getNativeToken(chain).id === token.id
              ? (await fetchEthBalance()).data
              : (await fetchErc20Balance()).data

          if (fetchedBalance)
            fetchedBalance.formatted = toHuman(fetchedBalance.value, token).toString() // override formatted value
          break
        }

        case Network.Polkadot: {
          if (getNativeToken(chain).id === token.id) {
            const result = await getNativeBalance(api, address)

            fetchedBalance = {
              value: result?.data.free || 0n,
              formatted: toHuman(result?.data.free || 0n, token).toString(),
              decimals: token.decimals,
              symbol: token.symbol,
            }
          } else {
            const result = await getNonNativeBalance(api, chain, token, address)

            fetchedBalance = {
              value: result?.free || 0n,
              formatted: toHuman(result?.free || 0n, token).toString(),
              decimals: token.decimals,
              symbol: token.symbol,
            }
          }

          break
        }

        default:
          throw new Error('Unsupported network')
      }

      setBalance(fetchedBalance)
    } catch (error) {
      console.error('Failed to fetch balance', error)
      captureException(error)
    } finally {
      setLoading(false)
    }
  }, [env, api, chain, address, token, fetchErc20Balance, fetchEthBalance])

  useEffect(() => {
    fetchBalance()
  }, [chain, token, address, fetchBalance])

  return { balance, fetchBalance, loading: loading || loadingErc20Balance || loadingEthBalance }
}

export default useBalance
