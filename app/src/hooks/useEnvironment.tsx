import { useQuery } from '@tanstack/react-query'
import { Environment } from '@/store/environmentStore'
import { getSnowBridgeContext } from '@/context/snowbridge'
import { shouldUseTestnet } from '@/utils/env'

const useEnvironment = () => {
  // const environment = useEnvironmentStore(state => state.current)
  // const switchTo = useEnvironmentStore(state => state.switchTo)

  const environment = shouldUseTestnet ? Environment.Testnet : Environment.Mainnet
  const {
    data: snowbridgeContext,
    isLoading: isSnowbridgeContextLoading,
    error: snowbridgeContextError,
  } = useQuery({
    queryKey: ['snowbridgeContext', environment],
    queryFn: async () => {
      return await getSnowBridgeContext()
    },
    staleTime: Infinity,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  return { environment, snowbridgeContext, isSnowbridgeContextLoading, snowbridgeContextError }
}

export default useEnvironment
