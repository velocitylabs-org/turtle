import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { Direction, getErc20TokenContract, resolveDirection } from '@/services/transfer'
import { Environment } from '@/store/environmentStore'
import { Account as SubstrateAccount } from '@/store/substrateWalletStore'
import { WalletOrKeypair, WalletSigner } from '@snowbridge/api/dist/toEthereum'
import { JsonRpcSigner, Signer } from 'ethers'
import useOngoingTransfers from './useOngoingTransfers'
import useNotification from './useNotification'
import { NotificationSeverity } from '@/models/notification'
import * as Snowbridge from '@snowbridge/api'
import { getContext, getEnvironment } from '@/context/snowbridge'

export type Sender = JsonRpcSigner | SubstrateAccount

interface TransferParams {
  environment: Environment
  sender: Sender
  sourceChain: Chain
  token: Token
  destinationChain: Chain
  recipient: string
  amount: bigint
}

interface TransferValidationParams {
  sender?: Sender | null
  sourceChain: Chain | null
  token: Token | null
  destinationChain: Chain | null
  recipient?: string | null
  amount: bigint | null
}

/**
 * Used to initiate a transfer from source chain to destination chain.
 * It figures out which api to use based on token, source and destination chain.
 */
const useTransfer = () => {
  const { addTransfer } = useOngoingTransfers()
  const { addNotification } = useNotification()

  const transfer = async ({
    environment,
    sender,
    sourceChain,
    token,
    destinationChain,
    recipient,
    amount,
  }: TransferParams) => {
    let direction = resolveDirection(sourceChain, destinationChain)
    const snowbridgeEnv = getEnvironment(environment)
    const context = await getContext(snowbridgeEnv)
    const tokenContract = getErc20TokenContract(token, snowbridgeEnv)

    switch (direction) {
      case Direction.ToPolkadot: {
        let plan = await Snowbridge.toPolkadot.validateSend(
          context,
          sender as Signer,
          recipient,
          tokenContract,
          destinationChain.chainId,
          amount,
          BigInt(0),
        )

        if (plan.failure) {
          console.log('Validation failed: ' + plan.failure)
          addNotification({
            header: 'Transfer validation failed!',
            message: '',
            severity: NotificationSeverity.Error,
          })
          return
        }

        let sendResult = await Snowbridge.toPolkadot.send(context, sender as Signer, plan)

        if (sendResult.failure) {
          addNotification({
            header: 'This transfer failed!',
            message: '',
            severity: NotificationSeverity.Error,
          })
          return
        }

        console.log('Sent success, will add to ongoing transfers. Amount: ', amount)
        addTransfer({
          id: sendResult.success!.messageId,
          sourceChain,
          token,
          sender: await (sender as Signer).getAddress(),
          destChain: destinationChain,
          amount: amount,
          recipient: recipient,
          date: new Date(),
          context,
          sendResult,
        })

        break
      }
      case Direction.ToEthereum:
        let plan = await Snowbridge.toEthereum.validateSend(
          context,
          sender as WalletOrKeypair,
          sourceChain.chainId,
          recipient,
          tokenContract,
          amount,
        )

        if (plan.failure) {
          console.log('Validation failed: ' + plan.failure)
          addNotification({
            header: 'Transfer validation failed',
            message: '',
            severity: NotificationSeverity.Error,
          })
          return
        }

        let sendResult = await Snowbridge.toEthereum.send(context, sender as WalletOrKeypair, plan)

        if (sendResult.failure) {
          addNotification({
            header: 'This transfer failed!',
            message: '',
            severity: NotificationSeverity.Error,
          })
          return
        }

        console.log('Sent success, will add to ongoing transfers. Amount:', amount)
        addTransfer({
          id: sendResult.success!.messageId ?? 'todo(nuno)',
          sourceChain,
          token,
          sender: sender.address,
          destChain: destinationChain,
          amount: amount,
          recipient: recipient,
          date: new Date(),
          context,
          sendResult,
        })
        break
      default:
        throw Error('Unsupported flow')
    }
  }

  const isValid = ({
    sender,
    sourceChain,
    token,
    destinationChain,
    recipient,
    amount,
  }: TransferValidationParams) => {
    return !!(sender && sourceChain && token && destinationChain && recipient && amount)
  }

  return { transfer, isValid }
}

export default useTransfer
