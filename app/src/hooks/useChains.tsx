import { Mainnet, REGISTRY } from '@/config/registry'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { Environment } from '@/store/environmentStore'
import { useCallback, useEffect, useState } from 'react'
import useEnvironment from './useEnvironment'

interface Params {
  supportedToken?: Token | null
  supportedSourceChain?: Chain | null
  supportedDestChain?: Chain | null
}

const useChains = ({ supportedToken, supportedSourceChain, supportedDestChain }: Params = {}) => {
  const [chains, setChains] = useState<Chain[]>([])
  const env = useEnvironment()

  const filterChains = useCallback(async () => {
    let filteredChains: Chain[]

    if (supportedSourceChain)
      filteredChains = getFilteredDestinationChains(env, supportedSourceChain, supportedToken)
    else filteredChains = getFilteredSourceChains(env, supportedDestChain, supportedToken)

    setChains(filteredChains)
  }, [supportedToken, supportedSourceChain, supportedDestChain, env])

  useEffect(() => {
    filterChains()
  }, [filterChains])

  return chains
}

export default useChains

export function getFilteredSourceChains(
  environment: Environment,
  _destinationChain?: Chain | null,
  _token?: Token | null,
): Chain[] {
  const availableChains =
    environment === Environment.Mainnet ? REGISTRY.mainnet.chains : REGISTRY.testnet.chains

  // filter out some Parachains
  return availableChains.filter(chain => chain.uid !== Mainnet.Mythos.uid)
}

export function getFilteredDestinationChains(
  environment: Environment,
  sourceChain?: Chain | null,
  _token?: Token | null,
): Chain[] {
  const availableChains =
    environment === Environment.Mainnet ? REGISTRY.mainnet.chains : REGISTRY.testnet.chains

  // Filter out some Parachains if the sourceChain is not Ethereum
  if (sourceChain && sourceChain.uid !== Mainnet.Ethereum.uid) {
    return availableChains.filter(chain => chain.uid !== Mainnet.Mythos.uid)
  }

  return availableChains
}
