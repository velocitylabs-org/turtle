import { useOngoingTransfersStore } from '@/store/ongoingTransfersStore'
// import useStore from './useStore'

const useOngoingTransfers = () => {
  const ongoingTransfers = useOngoingTransfersStore(state => state.transfers)
  const addTransfer = useOngoingTransfersStore.getState().addTransfer
  const removeTransfer = useOngoingTransfersStore.getState().removeTransfer
  //   const ongoingTransfers = useStore(useOngoingTransfersStore, state => state.transfers)
  //   const addTransfer = useStore(useOngoingTransfersStore, state => state.addTransfer)
  //   const removeTransfer = useStore(useOngoingTransfersStore, state => state.removeTransfer)

  return { ongoingTransfers, addTransfer, removeTransfer }
}

export default useOngoingTransfers
