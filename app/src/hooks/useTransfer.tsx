import { Chain } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { Token } from '@/models/token'
import { Fees, StoredTransfer } from '@/models/transfer'
import { getErc20TokenUSDValue } from '@/services/balance'
import { Direction, resolveDirection } from '@/services/transfer'
import { Environment } from '@/store/environmentStore'
import { Account as SubstrateAccount } from '@/store/substrateWalletStore'
import { trackTransferMetrics } from '@/utils/analytics'
import { captureException } from '@sentry/nextjs'
import { Context, toEthereum, toPolkadot } from '@snowbridge/api'
import { WalletOrKeypair } from '@snowbridge/api/dist/toEthereum'
import { JsonRpcSigner, Signer } from 'ethers'
import { useState } from 'react'
import useNotification from './useNotification'
import useOngoingTransfers from './useOngoingTransfers'
import { getRoute } from '@/config/registry'
import useSnowbridgeContext from './useSnowbridgeContext'
import useSnowbridgeSdk from './useSnowbridgeSdk'

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
  const snowbridgeSdk = useSnowbridgeSdk()

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
        break
      }

      case 'SnowbridgeApi': {
        snowbridgeSdk.transfer(
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
