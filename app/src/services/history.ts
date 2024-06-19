import { REGISTRY } from '@/config/registry'
import { Environment } from '@/store/environmentStore'

export const getChainLogoURI = (chainName: string, environment: Environment) => {
  const registery = REGISTRY[environment]
  const chainData = registery.chains.filter(x => x.network === chainName)
  return chainData[0].logoURI
}
