import { useCallback, useEffect, useRef } from 'react'
import useCompletedTransfers from '@/hooks/useCompletedTransfers'
import useNotification from '@/hooks/useNotification'
import useOngoingTransfers from '@/hooks/useOngoingTransfers'
import { getOcelloidsAgentApi, getSubscribableTransfers, xcmOcceloidsSubscribe } from '@/lib/ocelloids'
import type { StoredTransfer } from '@/models/transfer'

const useOcelloidsSubscribe = (ongoingTransfers: StoredTransfer[]) => {
  const { remove, updateStatus, updateProgress } = useOngoingTransfers()
  const { addCompletedTransfer } = useCompletedTransfers()
  const { addNotification } = useNotification()
  const { current: subscribedTransfers } = useRef(new Set<string>())

  const xcmTransfers = getSubscribableTransfers(ongoingTransfers)

  const fetchAgentAndSubscribe = useCallback(async () => {
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
              updateProgress,
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
  }, [xcmTransfers, remove, addCompletedTransfer, updateStatus, addNotification, updateProgress])

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
  }, [xcmTransfers, fetchAgentAndSubscribe])
}

export default useOcelloidsSubscribe
