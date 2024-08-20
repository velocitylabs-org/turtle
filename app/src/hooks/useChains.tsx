import { Mainnet, REGISTRY } from '@/config/registry'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { Environment } from '@/store/environmentStore'
import { useCallback, useEffect, useState } from 'react'
import useEnvironment from './useEnvironment'

interface Params {
  supportedToken?: Token
  supportedSourceChain?: Chain
  supportedDestChain?: Chain
}

const useChains = ({ supportedToken, supportedSourceChain, supportedDestChain }: Params = {}) => {
  const [chains, setChains] = useState<Chain[]>([])
  const env = useEnvironment()

  const filterChains = useCallback(async () => {
    let filteredChains: Chain[]

    if (supportedSourceChain)
      filteredChains = getFilteredDestinationChains(env, supportedSourceChain, supportedToken)
    else if (supportedDestChain)
      filteredChains = getFilteredSourceChains(env, supportedDestChain, supportedToken)
    else
      filteredChains =
        env === Environment.Mainnet ? REGISTRY.mainnet.chains : REGISTRY.testnet.chains

    setChains(filteredChains)
  }, [supportedToken, supportedSourceChain, supportedDestChain, env])

  useEffect(() => {
    filterChains()
  }, [filterChains])

  return {
    chains,
  }
}

export default useChains

export function getFilteredSourceChains(
  environment: Environment,
  _destinationChain?: Chain | null,
  _token?: Token | null,
): Chain[] {
  const availableChains =
    environment === Environment.Mainnet ? REGISTRY.mainnet.chains : REGISTRY.testnet.chains

  return availableChains.filter(chain => chain !== Mainnet.Mythos)
}

export function getFilteredDestinationChains(
  environment: Environment,
  sourceChain?: Chain | null,
  _token?: Token | null,
): Chain[] {
  const availableChains =
    environment === Environment.Mainnet ? REGISTRY.mainnet.chains : REGISTRY.testnet.chains

  if (sourceChain !== Mainnet.Ethereum)
    return availableChains.filter(chain => chain !== Mainnet.Mythos)
  return availableChains
}
