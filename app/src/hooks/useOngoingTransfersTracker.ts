import { TransferStatus } from '@snowbridge/api/dist/history'
import { useCallback, useEffect, useRef, useState } from 'react'
import { NotificationSeverity } from '@/models/notification'
import {
  type CompletedTransfer,
  type OngoingTransferWithDirection,
  type StoredTransfer,
  TxStatus,
  type TxTrackingResult,
} from '@/models/transfer'
import { Direction, resolveDirection } from '@/services/transfer'
import { updateTransferMetrics } from '@/utils/analytics'
import { getExplorerLink } from '@/utils/transfer'
import { findMatchingTransfer, getTransferStatus, isCompletedTransfer } from '@/utils/transferTracking'
import useCompletedTransfers from './useCompletedTransfers'
import useNotification from './useNotification'
import useOngoingTransfers from './useOngoingTransfers'

type ID = string
type Message = string

const formatTransfersWithDirection = (ongoingTransfers: StoredTransfer[]) => {
  return ongoingTransfers
    .map(t => {
      const direction = resolveDirection(t.sourceChain, t.destChain)
      return {
        id: t.id,
        sourceChain: t.sourceChain,
        destChain: t.destChain,
        sender: t.sender,
        recipient: t.recipient,
        sourceToken: t.sourceToken,
        destinationToken: t.destinationToken,
        date: t.date,
        direction,
        ...(t.crossChainMessageHash && { crossChainMessageHash: t.crossChainMessageHash }),
        ...(t.parachainMessageId && { parachainMessageId: t.parachainMessageId }),
        ...(t.sourceChainExtrinsicIndex && {
          sourceChainExtrinsicIndex: t.sourceChainExtrinsicIndex,
        }),
      }
    })
    .filter(t => t.direction !== Direction.WithinPolkadot)
}

const useOngoingTransfersTracker = (ongoingTransfers: StoredTransfer[]) => {
  const [transfers, setTransfers] = useState<TxTrackingResult[]>([])
  const [statusMessages, setStatusMessages] = useState<Record<ID, Message>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const { remove, updateUniqueId } = useOngoingTransfers()
  const { addCompletedTransfer } = useCompletedTransfers()
  const { addNotification } = useNotification()

  const fetchTransfers = useCallback(async () => {
    const formattedTransfers: OngoingTransferWithDirection[] = formatTransfersWithDirection(ongoingTransfers)
    if (!formattedTransfers.length) return

    try {
      setLoading(true)
      const response = await fetch(`/api/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ongoingTransfers: formattedTransfers }),
      })
      const data: TxTrackingResult[] = await response.json()
      setTransfers(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [ongoingTransfers])

  const ongoingTransfersRef = useRef(ongoingTransfers)

  // initiate automatic updates every 30s
  useEffect(() => {
    if (ongoingTransfersRef.current.length > 0) fetchTransfers()
    const intervalId = setInterval(() => {
      if (ongoingTransfersRef.current.length > 0) fetchTransfers()
    }, 30 * 1000)

    return () => clearInterval(intervalId)
  }, [fetchTransfers])

  // update on ongoing transfers change
  useEffect(() => {
    ongoingTransfersRef.current = ongoingTransfers
    if (ongoingTransfers.length > 0) fetchTransfers()
  }, [ongoingTransfers, fetchTransfers])

  // update ongoing and completed transfers
  useEffect(() => {
    ongoingTransfers.forEach(ongoing => {
      if (transfers && 'error' in transfers) return

      const foundTransfer = findMatchingTransfer(transfers, ongoing)

      if (foundTransfer) {
        // Update transfer status
        const status = getTransferStatus(foundTransfer)
        setStatusMessages(prev => ({ ...prev, [ongoing.id]: status }))

        // Look for a subscan trackingUniqueId for any XCM or AH to ETH transfers,
        // to eventually update ongoing transfer store
        const trackingUniqueId =
          'uniqueId' in foundTransfer && foundTransfer.uniqueId.length ? foundTransfer.uniqueId : undefined

        if (ongoing.sourceChain.network === 'Polkadot' && trackingUniqueId && !ongoing.uniqueTrackingId) {
          updateUniqueId(ongoing.id, trackingUniqueId)
        }

        if (isCompletedTransfer(foundTransfer)) {
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

          updateTransferMetrics({
            txHashId: ongoing.id,
            status: failed ? TxStatus.Failed : TxStatus.Succeeded,
          })
        }
      } else {
        // ongoing transfer not found. This means it is more than 2 weeks old.
        // TODO: handle this case
      }
    })
  }, [transfers, addCompletedTransfer, remove, ongoingTransfers, addNotification, updateUniqueId])

  return { transfers, loading, statusMessages, fetchTransfers }
}

export default useOngoingTransfersTracker
