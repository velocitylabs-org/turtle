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
import { getOcelloidsAgentApi, getSubscribableTransfers } from '@/utils/ocelloids'
import { OcelloidsAgentApi, xcm } from '@sodazone/ocelloids-client'

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

const retryStatusVerification = async (
  transfer: StoredTransfer,
  xcmAgent?: OcelloidsAgentApi<xcm.XcmInputs>,
): Promise<TxStatus> => {
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
      console.log('TO DO: implement Ocelloids subscribtion with history', xcmAgent)
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
    let cancelStaleTransfersFinalization = false

    /**
     * Checks all ongoing transfers and force-finalizes those that have been pending for too long.
     * Marks them as completed with fallback status and notifies the user.
     */
    const finalizeStaleTransfers = async () => {
      // make an helper from the following
      let xcmAgent: OcelloidsAgentApi<xcm.XcmInputs> | undefined
      const xcmTransfers = getSubscribableTransfers(ongoingTransfers)
      if (xcmTransfers.length) {
        xcmAgent = await getOcelloidsAgentApi()
        if (!xcmAgent) throw new Error('Failed to initialize Ocelloids Agent')
      }

      for (const transfer of ongoingTransfers) {
        if (cancelStaleTransfersFinalization) break

        if (startedTooLongAgo(transfer)) {
          const verifiedStatus = await retryStatusVerification(transfer, xcmAgent)
          const explorerLink = getExplorerLink(transfer)

          remove(transfer.id)
          addCompletedTransfer({
            id: transfer.id,
            result: TxStatus.Undefined,
            sourceToken: transfer.sourceToken,
            destinationToken: transfer.destinationToken,
            sourceChain: transfer.sourceChain,
            destChain: transfer.destChain,
            sourceAmount: transfer.sourceAmount,
            destinationAmount: transfer.destinationAmount,
            sourceTokenUSDValue: transfer.sourceTokenUSDValue ?? 0,
            destinationTokenUSDValue: transfer.destinationTokenUSDValue ?? 0,
            fees: transfer.fees,
            bridgingFee: transfer.bridgingFee,
            sender: transfer.sender,
            recipient: transfer.recipient,
            date: transfer.date,
            ...(explorerLink && { explorerLink }),
          } satisfies CompletedTransfer)

          const notificationPayload = getNotification(verifiedStatus)
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
                tags: { hook: 'useOngoingTransferCleaner' },
                extra: { transfer: transfer },
              })
          }
        }
      }
    }
    finalizeStaleTransfers()

    return () => {
      cancelStaleTransfersFinalization = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ongoingTransfers])
}

export default useOngoingTransfersCleaner
