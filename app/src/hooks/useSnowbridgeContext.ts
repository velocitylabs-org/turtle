import { assetsV2 } from '@snowbridge/api'
import { useQuery } from '@tanstack/react-query'
import { getSnowBridgeContext } from '@/context/snowbridge'
import useEnvironment from '@/hooks/useEnvironment'
import { SnowbridgeContext } from '@/models/snowbridge'

const useSnowbridgeContext = () => {
  const environment = useEnvironment()

  const {
    data: snowbridgeContext,
    isLoading: isSnowbridgeContextLoading,
    error: snowbridgeContextError,
  } = useQuery({
    queryKey: ['snowbridgeContext', environment],
    queryFn: async () => {
      const ctx = (await getSnowBridgeContext(environment)) as SnowbridgeContext
      ctx.registry = await assetsV2.buildRegistry(await assetsV2.fromContext(ctx))

      return ctx
    },
    staleTime: 43200000, // 12 hours in milliseconds
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  return { snowbridgeContext, isSnowbridgeContextLoading, snowbridgeContextError }
}

export default useSnowbridgeContext
