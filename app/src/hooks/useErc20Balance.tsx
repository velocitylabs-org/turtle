import { Network } from '@/models/chain'
import { useCallback, useEffect, useState } from 'react'
import { useBalance } from 'wagmi'

interface UseBalanceParams {
  network?: Network
  tokenAddress?: string // Could be extended to support multiple tokens
  address?: string
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
const useErc20Balance = ({ network, tokenAddress, address }: UseBalanceParams) => {
  const [data, setData] = useState<Erc20Balance | undefined>()
  const [loading, setLoading] = useState<boolean>(false)

  const wagmiData = useBalance({
    token: tokenAddress as `0x${string}`,
    address: address as `0x${string}`,
    query: {
      enabled: network === Network.Ethereum,
    },
  })

  useEffect(() => {
    if (network !== Network.Ethereum && !tokenAddress && !address) return
    wagmiData.refetch().then(data => setData(data.data))
  }, [network, tokenAddress, address])

  const fetchBalance = useCallback(async () => {
    if (!network || !address) return

    setLoading(true)
    try {
      let fetchedBalance: Erc20Balance | undefined
      switch (network) {
        case Network.Ethereum: {
          fetchedBalance = (await wagmiData.refetch()).data
          break
        }
        case Network.Polkadot: {
          // TODO: Fetch balance from Polkadot
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
  }, [network, address])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  return { data, loading: loading || wagmiData.isLoading }
}

export default useErc20Balance
