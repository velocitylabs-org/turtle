import { Context, toEthereum, toPolkadot } from '@snowbridge/api'
import useNotification from './useNotification'
import useSnowbridgeContext from './useSnowbridgeContext'
import { NotificationSeverity } from '@/models/notification'
import { Sender, Status, TransferParams } from './useTransfer'
import { switchChain } from '@wagmi/core'
import { wagmiConfig } from '@/providers/config'
import { mainnet } from 'wagmi/chains'
import { Direction, resolveDirection } from '@/utils/transfer'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { Signer } from 'ethers'
import { SubstrateAccount } from '@/stores/substrateWalletStore'
import { WalletOrKeypair } from '@snowbridge/api/dist/toEthereum'
import { getSenderAddress } from '@/utils/address'
import { getTokenPrice } from '@/utils/token'

type ValidationResult = toEthereum.SendValidationResult | toPolkadot.SendValidationResult

const useSnowbridgeApi = () => {
  const { addNotification } = useNotification()
  const { snowbridgeContext } = useSnowbridgeContext()

  // main transfer function which is exposed to the components.
  const transfer = async (params: TransferParams, setStatus: (status: Status) => void) => {
    const {
      sender,
      sourceChain,
      token,
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
      await switchChain(wagmiConfig, { chainId: mainnet.id })
      const direction = resolveDirection(sourceChain, destinationChain)

      const plan = await validate(
        direction,
        snowbridgeContext,
        sender,
        sourceChain,
        token,
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
          token,
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
      token,
      destinationChain,
      recipient,
      amount,
      environment,
      fees,
      onComplete,
    } = params
    try {
      setStatus('Sending')
      let sendResult: toPolkadot.SendResult | toEthereum.SendResult

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
      const tokenUSDValue = (await getTokenPrice(token))?.usd ?? 0
      const date = new Date()

      const addOrUpdate = {
        id: sendResult.success!.messageId ?? 'todo', // TODO(nuno): what's a good fallback?
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
      }
      console.log('New Ongoing transfer', addOrUpdate)
    } catch (e) {
      // if (!txWasCancelled(sender, e)) captureException(e) - Sentry
      handleSendError(e)
    } finally {
      setStatus('Idle')
    }
  }

  const handleValidationFailure = (plan: ValidationResult) => {
    console.error('Validation failed:', plan)
    const errorMessage =
      plan.failure && plan.failure.errors.length > 0
        ? plan.failure.errors[0].message
        : 'Transfer validation failed'
    addNotification({ message: errorMessage, severity: NotificationSeverity.Error })
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
