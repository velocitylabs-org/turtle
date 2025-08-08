import { Status, TransferParams } from './useTransfer'

const useChainflipApi = () => {
  const transfer = async (params: TransferParams, setStatus: (status: Status) => void) => {
    setStatus('Loading')
    try {
      console.log(params)
      // open Deposit channel
      // notify user that the deposit channel is open
      // sign the transaction

      // setStatus('Sending')
      // setStatus('Idle')
    } catch (e) {
      // handleSendError(params.sender, e, setStatus)
    }
  }
  return { transfer }
}

export default useChainflipApi
