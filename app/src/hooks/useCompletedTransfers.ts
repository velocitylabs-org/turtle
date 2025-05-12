import { useCompletedTransfersStore } from '@/store/completedTransfersStore'
import useStore from './useStore'


const useCompletedTransfers = () => {
  const completedTransfers = useStore(useCompletedTransfersStore, state => state.completedTransfers)
  const addCompletedTransfer = useCompletedTransfersStore(state => state.addCompletedTransfer)

  return { completedTransfers, addCompletedTransfer }
}

export default useCompletedTransfers
