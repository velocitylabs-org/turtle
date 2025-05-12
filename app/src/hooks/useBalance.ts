import { getTransferableAmount, TNodeDotKsmWithRelayChains } from '@paraspell/sdk'
import { captureException } from '@sentry/nextjs'
import { Environment, Chain, Token } from '@velocitylabs-org/turtle-registry'
import { useCallback, useEffect, useState } from 'react'
import { useBalance as useBalanceWagmi } from 'wagmi'
import { Balance } from '@/services/balance'

import { getNativeToken, getParaSpellNode, getParaspellToken } from '@/utils/paraspellTransfer'
import { toHuman } from '@/utils/transfer'

interface UseBalanceParams {
  env: Environment
  chain?: Chain | null
  token?: Token
  address?: string
}

/** Hook to fetch different balances for a given address and token. Supports Ethereum and Polkadot networks. */
const useBalance = ({ env, chain, token, address }: UseBalanceParams) => {
  const [balance, setBalance] = useState<Balance | undefined>()
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
      let fetchedBalance: Balance | undefined

      switch (chain.network) {
        case 'Ethereum': {
          fetchedBalance =
            getNativeToken(chain).id === token.id
              ? (await fetchEthBalance()).data
              : (await fetchErc20Balance()).data

          if (fetchedBalance)
            // apply a 90% factor to safe-guard for fees and other unseen costs
            fetchedBalance.formatted = (toHuman(fetchedBalance.value, token) * 0.9).toString() // override formatted value
          break
        }

        case 'Polkadot': {
          fetchedBalance = await getBalance(chain, token, address)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [env, chain, address, token?.id, fetchErc20Balance, fetchEthBalance])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  return { balance, fetchBalance, loading: loading || loadingErc20Balance || loadingEthBalance }
}

export default useBalance

export async function getBalance(
  chain: Chain,
  token: Token,
  address: string,
): Promise<Balance | undefined> {
  const node = getParaSpellNode(chain)
  if (!node) throw new Error('Node not found')
  const currency = getParaspellToken(token, node)

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
