import { NotificationSeverity } from '@/models/notification'
import { CompletedTransfer, StoredTransfer, TxStatus } from '@/models/transfer'
import { getExplorerLink } from '@/utils/explorer'
import { startedTooLongAgo } from '@/utils/transfer'
import { useEffect } from 'react'
import useCompletedTransfers from './useCompletedTransfers'
import useNotification from './useNotification'
import useOngoingTransfers from './useOngoingTransfers'

const useOngoingTransfersCleaner = (ongoingTransfers: StoredTransfer[]) => {
  const { remove } = useOngoingTransfers()
  const { addCompletedTransfer } = useCompletedTransfers()
  const { addNotification } = useNotification()

  useEffect(() => {
    ongoingTransfers.forEach(ongoing => {
      if (startedTooLongAgo(ongoing)) {
        const explorerLink = getExplorerLink(ongoing)

        remove(ongoing.id)
        addCompletedTransfer({
          id: ongoing.id,
          result: TxStatus.Undefined,
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
          message: 'Transfer tracking failed',
          severity: NotificationSeverity.Warning,
          dismissible: true,
        })
        // captureException(new Error('Transfer tracking failed'), { extra: { ongoing } }) - Sentry
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ongoingTransfers])
}

export default useOngoingTransfersCleaner
