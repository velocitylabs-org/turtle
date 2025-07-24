import { useOngoingTransfersStore } from '@/stores/ongoingTransfersStore'

const useOngoingTransfers = () => {
  const ongoingTransfers = useOngoingTransfersStore((state) => state.transfers)
  const addOrUpdate = useOngoingTransfersStore.getState().addOrUpdate
  const remove = useOngoingTransfersStore.getState().remove
  const updateUniqueId = useOngoingTransfersStore.getState().updateUniqueId
  const updateStatus = useOngoingTransfersStore.getState().updateStatus
  const updateProgress = useOngoingTransfersStore.getState().updateProgress

  return { ongoingTransfers, addOrUpdate, remove, updateUniqueId, updateStatus, updateProgress }
}

export default useOngoingTransfers
