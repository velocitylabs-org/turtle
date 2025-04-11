import { NotificationSeverity } from '@/models/notification'
import { historyV2 as history } from '@snowbridge/api'
import { CompletedTransfer, StoredTransfer, TxStatus } from '@/models/transfer'
import { getExplorerLink, startedTooLongAgo } from '@/utils/transfer'
import { captureException } from '@sentry/nextjs'
import { useEffect } from 'react'
import useCompletedTransfers from './useCompletedTransfers'
import useNotification from './useNotification'
import useOngoingTransfers from './useOngoingTransfers'
import { Direction, resolveDirection } from '@/services/transfer'
import { TransferStatus } from '@snowbridge/api/dist/history_v2'

type ResultNotification = {
  message: string
  severity: NotificationSeverity
  shouldCaptureException: boolean
}

const getNotification = (status: TxStatus): ResultNotification | undefined => {
  switch (status) {
    case TxStatus.Undefined: {
      return {
        message: 'Something went wrong',
        severity: NotificationSeverity.Warning,
        shouldCaptureException: true,
      }
    }
    case TxStatus.Failed: {
      return {
        message: 'Transfer failed!',
        severity: NotificationSeverity.Error,
        shouldCaptureException: true,
      }
    }
    default:
      return {
        message: 'Transfer completed!',
        severity: NotificationSeverity.Success,
        shouldCaptureException: false,
      }
  }
}

const retryStatusVerification = async (transfer: StoredTransfer): Promise<TxStatus> => {
  const direction = resolveDirection(transfer.sourceChain, transfer.destChain)

  switch (direction) {
    case Direction.ToPolkadot: {
      const tx = await history.toPolkadotTransferById(transfer.id)
      if (tx && tx.status !== TransferStatus.Pending) tx.status
      return TxStatus.Undefined
    }
    case Direction.ToEthereum: {
      const tx = await history.toEthereumTransferById(
        transfer.parachainMessageId ? transfer.parachainMessageId : transfer.id,
      )
      if (tx && tx.status !== TransferStatus.Pending) tx.status
      return TxStatus.Undefined
    }
    case Direction.WithinPolkadot: {
      // WIP
      return TxStatus.Undefined
    }
    default:
      return TxStatus.Undefined
  }
}

const useOngoingTransfersCleaner = (ongoingTransfers: StoredTransfer[]) => {
  const { remove } = useOngoingTransfers()
  const { addCompletedTransfer } = useCompletedTransfers()
  const { addNotification } = useNotification()

  useEffect(() => {
    let cancelCleaning = false

    const processCleaning = async () => {
      for (const ongoing of ongoingTransfers) {
        if (cancelCleaning) break

        if (startedTooLongAgo(ongoing)) {
          const retriedStatus = await retryStatusVerification(ongoing)
          const explorerLink = getExplorerLink(ongoing)

          remove(ongoing.id)
          addCompletedTransfer({
            id: ongoing.id,
            result: retriedStatus,
            token: ongoing.token,
            sourceChain: ongoing.sourceChain,
            destChain: ongoing.destChain,
            amount: ongoing.amount,
            tokenUSDValue: ongoing.tokenUSDValue ?? 0,
            fees: ongoing.fees,
            bridgingFee: ongoing.bridgingFee,
            sender: ongoing.sender,
            recipient: ongoing.recipient,
            date: ongoing.date,
            ...(explorerLink && { explorerLink }),
          } satisfies CompletedTransfer)

          const notificationPayload = getNotification(retriedStatus)
          if (notificationPayload) {
            const { message, severity, shouldCaptureException } = notificationPayload

            addNotification({
              message: message,
              severity: severity,
              dismissible: true,
            })

            shouldCaptureException &&
              captureException(new Error(message), {
                level: 'warning',
                tags: { hook: 'useOngoingTransfersCleaner' },
                extra: { transfer: ongoing },
              })
          }
        }
      }
    }
    processCleaning()

    return () => {
      cancelCleaning = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ongoingTransfers])
}

export default useOngoingTransfersCleaner
