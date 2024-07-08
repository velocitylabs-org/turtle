import { getContext, getEnvironment } from '@/context/snowbridge'
import { Chain } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { Token } from '@/models/token'
import { Fees, StoredTransfer } from '@/models/transfer'
import { Direction, resolveDirection } from '@/services/transfer'
import { Environment } from '@/store/environmentStore'
import { Account as SubstrateAccount } from '@/store/substrateWalletStore'
import { captureException } from '@sentry/nextjs'
import * as Snowbridge from '@snowbridge/api'
import { WalletOrKeypair } from '@snowbridge/api/dist/toEthereum'
import { JsonRpcSigner, Signer } from 'ethers'
import { useState } from 'react'
import useNotification from './useNotification'
import useOngoingTransfers from './useOngoingTransfers'

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
  onSuccess?: () => void
}

export type Status = 'Idle' | 'Loading' | 'Validating' | 'Sending'

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
    onSuccess,
  }: TransferParams) => {
    setStatus('Loading')

    try {
      let direction = resolveDirection(sourceChain, destinationChain)
      const snowbridgeEnv = getEnvironment(environment)
      const context = await getContext(snowbridgeEnv)

      switch (direction) {
        case Direction.ToPolkadot: {
          setStatus('Validating')
          let plan = await Snowbridge.toPolkadot.validateSend(
            context,
            sender as Signer,
            recipient,
            token.address,
            destinationChain.chainId,
            amount,
            BigInt(0),
          )

          if (plan.failure) {
            console.error('Validation failed:', plan)
            addNotification({
              message:
                plan.failure.errors.length > 0
                  ? plan.failure.errors[0].message
                  : 'Transfer validation failed',
              severity: NotificationSeverity.Error,
            })

            if (plan.failure.errors.length > 0 && plan.failure.errors[0].code === 9) {
              await Snowbridge.toPolkadot.approveTokenSpend(
                context,
                sender as Signer,
                token.address,
                amount,
              )
            }
            setStatus('Idle')
            return
          }

          try {
            setStatus('Sending')
            let sendResult = await Snowbridge.toPolkadot.send(context, sender as Signer, plan)
            if (sendResult.failure) throw new Error('Transfer failed')

            onSuccess?.()
            addNotification({
              message: 'Transfer initiated. See below!',
              severity: NotificationSeverity.Success,
            })

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
            console.error('TRANSFER_ERROR:', e)
            captureException(e)
            addNotification({
              message: 'Transfer sending failed!',
              severity: NotificationSeverity.Error,
            })
          } finally {
            setStatus('Idle')
          }
          break
        }

        case Direction.ToEthereum: {
          setStatus('Validating')
          let plan = await Snowbridge.toEthereum.validateSend(
            context,
            sender as WalletOrKeypair,
            sourceChain.chainId,
            recipient,
            token.address,
            amount,
          )

          if (plan.failure) {
            console.error('Validation failed:', plan)
            addNotification({
              message:
                plan.failure.errors.length > 0
                  ? plan.failure.errors[0].message
                  : 'Transfer validation failed',
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
            if (sendResult.failure) throw new Error('Transfer failed')

            console.log('Sent successfully, will add to ongoing transfers. Amount:', amount)
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
            console.error('TRANSFER_ERROR:', e)
            addNotification({
              message: 'Transfer sending failed!',
              severity: NotificationSeverity.Error,
            })
            setStatus('Idle')
          }
          break
        }

        default:
          throw new Error('Unsupported flow')
      }
    } catch (e) {
      console.error('TRANSFER_INITIALIZATION_ERROR:', e)
      addNotification({
        message: 'Transfer initialization failed!',
        severity: NotificationSeverity.Error,
      })
    } finally {
      setStatus('Idle')
    }
  }

  return { transfer, transferStatus: status }
}

export default useTransfer
