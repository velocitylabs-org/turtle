import { Environment } from '@/store/environmentStore'
import { shouldUseTestnet } from '@/utils/env'

const useEnvironment = () => {
  const environment = shouldUseTestnet ? Environment.Testnet : Environment.Mainnet
  return environment
}

export default useEnvironment
