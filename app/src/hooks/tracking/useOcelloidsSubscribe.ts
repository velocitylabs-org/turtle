import { useEffect, useRef } from 'react'
import useCompletedTransfers from '@/hooks/useCompletedTransfers'
import useNotification from '@/hooks/useNotification'
import useOngoingTransfers from '@/hooks/useOngoingTransfers'
import { StoredTransfer } from '@/models/transfer'
import {
  getOcelloidsAgentApi,
  getSubscribableTransfers,
  xcmOcceloidsSubscribe,
} from '@/utils/ocelloids'

/**
 * Hook that tracks Polkadot XCM transfers using Ocelloids SDK.
 * This hook subscribes to transfer events using Ocelloids Agent API,
 * monitors transfer status, and handles completion notifications.
 */

const useOcelloidsSubscribe = (ongoingTransfers: StoredTransfer[]) => {
  const { remove, updateStatus } = useOngoingTransfers()
  const { addCompletedTransfer } = useCompletedTransfers()
  const { addNotification } = useNotification()
  const { current: subscribedTransfers } = useRef(new Set<string>())

  const xcmTransfers = getSubscribableTransfers(ongoingTransfers)

  const fetchAgentAndSubscribe = async () => {
    if (xcmTransfers.length === 0) return

    try {
      const xcmAgent = await getOcelloidsAgentApi()
      if (!xcmAgent) throw new Error('Failed to initialize Ocelloids Agent')

      for (const t of xcmTransfers) {
        if (!subscribedTransfers.has(t.id)) {
          try {
            await xcmOcceloidsSubscribe(
              xcmAgent,
              t,
              remove,
              addCompletedTransfer,
              updateStatus,
              addNotification,
            )
            subscribedTransfers.add(t.id)
          } catch (error) {
            console.error('Error subscribing to transfer:', t, error)
          }
        }
      }
    } catch (error) {
      console.error('Error during Ocelloids subscription:', error)
    }
  }

  useEffect(() => {
    fetchAgentAndSubscribe()

    return () => {
      const activeIds = xcmTransfers.map(t => t.id)

      subscribedTransfers.forEach(id => {
        if (!activeIds.includes(id)) {
          subscribedTransfers.delete(id)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xcmTransfers])
}
export default useOcelloidsSubscribe
