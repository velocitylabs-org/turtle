import { getSnowBridgeContext } from '@/lib/snowbridge'
import { useEnvironmentStore } from '@/stores/environmentStore'
import { useQuery } from '@tanstack/react-query'

const useSnowbridgeContext = () => {
  const environment = useEnvironmentStore(state => state.current)

  const {
    data: snowbridgeContext,
    isLoading: isSnowbridgeContextLoading,
    error: snowbridgeContextError,
  } = useQuery({
    queryKey: ['snowbridgeContext', environment],
    queryFn: async () => {
      return await getSnowBridgeContext(environment)
    },
    staleTime: Infinity,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  return { snowbridgeContext, isSnowbridgeContextLoading, snowbridgeContextError }
}

export default useSnowbridgeContext
