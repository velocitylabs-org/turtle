import { Chain } from '@/models/chain'
import { Token } from '@/models/token'

interface Params {
  /** Token to filter chains by. If provided, only chains that support this token will be returned */
  token?: Token
  /** Source chain to filter chains by. If provided, only chains that support this source chain will be returned */
  sourceChain?: Chain
  /** Destination chain to filter chains by. If provided, only chains that support this destination chain will be returned */
  destChain?: Chain
}

/**
 * Fetches a list of available blockchains for a transfer.
 *
 * @param filters - Filters to apply to the list of available blockchains. Contains the token, source chain, and destination chain.
 * @returns A promise that resolves to a list of available blockchains for a transfer.
 * @throws An error if the fetch request fails.
 */
export const getChains = async ({ token, sourceChain, destChain }: Params): Promise<Chain[]> => {
  // add query params
  const searchParams = new URLSearchParams()
  if (token) searchParams.append('token', token.id)
  if (sourceChain) searchParams.append('sourceChain', sourceChain.id)
  if (destChain) searchParams.append('destChain', destChain.id)

  const response = await fetch('/api/chains?' + searchParams.toString())

  if (!response.ok)
    throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`)

  const chains: Chain[] = await response.json()

  return chains
}
