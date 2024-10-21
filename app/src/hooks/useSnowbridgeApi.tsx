import { Chain } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { getCoingekoId, Token } from '@/models/token'
import { StoredTransfer } from '@/models/transfer'
import { getTokenPrice } from '@/services/balance'
import { Direction, resolveDirection } from '@/services/transfer'
import { Environment } from '@/store/environmentStore'
import { getSenderAddress } from '@/utils/address'
import { trackTransferMetrics } from '@/utils/analytics'
import { txWasCancelled } from '@/utils/transfer'
import { captureException } from '@sentry/nextjs'
import { Context, toEthereum, toPolkadot } from '@snowbridge/api'
import { WalletOrKeypair } from '@snowbridge/api/dist/toEthereum'
import { Signer } from 'ethers'
import useNotification from './useNotification'
import useOngoingTransfers from './useOngoingTransfers'
import useSnowbridgeContext from './useSnowbridgeContext'
import { Sender, Status, TransferParams } from './useTransfer'

type ValidationResult = toEthereum.SendValidationResult | toPolkadot.SendValidationResult

const useSnowbridgeApi = () => {
  const { addTransfer: addTransferToStorage } = useOngoingTransfers()
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
    setStatus('Loading')
    const {
      sender,
      sourceChain,
      token,
      destinationChain,
      recipient,
      amount,
      environment,
      fees,
      onSuccess,
    } = params

    setStatus('Loading')
    try {
      if (snowbridgeContext === undefined) {
        addNotification({
          message: 'Some nuts and bolts are not quite there yet',
          severity: NotificationSeverity.Error,
        })
        return
      }

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
          onSuccess,
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
        case Direction.ToPolkadot: {
          console.log("Token is ", JSON.stringify(token))
          console.log("on registry coin id is ", token.coingeckoId)

          const coingekoId = getCoingekoId(token)
          console.log("useFees - coingekoId is ", coingekoId)
          // token transfer amount
          const it = (await getTokenPrice(coingekoId))?.usd

          if (it === null || it === 0) throw new Error("Failed to fetch token price")
          console.log("it is ", it)
        
          sendResult = await toPolkadot.send(
            context,
            sender as Signer,
            plan as toPolkadot.SendValidationResult,
          )
          break
        }
        case Direction.ToEthereum: {
          sendResult = await toEthereum.send(
            context,
            sender as WalletOrKeypair,
            plan as toEthereum.SendValidationResult,
          )
          break
        }
        default:
          throw new Error('Unsupported flow')
      }

      if (sendResult.failure) throw new Error('Transfer failed')

      onSuccess?.()
      addNotification({
        message: 'Transfer initiated. See below!',
        severity: NotificationSeverity.Success,
      })

      console.log("Will get token price for ", JSON.stringify(token))
      const coingekoId = token.coingeckoId ?? token.name.toLocaleLowerCase().replaceAll(' ', '-')
      console.log("coin id is ", token.coingeckoId ?? token.name.toLocaleLowerCase().replaceAll(' ', '-'))

      const senderAddress = await getSenderAddress(sender)
      const tokenUSDValue = (await getTokenPrice(coingekoId))?.usd

      if (tokenUSDValue === null || tokenUSDValue === 0) throw new Error("Failed to fetch token price")
      console.log("tokenUSDValue is ", token.symbol,tokenUSDValue)
      const date = new Date()

      addTransferToStorage({
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
      } satisfies StoredTransfer)

      // metrics
      if (environment === Environment.Mainnet)
        trackTransferMetrics({
          sender: senderAddress,
          sourceChain: sourceChain.name,
          token: token.name,
          amount: amount.toString(),
          destinationChain: destinationChain.name,
          usdValue: tokenUSDValue ?? 0,
          usdFees: fees.inDollars,
          recipient: recipient,
          date: date.toISOString(),
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

  const handleSendError = (e: unknown) => {
    console.error('Transfer error:', e)
    addNotification({
      message: 'Failed to submit the transfer',
      severity: NotificationSeverity.Error,
    })
  }

  return { transfer }
}

export default useSnowbridgeApi
