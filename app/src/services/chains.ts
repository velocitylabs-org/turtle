import { REGISTRY } from '@/config/registry'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { Environment } from '@/store/environmentStore'
interface Params {
  /** The environment the request is targeted to */
  environment: Environment
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
export const getChains = async ({
  environment,
  token,
  sourceChain,
  destChain,
}: Params): Promise<Chain[]> => {
  // add query params
  const searchParams = new URLSearchParams()
  searchParams.append('environment', environment.toString())
  if (token) searchParams.append('token', token.id)
  if (sourceChain) searchParams.append('sourceChain', sourceChain.uid)
  if (destChain) searchParams.append('destChain', destChain.uid)

  const response = await fetch('/api/chains?' + searchParams.toString())

  if (!response.ok)
    throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`)

  const chains: Chain[] = await response.json()

  return chains
}

export const getChainLogoURI = (chainName: string, environment: Environment) => {
  const registery = REGISTRY[environment]
  const chainData = registery.chains.filter(x => x.network === chainName)
  return chainData[0].logoURI
}
