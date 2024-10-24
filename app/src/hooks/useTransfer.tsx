import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { Fees } from '@/models/transfer'
import { Environment } from '@/store/environmentStore'
import { Account as SubstrateAccount } from '@/store/substrateWalletStore'
import { JsonRpcSigner } from 'ethers'
import { useState } from 'react'
import { getRoute } from '@/utils/routes'
import useSnowbridgeApi from './useSnowbridgeApi'

export type Sender = JsonRpcSigner | SubstrateAccount

export interface TransferParams {
  environment: Environment
  sender: Sender
  sourceChain: Chain
  token: Token
  destinationChain: Chain
  recipient: string
  amount: bigint
  fees: Fees
  onSuccess?: () => void
}

export type Status = 'Idle' | 'Loading' | 'Validating' | 'Sending'

const useTransfer = () => {
  const [status, setStatus] = useState<Status>('Idle')
  const snowbridgeApi = useSnowbridgeApi()

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
    onSuccess,
  }: TransferParams) => {
    setStatus('Loading')
    const route = getRoute(environment, sourceChain, destinationChain)!

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
            onSuccess,
          },
          setStatus,
        )
        break
      }
    }
  }

  return { transfer, transferStatus: status }
}

export default useTransfer
