import { Chain, Token } from '@velocitylabs-org/turtle-registry'
import { AmountInfo } from '@/models/transfer'
import { Environment } from '@/stores/environmentStore'
import { SubstrateAccount } from '@/stores/substrateWalletStore'
import { getRoute } from '@/utils/routes'
import { JsonRpcSigner } from 'ethers'
import { useState } from 'react'
import useSnowbridgeApi from './useSnowbridgeApi'
import useParaspellApi from './useParaspellApi'

export type Sender = JsonRpcSigner | SubstrateAccount

export type Status = 'Idle' | 'Loading' | 'Validating' | 'Signing' | 'Sending'

export interface TransferParams {
  environment: Environment
  sender: Sender
  sourceChain: Chain
  token: Token
  destinationChain: Chain
  recipient: string
  amount: bigint
  fees: AmountInfo
  bridgingFees: AmountInfo | null
  /**
   * Callback when Turtle has completed submitting the transfer.
   * It does NOT mean that the transfer itself is completed.
   */
  onComplete?: () => void
}

const useTransfer = () => {
  const [status, setStatus] = useState<Status>('Idle')
  const snowbridgeApi = useSnowbridgeApi()
  const paraspellApi = useParaspellApi()

  // The entry point function which is exposed to the components
  const transfer = async ({
    environment,
    sender,
    sourceChain,
    token,
    destinationChain,
    recipient,
    amount,
    fees,
    bridgingFees,
    onComplete,
  }: TransferParams) => {
    setStatus('Loading')
    const route = getRoute(environment, sourceChain, destinationChain)
    if (!route) throw new Error('Route not supported')

    switch (route.sdk) {
      case 'SnowbridgeApi': {
        snowbridgeApi.transfer(
          {
            environment,
            sender,
            sourceChain,
            token,
            destinationChain,
            recipient,
            amount,
            fees,
            bridgingFees,
            onComplete,
          },
          setStatus,
        )
        break
      }

      case 'ParaSpellApi': {
        paraspellApi.transfer(
          {
            environment,
            sender,
            sourceChain,
            token,
            destinationChain,
            recipient,
            amount,
            fees,
            bridgingFees,
            onComplete,
          },
          setStatus,
        )
      }
    }
  }

  return { transfer, transferStatus: status }
}

export default useTransfer
