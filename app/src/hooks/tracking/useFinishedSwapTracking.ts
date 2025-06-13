import { useEffect } from 'react'
import useCompletedTransfers from '@/hooks/useCompletedTransfers'
import useNotification from '@/hooks/useNotification'
import useOngoingTransfers from '@/hooks/useOngoingTransfers'
import { NotificationSeverity } from '@/models/notification'
import { CompletedTransfer, StoredTransfer, TxStatus } from '@/models/transfer'
import { updateTransferMetrics } from '@/utils/analytics'
import { getExplorerLink, isSameChainSwap } from '@/utils/transfer'

/**
 * Hook to handle swaps tracking. The swap's finalized status (success or failure)
 * is determined by useParaspellApi using on-chain events directly, but we handle
 * cleanup here showing notifications and saving analytics data.
 */
const useFinishedSwapTracking = (ongoingTransfers: StoredTransfer[]) => {
  const { remove } = useOngoingTransfers()
  const { addCompletedTransfer } = useCompletedTransfers()
  const { addNotification } = useNotification()

  useEffect(() => {
    const finalizedSwaps = ongoingTransfers.filter(
      transfer => isSameChainSwap(transfer) && !!transfer.swapOnChainStatus,
    )

    finalizedSwaps.forEach(transfer => {
      const txSuccessful = transfer.swapOnChainStatus === 'success'
      addNotification({
        message: txSuccessful ? 'Swap succeeded!' : 'Swap failed!',
        severity: txSuccessful ? NotificationSeverity.Success : NotificationSeverity.Error,
      })

      const explorerLink = getExplorerLink(transfer)
      remove(transfer.id)
      addCompletedTransfer({
        id: transfer.id,
        result: txSuccessful ? TxStatus.Succeeded : TxStatus.Failed,
        sourceToken: transfer.sourceToken,
        destinationToken: transfer.destinationToken,
        sourceChain: transfer.sourceChain,
        destChain: transfer.destChain,
        sourceAmount: transfer.sourceAmount,
        destinationAmount: transfer.destinationAmount,
        sourceTokenUSDValue: transfer.sourceTokenUSDValue ?? 0,
        destinationTokenUSDValue: transfer.destinationTokenUSDValue,
        fees: transfer.fees,
        bridgingFee: transfer.bridgingFee,
        sender: transfer.sender,
        recipient: transfer.recipient,
        date: transfer.date,
        ...(explorerLink && { explorerLink }),
      } satisfies CompletedTransfer)

      // Analytics tx are created with successful status by default, we only update for failed ones
      if (!txSuccessful) {
        updateTransferMetrics({
          txHashId: transfer.id,
          status: TxStatus.Failed,
          environment: transfer.environment,
        })
      }
    })
  }, [ongoingTransfers])
}

export default useFinishedSwapTracking
