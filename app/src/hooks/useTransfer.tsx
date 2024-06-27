import { useState } from 'react'
import * as Snowbridge from '@snowbridge/api'
import { WalletOrKeypair } from '@snowbridge/api/dist/toEthereum'
import { JsonRpcSigner, Signer } from 'ethers'

import { getContext, getEnvironment } from '@/context/snowbridge'
import { Chain } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { Token } from '@/models/token'
import { StoredTransfer, Fees } from '@/models/transfer'
import { Direction, getErc20TokenContract, resolveDirection } from '@/services/transfer'
import { Environment } from '@/store/environmentStore'
import { Account as SubstrateAccount } from '@/store/substrateWalletStore'
import useOngoingTransfers from './useOngoingTransfers'
import useNotification from './useNotification'

export type Sender = JsonRpcSigner | SubstrateAccount
interface TransferParams {
  environment: Environment
  sender: Sender
  sourceChain: Chain
  token: Token
  destinationChain: Chain
  recipient: string
  amount: bigint
  fees: Fees
}

export type Status = 'Idle' | 'Loading' | 'Validating' | 'Sending'

/**
 * Used to initiate a transfer from source chain to destination chain.
 * It figures out which api to use based on token, source and destination chain.
 */
const useTransfer = () => {
  const [status, setStatus] = useState<Status>('Idle')
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
    fees,
  }: TransferParams) => {
    setStatus('Loading')

    let direction = resolveDirection(sourceChain, destinationChain)
    const snowbridgeEnv = getEnvironment(environment)
    const context = await getContext(snowbridgeEnv)
    const tokenContract = getErc20TokenContract(token, snowbridgeEnv)

    switch (direction) {
      case Direction.ToPolkadot: {
        setStatus('Validating')
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
          console.log('Validation failed: ' + plan)
          addNotification({
            header: 'Transfer validation failed!',
            message: plan.failure.errors[0].message,
            severity: NotificationSeverity.Error,
          })
          if (plan.failure.errors[0].code === 9) {
            await Snowbridge.toPolkadot.approveTokenSpend(
              context,
              sender as Signer,
              tokenContract,
              amount,
            )
          }
          setStatus('Idle')
          return
        }

        try {
          setStatus('Sending')
          let sendResult = await Snowbridge.toPolkadot.send(context, sender as Signer, plan)
          setStatus('Idle')

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
            amount: amount.toString(),
            recipient: recipient,
            date: new Date(),
            environment,
            sendResult,
            fees,
          } satisfies StoredTransfer)
        } catch (e) {
          console.log('TRANSFER_ERROR', e)
          addNotification({
            header: 'Transfer validation failed!',
            message: '',
            severity: NotificationSeverity.Error,
          })
          setStatus('Idle')
        }
        break
      }

      case Direction.ToEthereum:
        setStatus('Validating')
        let plan = await Snowbridge.toEthereum.validateSend(
          context,
          sender as WalletOrKeypair,
          sourceChain.chainId,
          recipient,
          tokenContract,
          amount,
        )

        if (plan.failure) {
          console.log('Validation failed: ' + plan)
          addNotification({
            header: 'Transfer validation failed',
            message: plan.failure.errors[0].message,
            severity: NotificationSeverity.Error,
          })
          setStatus('Idle')
          return
        }

        setStatus('Sending')
        try {
          let sendResult = await Snowbridge.toEthereum.send(
            context,
            sender as WalletOrKeypair,
            plan,
          )
          setStatus('Idle')
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
            amount: amount.toString(),
            recipient: recipient,
            date: new Date(),
            environment,
            sendResult,
            fees,
          } satisfies StoredTransfer)
        } catch (e) {
          console.log('TRANSFER_ERROR', e)
          addNotification({
            header: 'This transfer failed!',
            message: '',
            severity: NotificationSeverity.Error,
          })
          setStatus('Idle')
        }

        break
      default:
        throw Error('Unsupported flow')
    }
  }

  return { transfer, transferStatus: status }
}

export default useTransfer
