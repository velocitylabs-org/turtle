import { useEffect } from 'react'
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

  const xcmTransfers = ongoingTransfers.filter(
    t => resolveDirection(t.sourceChain, t.destChain) === Direction.WithinPolkadot,
  )

  useEffect(() => {
    const fetchAgentAndSubscribe = async () => {
      if (xcmTransfers.length === 0) return
      try {
        const xcmAgent = await getOcelloidsAgentApi()
        if (!xcmAgent) throw new Error('Failed to initialize Ocelloids Agent')

        for (const t of xcmTransfers) {
          try {
            await xcmOcceloidsSubscribe(xcmAgent, t, remove, addCompletedTransfer, addNotification)
          } catch (error) {
            console.error('Error subscribing to transfer:', t, error)
          }
        }
      } catch (error) {
        console.error('Error during Ocelloids subscription:', error)
      }
    }

    fetchAgentAndSubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xcmTransfers.length])
}

export default useOcelloidsSubscribe
