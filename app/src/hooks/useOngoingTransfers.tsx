import { useOngoingTransfersStore } from '@/store/ongoingTransfersStore'

const useOngoingTransfers = () => {
  const ongoingTransfers = useOngoingTransfersStore(state => state.transfers)
  const addOrUpdate = useOngoingTransfersStore.getState().addOrUpdate
  const remove = useOngoingTransfersStore.getState().remove
  const updateUniqueId = useOngoingTransfersStore.getState().updateUniqueId

  return { ongoingTransfers, addOrUpdate, remove, updateUniqueId }
}

export default useOngoingTransfers
