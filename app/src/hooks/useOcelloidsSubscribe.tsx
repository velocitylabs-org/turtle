import { useEffect, useRef } from 'react'
import { getOcelloidsAgentApi, xcmOcceloidsSubscribe } from '@/utils/ocelloids'
import { Direction, resolveDirection } from '@/services/transfer'
import { StoredTransfer } from '@/models/transfer'
import useOngoingTransfers from '@/hooks/useOngoingTransfers'
import useCompletedTransfers from '@/hooks/useCompletedTransfers'
import useNotification from '@/hooks/useNotification'

const useOcelloidsSubscribe = (ongoingTransfers: StoredTransfer[]) => {
  const { remove } = useOngoingTransfers()
  const { addCompletedTransfer } = useCompletedTransfers()
  const { addNotification } = useNotification()

  const { current: subscribedTransfers } = useRef(new Set<string>())

  const xcmTransfers = ongoingTransfers.filter(
    t => resolveDirection(t.sourceChain, t.destChain) === Direction.WithinPolkadot,
  )

  const fetchAgentAndSubscribe = async () => {
    if (xcmTransfers.length === 0) return

    try {
      const xcmAgent = await getOcelloidsAgentApi()
      if (!xcmAgent) throw new Error('Failed to initialize Ocelloids Agent')

      for (const t of xcmTransfers) {
        if (!subscribedTransfers.has(t.id)) {
          try {
            await xcmOcceloidsSubscribe(xcmAgent, t, remove, addCompletedTransfer, addNotification)
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
