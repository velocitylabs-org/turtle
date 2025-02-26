// import { useState } from 'react'
import { SubstrateAccount } from '@/stores/substrateWalletStore'
import { JsonRpcSigner } from 'ethers'

export type Sender = JsonRpcSigner | SubstrateAccount

export type Status = 'Idle' | 'Loading' | 'Validating' | 'Signing' | 'Sending'

const useTransfer = () => {
  // const [status, setStatus] = useState<Status>('Idle')
  return {
    transferStatus: 'Idle' as Status,
  }
}

export default useTransfer
