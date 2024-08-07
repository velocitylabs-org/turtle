'use client'

import { useQuery } from '@tanstack/react-query'
import { getSnowBridgeStatus } from '@/context/snowbridge'
import useSnowbridgeContext from '@/hooks/useSnowbridgeContext'
import { DisplaysTransfers, TransferTab } from '@/models/transfer'
import { useOngoingTransfersStore } from '@/store/ongoingTransfersStore'
import OngoingTransferDialog from './OngoingTransferDialog'
import useSnowbridgeTransferTracker from '@/hooks/useSnowbridgeTransferTracker'

// Could be registered if needed in a env variable:
const DEFAULT_AVERAGE_TRANSFER_EXECUTION = 30 // minutes
const DEFAULT_AVERAGE_TRANSFER_STATUS = {
  ethBridgeStatus: DEFAULT_AVERAGE_TRANSFER_EXECUTION * 60, // converted to seconds
  polkadotBridgeStatus: DEFAULT_AVERAGE_TRANSFER_EXECUTION * 60, // converted to seconds
}
const INITIAL_BRIDGE_STATUS = {
  ethBridgeStatus: 0,
  polkadotBridgeStatus: 0,
}

const OngoingTransfers = ({
  newTransferInit,
  setNewTransferInit,
  hasCompletedTransfers,
}: DisplaysTransfers) => {
  const ongoingTransfers = useOngoingTransfersStore(state => state.transfers)
  const {
    snowbridgeContext: transferContext,
    isSnowbridgeContextLoading: transferContextLoading,
    snowbridgeContextError: transferContextError,
  } = useSnowbridgeContext()
  const { statusMessages } = useSnowbridgeTransferTracker()

  const { data: estimatedTransferDuration, error: estimatedTransferDurationError } = useQuery({
    queryKey: ['transferStatus', transferContextLoading],
    queryFn: async () => {
      if (transferContextError)
        throw new Error(`Transfer status fetch error: ${transferContextError.message}`)

      if (ongoingTransfers.length > 0 && !transferContextLoading && transferContext) {
        return await getSnowBridgeStatus(transferContext)
      }
      return INITIAL_BRIDGE_STATUS
    },
    staleTime: (DEFAULT_AVERAGE_TRANSFER_EXECUTION / 5) * (60 * 1000), // stale data for 6 mins in milisecs
    gcTime: (DEFAULT_AVERAGE_TRANSFER_EXECUTION / 2) * (60 * 1000), // cache data for 15 mins in milisecs
  })

  return (
    <div>
      {transferContext && ongoingTransfers && ongoingTransfers.length > 0 && (
        <div className="my-20">
          <div className="self-center text-center text-3xl tracking-tight text-black">
            In Progress
          </div>
          <div className="mt-8 flex w-full flex-col gap-2 rounded-[24px] bg-white p-[2.5rem] px-[1.5rem] py-[2rem] shadow-[0_2px_16px_0px_#00000026] sm:p-[2.5rem]">
            {ongoingTransfers.map(tx => (
              <OngoingTransferDialog
                key={tx.id}
                transfer={tx}
                transferStatus={statusMessages[tx.id]}
                estimatedTransferDuration={
                  estimatedTransferDurationError
                    ? DEFAULT_AVERAGE_TRANSFER_STATUS
                    : estimatedTransferDuration
                }
              />
            ))}

            {hasCompletedTransfers && (
              <button
                onClick={() =>
                  newTransferInit === TransferTab.New && setNewTransferInit(TransferTab.Completed)
                }
                disabled={!hasCompletedTransfers}
                className="text-turtle-foreground)] w-full rounded-[8px] border border-turtle-level3 py-[8px] text-center text-lg"
              >
                View completed transactions <i className="fas fa-arrow-right ml-1"></i>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default OngoingTransfers
