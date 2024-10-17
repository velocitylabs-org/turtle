import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { Fees } from '@/models/transfer'
import { Environment } from '@/store/environmentStore'
import { Account as SubstrateAccount } from '@/store/substrateWalletStore'
import { JsonRpcSigner } from 'ethers'
import { useState } from 'react'
import { getRoute } from '@/utils/routes'
import useSnowbridgeApi from './useSnowbridgeApi'
import useAssetTransferApi from './useAssetTransferApi'
import useParaspellApi from './useParaspellApi'

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
  const assetTransferApi = useAssetTransferApi()
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
    onSuccess,
  }: TransferParams) => {
    setStatus('Loading')
    const route = getRoute(environment, sourceChain, destinationChain)!

    switch (route.sdk) {
      case 'AssetTransferApi': {
        //todo(nuno)
        console.log('AssetTransferApi route')
        assetTransferApi.transfer(
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

      case 'ParaspellApi': {
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
            onSuccess,
          },
          setStatus,
        )
      }
    }
  }

  return { transfer, transferStatus: status }
}

export default useTransfer
