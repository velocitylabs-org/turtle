import { assetRegistryFor } from '@snowbridge/registry'
import { useQuery } from '@tanstack/react-query'
import { getSnowBridgeContext } from '@/lib/snowbridge'
import { SnowbridgeContext } from '@/models/snowbridge'

const useSnowbridgeContext = () => {
  const {
    data: snowbridgeContext,
    isLoading: isSnowbridgeContextLoading,
    error: snowbridgeContextError,
  } = useQuery({
    queryKey: ['snowbridgeContext'],
    queryFn: async () => {
      const ctx = (await getSnowBridgeContext()) as SnowbridgeContext
      ctx.registry = assetRegistryFor(ctx.config.environment)

      return ctx
    },
    staleTime: 43200000, // 12 hours in milliseconds
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  return { snowbridgeContext, isSnowbridgeContextLoading, snowbridgeContextError }
}

export default useSnowbridgeContext
