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
import { WalletOrKeypair, WalletSigner } from '@snowbridge/api/dist/toEthereum'
import { JsonRpcSigner, Signer } from 'ethers'
import { useState } from 'react'
import useNotification from './useNotification'
import useOngoingTransfers from './useOngoingTransfers'
import { getRoute, REGISTRY } from '@/config/registry'

export type Sender = JsonRpcSigner | SubstrateAccount

interface TransferParams {
  environment: Environment
  context: Context
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

type ValidationResult = toEthereum.SendValidationResult | toPolkadot.SendValidationResult

const useTransfer = () => {
  const [status, setStatus] = useState<Status>('Idle')
  const { addTransfer: addTransferToStorage } = useOngoingTransfers()
  const { addNotification } = useNotification()

  const handleValidationFailure = (plan: ValidationResult) => {
    console.error('Validation failed:', plan)
    const errorMessage =
      plan.failure && plan.failure.errors.length > 0
        ? plan.failure.errors[0].message
        : 'Transfer validation failed'
    addNotification({ message: errorMessage, severity: NotificationSeverity.Error })
  }

  const handleSendError = (e: unknown) => {
    console.error('Transfer error:', e)
    if (!(e instanceof Error) || !e.message.includes('ethers-user-denied')) captureException(e)
    addNotification({
      message: 'Failed to submit the transfer',
      severity: NotificationSeverity.Error,
    })
  }

  // main transfer function which is exposed to the components.
  const transfer = async ({
    environment,
    context,
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

    const direction = resolveDirection(sourceChain, destinationChain)
    const route = getRoute(environment, sourceChain, destinationChain)!

    switch (route.sdk) {
      case 'AssetTransferApi': {
        //todo(nuno)
        break
      }

      case 'SnowbridgeApi': {
        SnowbridgeSdk.transfer({
          environment,
          context,
          sender,
          sourceChain,
          token,
          destinationChain,
          recipient,
          amount,
          fees,
          onSuccess,
        })
        break
      }
    }
  }

  export namespace SnowbridgeSdk {
    // main transfer function which is exposed to the components.
    export const transfer = async ({
      environment,
      context,
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
        const direction = resolveDirection(sourceChain, destinationChain)

        const plan = await validate(
          direction,
          context,
          sender,
          sourceChain,
          token,
          destinationChain,
          recipient,
          amount,
        )

        if (plan.failure) {
          handleValidationFailure(plan)
          return
        }

        await performTransfer(
          context,
          sender,
          plan,
          {
            environment,
            context,
            sender,
            sourceChain,
            token,
            destinationChain,
            recipient,
            amount,
            fees,
            onSuccess,
          },
          direction,
        )
      } catch (e) {
        console.error('Transfer initialization error:', e)
        addNotification({
          message: 'Transfer failed!',
          severity: NotificationSeverity.Error,
        })
      } finally {
        setStatus('Idle')
      }
    }

    // Executes the transfer. Validation should happen before.
    const performTransfer = async (
      context: Context,
      sender: Sender,
      plan: ValidationResult,
      params: TransferParams,
      direction: Direction,
    ) => {
      const {
        sourceChain,
        token,
        destinationChain,
        recipient,
        amount,
        environment,
        fees,
        onSuccess,
      } = params
      try {
        setStatus('Sending')
        let sendResult

        switch (direction) {
          case Direction.ToPolkadot:
            sendResult = await toPolkadot.send(
              context,
              sender as Signer,
              plan as toPolkadot.SendValidationResult,
            )
            break

          case Direction.ToEthereum:
            sendResult = await toEthereum.send(
              context,
              sender as WalletOrKeypair,
              plan as toEthereum.SendValidationResult,
            )
            break

          default:
            throw new Error('Unsupported flow')
        }

        if (sendResult.failure) throw new Error('Transfer failed')

        onSuccess?.()
        addNotification({
          message: 'Transfer initiated. See below!',
          severity: NotificationSeverity.Success,
        })

        const senderAddress =
          sender instanceof JsonRpcSigner
            ? await sender.getAddress()
            : (sender as WalletOrKeypair).address

        const tokenData = await getErc20TokenUSDValue(token.address)
        const tokenUSDValue =
          tokenData && Object.keys(tokenData).length > 0 ? tokenData[token.address]?.usd : 0
        const date = new Date()

        addTransferToStorage({
          id: sendResult.success!.messageId ?? 'todo', // TODO(nuno): replace with actual messageId
          sourceChain,
          token,
          tokenUSDValue,
          sender: senderAddress,
          destChain: destinationChain,
          amount: amount.toString(),
          recipient,
          date,
          environment,
          sendResult,
          fees,
        } satisfies StoredTransfer)

        // metrics
        if (environment === Environment.Mainnet) {
          trackTransferMetrics({
            sender: senderAddress,
            sourceChain: sourceChain.name,
            token: token.name,
            amount: amount.toString(),
            destinationChain: destinationChain.name,
            usdValue: tokenUSDValue,
            usdFees: fees.inDollars,
            recipient: recipient,
            date: date.toISOString(),
          })
        }
      } catch (e) {
        handleSendError(e)
      } finally {
        setStatus('Idle')
      }
    }

    const validate = async (
      direction: Direction,
      context: Context,
      sender: Sender,
      sourceChain: Chain,
      token: Token,
      destinationChain: Chain,
      recipient: string,
      amount: bigint,
    ): Promise<ValidationResult> => {
      setStatus('Validating')
      switch (direction) {
        case Direction.ToPolkadot:
          return await toPolkadot.validateSend(
            context,
            sender as Signer,
            recipient,
            token.address,
            destinationChain.chainId,
            amount,
            BigInt(destinationChain.destinationFeeDOT || 0),
          )

        case Direction.ToEthereum:
          return await toEthereum.validateSend(
            context,
            sender as WalletOrKeypair,
            sourceChain.chainId,
            recipient,
            token.address,
            amount,
          )

        default:
          throw new Error('Unsupported flow')
      }
    }
  }

  return { transfer, transferStatus: status }
}

export default useTransfer
