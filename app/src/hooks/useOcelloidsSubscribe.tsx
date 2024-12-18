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
      if (xcmTransfers && xcmTransfers.length > 0) {
        const xcmAgent = await getOcelloidsAgentApi()

        if (xcmAgent) {
          xcmTransfers.map(async t => {
            await xcmOcceloidsSubscribe(xcmAgent, t, remove, addCompletedTransfer, addNotification)
          })
        } else {
          console.error('Failed to initialize Ocelloids Agent')
        }
      }
    }

    fetchAgentAndSubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xcmTransfers.length])
}

export default useOcelloidsSubscribe
