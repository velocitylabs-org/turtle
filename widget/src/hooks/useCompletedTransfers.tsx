import useStore from './useStore'

import { useCompletedTransfersStore } from '@/stores/completedTransfersStore'

const useCompletedTransfers = () => {
  const completedTransfers = useStore(useCompletedTransfersStore, state => state.completedTransfers)
  const addCompletedTransfer = useCompletedTransfersStore(state => state.addCompletedTransfer)

  return { completedTransfers, addCompletedTransfer }
}

export default useCompletedTransfers
