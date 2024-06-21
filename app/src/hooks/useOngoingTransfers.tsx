import { useOngoingTransfersStore } from '@/store/ongoingTransfersStore'

const useOngoingTransfers = () => {
  const ongoingTransfers = useOngoingTransfersStore(state => state.transfers)
  const addTransfer = useOngoingTransfersStore.getState().addTransfer
  const removeTransfer = useOngoingTransfersStore.getState().removeTransfer

  return { ongoingTransfers, addTransfer, removeTransfer }
}

export default useOngoingTransfers
