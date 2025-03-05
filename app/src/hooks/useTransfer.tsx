import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { AmountInfo } from '@/models/transfer'
import { Environment } from '@/store/environmentStore'
import { SubstrateAccount } from '@/store/substrateWalletStore'
import { getRoute } from '@/utils/routes'
import { JsonRpcSigner } from 'ethers'
import { useState } from 'react'
import useParaspellApi from './useParaspellApi'
import useSnowbridgeApi from './useSnowbridgeApi'

export type Sender = JsonRpcSigner | SubstrateAccount

export interface TransferParams {
  environment: Environment // TODO: remove this
  sender: Sender
  sourceChain: Chain
  sourceToken: Token
  destinationToken: Token
  destinationChain: Chain
  recipient: string
  amount: bigint
  fees: AmountInfo
  /**
   * Callback when Turtle has completed submitting the transfer.
   * It does NOT mean that the transfer itself is completed.
   */
  onComplete?: () => void // TODO: remove this from here. It doesnt belong here.
}

export type Status = 'Idle' | 'Loading' | 'Validating' | 'Signing' | 'Sending'

const useTransfer = () => {
  const [status, setStatus] = useState<Status>('Idle')
  const snowbridgeApi = useSnowbridgeApi()
  const paraspellApi = useParaspellApi()

  // The entry point function which is exposed to the components
  const transfer = async (transferDetails: TransferParams) => {
    const { environment, sourceChain, destinationChain } = transferDetails
    setStatus('Loading')
    const route = getRoute(environment, sourceChain, destinationChain)
    if (!route) throw new Error('Route not supported')

    switch (route.sdk) {
      case 'SnowbridgeApi':
        snowbridgeApi.transfer(transferDetails, setStatus)
        break

      case 'ParaSpellApi':
        paraspellApi.transfer(transferDetails, setStatus)
        break
    }
  }

  return { transfer, transferStatus: status }
}

export default useTransfer
