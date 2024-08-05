import { Environment } from '@/store/environmentStore'
import { shouldUseTestnet } from '@/utils/env'

const useEnvironment = () => {
  // Kept this for when we will allow a user to switch between mainnet and testnet.

  // const environment = useEnvironmentStore(state => state.current)
  // const switchTo = useEnvironmentStore(state => state.switchTo)

  const environment = shouldUseTestnet ? Environment.Testnet : Environment.Mainnet
  return { environment }
}

export default useEnvironment
