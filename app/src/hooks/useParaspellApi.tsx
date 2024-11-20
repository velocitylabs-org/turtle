import { NotificationSeverity } from '@/models/notification'
import { StoredTransfer } from '@/models/transfer'
import { getTokenPrice } from '@/services/balance'
import { Environment } from '@/store/environmentStore'
import { Account as SubstrateAccount } from '@/store/substrateWalletStore'
import { getSenderAddress } from '@/utils/address'
import { trackTransferMetrics } from '@/utils/analytics'
import { createTx } from '@/utils/paraspell'
import { handleSubmittableEvents } from '@/utils/polkadot'
import { txWasCancelled } from '@/utils/transfer'
import { captureException } from '@sentry/nextjs'
import useNotification from './useNotification'
import useOngoingTransfers from './useOngoingTransfers'
import { Status, TransferParams } from './useTransfer'

const useParaspellApi = () => {
  const { addTransfer: addTransferToStorage } = useOngoingTransfers()
  const { addNotification } = useNotification()

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

    const account = sender as SubstrateAccount

    try {
      const tx = await createTx(params, sourceChain.rpcConnection)
      await tx.signAndSend(account.address, { signer: account.signer }, async result => {
        try {
          const eventsData = handleSubmittableEvents(result)
          if (eventsData) {
            const { messageHash, messageId, extrinsicIndex } = eventsData

            // Get the current token price
            const senderAddress = await getSenderAddress(sender)
            const tokenUSDValue = (await getTokenPrice(token.coingeckoId ?? token.symbol))?.usd ?? 0
            const date = new Date()

            addTransferToStorage({
              id: result.txHash.toString(),
              sourceChain,
              token,
              tokenUSDValue,
              sender: senderAddress,
              destChain: destinationChain,
              amount: amount.toString(),
              recipient,
              date,
              environment,
              fees,
              ...(messageHash && { crossChainMessageHash: messageHash }),
              ...(messageId && { parachainMessageId: messageId }),
              ...(extrinsicIndex && { sourceChainExtrinsicIndex: extrinsicIndex }),
            } satisfies StoredTransfer)

            onSuccess?.()
            addNotification({
              message: 'Transfer initiated. See below!',
              severity: NotificationSeverity.Success,
            })

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
                date,
              })
            }
            setStatus('Idle')
            return
          }
        } catch (callbackError) {
          if (!txWasCancelled(sender, callbackError)) captureException(callbackError)
          handleSendError(callbackError)
          setStatus('Idle')
        }
      })
    } catch (e) {
      if (!txWasCancelled(sender, e)) captureException(e)
      handleSendError(e)
      setStatus('Idle')
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

export default useParaspellApi
