import { getSnowBridgeContext } from '@/context/snowbridge'
import useEnvironment from '@/hooks/useEnvironment'
import { useQuery } from '@tanstack/react-query'

const useSnowbridgeContext = () => {
  const environment = useEnvironment()

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

  return { snowbridgeContext, isSnowbridgeContextLoading, snowbridgeContextError }
}

export default useSnowbridgeContext
