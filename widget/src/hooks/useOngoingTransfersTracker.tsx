import { TransferStatus } from '@snowbridge/api/dist/history'
import { useQuery } from '@tanstack/react-query'
import { Environment } from '@velocitylabs-org/turtle-registry'
import { useEffect, useState } from 'react'
import { getEnvironment } from '@/lib/snowbridge'
import { NotificationSeverity } from '@/models/notification'
import { CompletedTransfer, StoredTransfer, TxStatus } from '@/models/transfer'
import { updateTransferMetrics } from '@/utils/analytics.ts'
import { getExplorerLink } from '@/utils/explorer'
import {
  findMatchingTransfer,
  getFormattedOngoingTransfers,
  getTransferStatus,
  isCompletedTransfer,
  trackTransfers,
} from '@/utils/tracking'
import useCompletedTransfers from './useCompletedTransfers'
import useNotification from './useNotification'
import useOngoingTransfers from './useOngoingTransfers'

type ID = string
type Message = string

const REVALIDATE = 30 * 1000 // 30 seconds

const useOngoingTransfersTracker = (ongoingTransfers: StoredTransfer[]) => {
  const [statusMessages, setStatusMessages] = useState<Record<ID, Message>>({})
  const { remove, updateProgress } = useOngoingTransfers()
  const { addCompletedTransfer } = useCompletedTransfers()
  const { addNotification } = useNotification()

  const {
    data: transfers,
    isLoading: loading,
    error: trackingError,
  } = useQuery({
    queryKey: ['ongoing-transfers', ongoingTransfers.map(t => t.id)],
    queryFn: async () => {
      const env = getEnvironment(Environment.Mainnet)
      const formattedTransfers = getFormattedOngoingTransfers(ongoingTransfers)
      return trackTransfers(env, formattedTransfers)
    },
    refetchInterval: REVALIDATE,
    staleTime: REVALIDATE,
    enabled: ongoingTransfers.length > 0,
  })

  if (trackingError) {
    console.error('Failed to track transfers:', trackingError.message)
  }

  // update ongoing and completed transfers
  useEffect(() => {
    if (!transfers) return

    ongoingTransfers.forEach(ongoing => {
      if ('error' in transfers) return

      const foundTransfer = findMatchingTransfer(transfers, ongoing)

      if (foundTransfer) {
        // Update transfer status
        const status = getTransferStatus(foundTransfer)
        setStatusMessages(prev => ({ ...prev, [ongoing.id]: status }))

        if (isCompletedTransfer(foundTransfer)) {
          updateProgress(ongoing.id)
          const explorerLink = getExplorerLink(ongoing)
          const failed = foundTransfer.status === TransferStatus.Failed

          // Move from ongoing to done
          remove(ongoing.id)
          addCompletedTransfer({
            id: ongoing.id,
            result: failed ? TxStatus.Failed : TxStatus.Succeeded,
            sourceToken: ongoing.sourceToken,
            destinationToken: ongoing.destinationToken,
            sourceChain: ongoing.sourceChain,
            destChain: ongoing.destChain,
            sourceAmount: ongoing.sourceAmount,
            destinationAmount: ongoing.destinationAmount,
            sourceTokenUSDValue: ongoing.sourceTokenUSDValue ?? 0,
            destinationTokenUSDValue: ongoing.destinationTokenUSDValue,
            fees: ongoing.fees,
            bridgingFee: ongoing.bridgingFee,
            sender: ongoing.sender,
            recipient: ongoing.recipient,
            date: ongoing.date,
            ...(explorerLink && { explorerLink }),
          } satisfies CompletedTransfer)

          addNotification({
            message: 'Transfer completed',
            severity: NotificationSeverity.Success,
            dismissible: true,
          })

          // Analytics tx are created with successful status by default, we only update for failed ones
          if (failed) {
            updateTransferMetrics({
              txHashId: ongoing.id,
              status: TxStatus.Failed,
              environment: ongoing.environment,
            })
          }
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transfers, addCompletedTransfer, remove, ongoingTransfers, addNotification])

  return {
    transfers: transfers ?? [],
    loading,
    statusMessages,
  }
}

export default useOngoingTransfersTracker
