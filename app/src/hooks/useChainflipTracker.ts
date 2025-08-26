import { captureException } from '@sentry/nextjs'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { type Notification, NotificationSeverity } from '@/models/notification'
import { type CompletedTransfer, type StoredTransfer, TxStatus } from '@/models/transfer'
import { truncateAddress } from '@/utils/address'
import { updateTransferMetrics } from '@/utils/analytics'
import { getChainflipOngoingSwaps, getSwapStatus } from '@/utils/chainflip'
import { getChainflipExplorerLink } from '@/utils/transfer'
import useCompletedTransfers from './useCompletedTransfers'
import useNotification from './useNotification'
import useOngoingTransfers from './useOngoingTransfers'

const handleOngoingSwap = async (
  swap: StoredTransfer,
  updateStatus: (id: string, newStatus?: string) => void,
  addCompletedSwap: (completedTransfer: CompletedTransfer) => void,
  removeOngoingSwap: (id: string) => void,
  addNotification: (notification: Omit<Notification, 'id'>) => void,
): Promise<void> => {
  const { sourceToken, sourceChain, destChain, destinationToken, id, uniqueTrackingId, recipient } = swap
  if (!uniqueTrackingId) throw new Error(`Chainflip swap ${id} does not have a unique tracking id`)
  const status = await getSwapStatus(uniqueTrackingId)
  console.log('status', status)
  const { state } = status
  const formattedRecipient = truncateAddress(recipient)
  switch (state) {
    case 'RECEIVING': {
      const newStatus = `${sourceToken.symbol} funds deposited`
      updateStatus(id, newStatus)
      break
    }
    case 'SWAPPING': {
      const newStatus = `Swapping ${sourceToken.symbol} for ${destinationToken?.symbol}`
      updateStatus(id, newStatus)
      break
    }
    case 'SENDING': {
      const newStatus = `Sending ${destinationToken?.symbol} to ${formattedRecipient}`
      updateStatus(id, newStatus)
      break
    }
    case 'SENT': {
      const newStatus = `Finalizing swap on ${destChain.name} `
      updateStatus(id, newStatus)
      break
    }
    case 'COMPLETED':
    case 'FAILED': {
      const success = state === 'COMPLETED'
      const swapStatus = success ? TxStatus.Succeeded : TxStatus.Failed
      const newStatus = success ? 'Transfer completed!' : 'Transfer failed!'
      updateStatus(id, newStatus)

      addNotification({
        message: newStatus,
        severity: success ? NotificationSeverity.Success : NotificationSeverity.Error,
        dismissible: true,
      })

      const explorerLink = getChainflipExplorerLink(swap, status.swapId)
      addCompletedSwap({
        id: id,
        result: swapStatus,
        sourceToken,
        destinationToken,
        sourceChain,
        destChain,
        sourceAmount: swap.sourceAmount,
        destinationAmount: swap.destinationAmount,
        sourceTokenUSDValue: swap.sourceTokenUSDValue ?? 0,
        destinationTokenUSDValue: swap.destinationTokenUSDValue,
        fees: swap.fees,
        sender: swap.sender,
        recipient,
        date: swap.date,
        ...(explorerLink && { explorerLink }),
      } satisfies CompletedTransfer)

      removeOngoingSwap(id)

      updateTransferMetrics({
        txHashId: swap.id,
        status: swapStatus,
      })

      if (!success) {
        captureException(new Error(`Chainflip swap ${id} failed - ${uniqueTrackingId}`), {
          tags: { source: 'useChainflipTracker' },
          extra: { swap, swapData: status },
        })
      }
      break
    }

    default:
      break
  }
}

export const useChainflipTracker = (ongoingTransfers: StoredTransfer[]): void => {
  // Ref to prevent polling overlap
  const isPollingRef = useRef(false)
  const { remove, updateStatus } = useOngoingTransfers()
  const { addCompletedTransfer } = useCompletedTransfers()
  const { addNotification } = useNotification()
  const chainflipSwaps = useMemo(() => getChainflipOngoingSwaps(ongoingTransfers), [ongoingTransfers])

  const pollStatuses = useCallback(
    async (swaps: StoredTransfer[]) => {
      if (swaps.length === 0 || isPollingRef.current) return
      isPollingRef.current = true
      try {
        const results = await Promise.allSettled(
          swaps.map(s => handleOngoingSwap(s, updateStatus, addCompletedTransfer, remove, addNotification)),
        )

        // Report failed tracking attempts to Sentry
        results.forEach((r, i) => {
          if (r.status === 'rejected') {
            captureException(r.reason, {
              extra: {
                sawp: swaps[i],
              },
              tags: {
                source: 'useChainflipTracker',
              },
              level: 'error',
            })
          }
        })
        // no catch needed
      } finally {
        isPollingRef.current = false
      }
    },
    [updateStatus, addCompletedTransfer, remove, addNotification],
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only care about chainflipSwaps length not content
  useEffect(() => {
    if (chainflipSwaps.length === 0) return

    // immediate
    pollStatuses(chainflipSwaps)

    // then poll every 20s
    const interval = setInterval(() => pollStatuses(chainflipSwaps), 20_000)
    return () => clearInterval(interval)
  }, [chainflipSwaps.length, pollStatuses])
}
