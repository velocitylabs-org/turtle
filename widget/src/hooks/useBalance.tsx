import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { Erc20Balance } from '@/models/balance'
import { Environment } from '@/stores/environmentStore'
import { getCurrencyId, getNativeToken, getParaSpellNode } from '@/lib/paraspell'
import { toHuman } from '@/utils/transfer'
import { getTransferableAmount, TNodeDotKsmWithRelayChains } from '@paraspell/sdk'
import { useCallback, useEffect, useState } from 'react'
import { useBalance as useBalanceWagmi } from 'wagmi'

interface UseBalanceParams {
  env: Environment
  chain?: Chain | null
  token?: Token
  address?: string
}

export async function getBalance(
  env: Environment,
  chain: Chain,
  token: Token,
  address: string,
): Promise<Erc20Balance | undefined> {
  const node = getParaSpellNode(chain)
  if (!node) throw new Error('Node not found')
  const currency = getCurrencyId(env, node, chain.uid, token)

  const balance =
    (await getTransferableAmount({
      address,
      node: node as TNodeDotKsmWithRelayChains,
      currency,
      api: chain.rpcConnection,
    })) ?? 0n

  return {
    value: balance,
    decimals: token.decimals,
    symbol: token.symbol,
    formatted: toHuman(balance, token).toString(),
  }
}

/** Hook to fetch different balances for a given address and token. Supports Ethereum and Polkadot networks. */
const useBalance = ({ env, chain, token, address }: UseBalanceParams) => {
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
        case 'Ethereum': {
          fetchedBalance =
            getNativeToken(chain).id === token.id
              ? (await fetchEthBalance()).data
              : (await fetchErc20Balance()).data

          if (fetchedBalance)
            fetchedBalance.formatted = toHuman(fetchedBalance.value, token).toString() // override formatted value
          break
        }

        case 'Polkadot': {
          fetchedBalance = await getBalance(env, chain, token, address)
          break
        }

        default:
          throw new Error('Unsupported network')
      }

      setBalance(fetchedBalance)
    } catch (error) {
      console.error('Failed to fetch balance', error)
      // captureException(error) - Sentry
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [env, chain, address, token?.id, fetchErc20Balance, fetchEthBalance])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  return { balance, fetchBalance, loading: loading || loadingErc20Balance || loadingEthBalance }
}

export default useBalance
