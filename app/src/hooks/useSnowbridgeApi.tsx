import { config } from '@/config'
import { Chain } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { Token } from '@/models/token'
import { StoredTransfer } from '@/models/transfer'
import { getCachedTokenPrice } from '@/services/balance'
import { Direction, resolveDirection } from '@/services/transfer'
import { SubstrateAccount } from '@/store/substrateWalletStore'
import { getSenderAddress } from '@/utils/address'
import { trackTransferMetrics } from '@/utils/analytics'
import { txWasCancelled } from '@/utils/transfer'
import { captureException } from '@sentry/nextjs'
import { Context, toEthereum, toPolkadot } from '@snowbridge/api'
import { WalletOrKeypair } from '@snowbridge/api/dist/toEthereum'
import { switchChain } from '@wagmi/core'
import { Signer } from 'ethers'
import { mainnet } from 'wagmi/chains'
import useNotification from './useNotification'
import useOngoingTransfers from './useOngoingTransfers'
import useSnowbridgeContext from './useSnowbridgeContext'
import { Sender, Status, TransferParams } from './useTransfer'

type ValidationResult = toEthereum.SendValidationResult | toPolkadot.SendValidationResult

const useSnowbridgeApi = () => {
  const { addOrUpdate } = useOngoingTransfers()
  const { addNotification } = useNotification()
  const { snowbridgeContext } = useSnowbridgeContext()

  const handleValidationFailure = (plan: ValidationResult) => {
    console.error('Validation failed:', plan)
    const errorMessage =
      plan.failure && plan.failure.errors.length > 0
        ? plan.failure.errors[0].message
        : 'Transfer validation failed'
    addNotification({ message: errorMessage, severity: NotificationSeverity.Error })
  }

  // main transfer function which is exposed to the components.
  const transfer = async (params: TransferParams, setStatus: (status: Status) => void) => {
    const {
      sender,
      sourceChain,
      sourceToken,
      destinationToken,
      destinationChain,
      recipient,
      amount,
      environment,
      fees,
      onComplete,
    } = params

    try {
      if (snowbridgeContext === undefined) {
        addNotification({
          message: 'Some nuts and bolts are not quite there yet',
          severity: NotificationSeverity.Error,
        })
        return
      }
      await switchChain(config, { chainId: mainnet.id })
      const direction = resolveDirection(sourceChain, destinationChain)

      const plan = await validate(
        direction,
        snowbridgeContext,
        sender,
        sourceChain,
        sourceToken,
        destinationChain,
        recipient,
        amount,
        setStatus,
      )

      if (plan.failure) {
        handleValidationFailure(plan)
        return
      }

      await performTransfer(
        snowbridgeContext,
        sender,
        plan,
        {
          environment,
          sender,
          sourceChain,
          sourceToken,
          destinationToken,
          destinationChain,
          recipient,
          amount,
          fees,
          onComplete,
        },
        direction,
        setStatus,
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
    setStatus: (status: Status) => void,
  ) => {
    const {
      sourceChain,
      sourceToken,
      destinationToken,
      destinationChain,
      recipient,
      amount,
      environment,
      fees,
      onComplete,
    } = params
    try {
      setStatus('Sending')
      let sendResult

      switch (direction) {
        case Direction.ToPolkadot: {
          sendResult = await toPolkadot.send(
            context,
            sender as Signer,
            plan as toPolkadot.SendValidationResult,
          )
          break
        }

        case Direction.ToEthereum: {
          const account = sender as SubstrateAccount
          const signer = { signer: account.pjsSigner, address: sender.address }
          sendResult = await toEthereum.send(
            context,
            signer as WalletOrKeypair,
            plan as toEthereum.SendValidationResult,
          )
          break
        }
        default:
          throw new Error('Unsupported flow')
      }

      if (sendResult.failure) throw new Error('Transfer failed')

      onComplete?.()

      const senderAddress = await getSenderAddress(sender)
      const tokenUSDValue = (await getCachedTokenPrice(sourceToken))?.usd ?? 0
      const date = new Date()

      addOrUpdate({
        id: sendResult.success!.messageId ?? 'todo', // TODO(nuno): what's a good fallback?
        sourceChain,
        sourceToken,
        destinationToken,
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

      trackTransferMetrics({
        id: sendResult.success?.messageId,
        sender: senderAddress,
        sourceChain,
        token: sourceToken,
        amount,
        destinationChain,
        tokenUSDValue,
        fees,
        recipient,
        date,
        environment,
      })
    } catch (e) {
      if (!txWasCancelled(sender, e)) captureException(e)
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
    setStatus: (status: Status) => void,
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

      case Direction.ToEthereum: {
        const account = sender as SubstrateAccount
        const signer = { signer: account.pjsSigner, address: sender.address }
        return await toEthereum.validateSend(
          context,
          signer as WalletOrKeypair,
          sourceChain.chainId,
          recipient,
          token.address,
          amount,
        )
      }

      default:
        throw new Error('Unsupported flow')
    }
  }

  const handleSendError = (e: unknown) => {
    console.log('Transfer error:', e)
    addNotification({
      message: 'Failed to submit the transfer',
      severity: NotificationSeverity.Error,
    })
  }

  return { transfer }
}

export default useSnowbridgeApi
