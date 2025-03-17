import { NotificationSeverity } from '@/models/notification'
import {
  CompletedTransfer,
  OngoingTransfers,
  OngoingTransferWithDirection,
  StoredTransfer,
  TxStatus,
  TxTrackingResult,
} from '@/models/transfer'
import { Direction, resolveDirection } from '@/utils/transfer'
import { getExplorerLink } from '@/utils/explorer'
import {
  findMatchingTransfer,
  getTransferStatus,
  isCompletedTransfer,
  trackTransfers,
} from '@/utils/tracking'
import { TransferStatus } from '@snowbridge/api/dist/history'
import { useCallback, useEffect, useRef, useState } from 'react'
import useCompletedTransfers from './useCompletedTransfers'
import useNotification from './useNotification'
import useOngoingTransfers from './useOngoingTransfers'

type ID = string
type Message = string

const useOngoingTransfersTracker = (ongoingTransfers: StoredTransfer[]) => {
  const [transfers, setTransfers] = useState<TxTrackingResult[]>([])
  const [statusMessages, setStatusMessages] = useState<Record<ID, Message>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const { remove, updateUniqueId } = useOngoingTransfers()
  const { addCompletedTransfer } = useCompletedTransfers()
  const { addNotification } = useNotification()

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
          token: t.token,
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

  const fetchTransfers = useCallback(async () => {
    const formattedTransfers: OngoingTransferWithDirection[] =
      formatTransfersWithDirection(ongoingTransfers)
    if (!formattedTransfers.length) return

    setLoading(true)
    try {
      const transfers: OngoingTransfers = {
        toEthereum: [],
        toPolkadot: [],
      }

      formattedTransfers.map(transfer => {
        switch (transfer.direction) {
          case Direction.ToEthereum: {
            transfers.toEthereum.push(transfer)
            break
          }
          case Direction.ToPolkadot: {
            transfers.toPolkadot.push(transfer)
            break
          }
          default:
            throw new Error('Direction not supported')
        }
      })

      setTransfers(await trackTransfers(transfers))
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

        if (isCompletedTransfer(foundTransfer)) {
          const explorerLink = getExplorerLink(ongoing)

          // Move from ongoing to done
          remove(ongoing.id)
          addCompletedTransfer({
            id: ongoing.id,
            result:
              foundTransfer.status === TransferStatus.Failed ? TxStatus.Failed : TxStatus.Succeeded,
            token: ongoing.token,
            sourceChain: ongoing.sourceChain,
            destChain: ongoing.destChain,
            amount: ongoing.amount,
            tokenUSDValue: ongoing.tokenUSDValue ?? 0,
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
        }
      }
    })
  }, [transfers, addCompletedTransfer, remove, ongoingTransfers, addNotification, updateUniqueId])

  return { transfers, loading, statusMessages, fetchTransfers }
}

export default useOngoingTransfersTracker
