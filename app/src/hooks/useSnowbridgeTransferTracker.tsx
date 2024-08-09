import { CompletedTransfer, TxStatus } from '@/models/transfer'
import { getTransferStatus, isCompletedTransfer } from '@/utils/snowbridge'
import { getExplorerLink } from '@/utils/transfer'
import {
  ToEthereumTransferResult,
  ToPolkadotTransferResult,
  TransferStatus,
} from '@snowbridge/api/dist/history'
import { useCallback, useEffect, useRef, useState } from 'react'
import useCompletedTransfers from './useCompletedTransfers'
import useOngoingTransfers from './useOngoingTransfers'
import { NotificationSeverity } from '@/models/notification'
import useNotification from './useNotification'

type ID = string
type Message = string

const useSnowbridgeTransferTracker = () => {
  const [transfers, setTransfers] = useState<
    (ToEthereumTransferResult | ToPolkadotTransferResult)[]
  >([])
  const [statusMessages, setStatusMessages] = useState<Record<ID, Message>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const { removeTransfer: removeOngoingTransfer, ongoingTransfers } = useOngoingTransfers()
  const { addCompletedTransfer } = useCompletedTransfers()
  const { addNotification } = useNotification()

  const fetchTransfers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/history')
      const data = await response.json()
      setTransfers(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

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
      const foundTransfer = transfers.find(transfer => transfer.id === ongoing.id)
      if (foundTransfer) {
        const msg = getStatusMessage(foundTransfer)
        setStatusMessages(prev => ({ ...prev, [ongoing.id]: msg }))

        if (isCompletedTransfer(foundTransfer)) {
          const explorerLink = getExplorerLink(ongoing)

          removeOngoingTransfer(ongoing.id)
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
      } else {
        // ongoing transfer not found. This means it is more than 2 weeks old.
        // TODO: handle this case
      }
    })
  }, [transfers, addCompletedTransfer, removeOngoingTransfer, ongoingTransfers, addNotification])

  const getStatusMessage = (result: ToEthereumTransferResult | ToPolkadotTransferResult) => {
    return getTransferStatus(result)
  }

  return { transfers, loading, statusMessages, fetchTransfers }
}

export default useSnowbridgeTransferTracker
