import { Direction } from '@/services/transfer'
import useSnowbridgeContext from './useSnowbridgeContext'
import { useQuery } from '@tanstack/react-query'
import { getSnowBridgeEtimatedTransferDuration } from '@/context/snowbridge'
import { Context } from '@snowbridge/api'

export type EstimatedTransferDuration = {
  ethBridgeStatus: number // to Ethereum
  polkadotBridgeStatus: number // to Polkadot
  xcmTransferStatus: number
}

const DEFAULT_CACHE_DURATION = 30 // minutes

const DEFAULT_AVERAGE_TRANSFER_DURATION = {
  ethBridgeStatus: 4 * 60 * 60, // 30 mins in seconds
  polkadotBridgeStatus: 30 * 60, // 4h in seconds
  xcmTransferStatus: 2 * 60, // 2 mins in seconds
}

const useTransferEstimate = (direction: Direction): EstimatedTransferDuration => {
  const isSnowbridgeTransfer =
    direction === Direction.ToEthereum || direction === Direction.ToPolkadot
  const {
    snowbridgeContext: transferContext,
    isSnowbridgeContextLoading: transferContextLoading,
    snowbridgeContextError: transferContextError,
  } = useSnowbridgeContext()

  if (transferContextError) {
    console.error(`Transfer status fetch error: ${transferContextError.message}`)
  }
  const allowQuery =
    !transferContextLoading && !!transferContext && !transferContextError && isSnowbridgeTransfer

  return (
    useQuery({
      queryKey: ['transferEstimation'],
      queryFn: async () => {
        return {
          ...(await getSnowBridgeEtimatedTransferDuration(transferContext as Context)),
          xcmTransferStatus: DEFAULT_AVERAGE_TRANSFER_DURATION.xcmTransferStatus,
        }
      },
      enabled: allowQuery,
      staleTime: (DEFAULT_CACHE_DURATION / 3) * (60 * 1000), // stale data for 10 mins in milisecs
      gcTime: DEFAULT_CACHE_DURATION * 60 * 1000, // cache data for 30 mins in milisecs
    }).data ?? DEFAULT_AVERAGE_TRANSFER_DURATION
  )
}

export default useTransferEstimate
