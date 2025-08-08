import { Chain, Token } from '@velocitylabs-org/turtle-registry'
import { JsonRpcSigner } from 'ethers'
import { useState } from 'react'
import { AmountInfo } from '@/models/transfer'

import { SubstrateAccount } from '@/store/substrateWalletStore'
import { resolveSdk } from '@/utils/routes'
import useChainflipApi from './useChainflipApi'
import useParaspellApi from './useParaspellApi'
import useSnowbridgeApi from './useSnowbridgeApi'

export type Sender = JsonRpcSigner | SubstrateAccount

export interface TransferParams {
  sender: Sender
  sourceChain: Chain
  sourceToken: Token
  destinationToken: Token
  destinationChain: Chain
  recipient: string
  sourceAmount: bigint
  destinationAmount?: bigint
  fees: AmountInfo
  bridgingFee: AmountInfo | null
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
  const chainflipApi = useChainflipApi()
  // The entry point function which is exposed to the components
  const transfer = async (transferDetails: TransferParams) => {
    const { sourceChain, destinationChain, sourceToken, destinationToken } = transferDetails
    setStatus('Loading')

    const sdk = resolveSdk(sourceChain, destinationChain, sourceToken, destinationToken)
    if (!sdk) throw new Error('Route not supported')

    switch (sdk) {
      case 'SnowbridgeApi':
        snowbridgeApi.transfer(transferDetails, setStatus)
        break

      case 'ParaSpellApi':
        paraspellApi.transfer(transferDetails, setStatus)
        break

      case 'ChainflipApi':
        chainflipApi.transfer(transferDetails, setStatus)
        break
    }
  }

  return { transfer, transferStatus: status }
}

export default useTransfer
