import { useOngoingTransfersStore } from '@/store/ongoingTransfersStore'

const useOngoingTransfers = () => {
  const ongoingTransfers = useOngoingTransfersStore(state => state.transfers)
  const addTransfer = useOngoingTransfersStore.getState().addTransfer
  const removeTransfer = useOngoingTransfersStore.getState().removeTransfer
  const updateTransferUniqueId = useOngoingTransfersStore.getState().updateTransferUniqueId

  return { ongoingTransfers, addTransfer, removeTransfer, updateTransferUniqueId }
}

export default useOngoingTransfers
