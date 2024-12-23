import { NotificationSeverity } from '@/models/notification'
import { StoredTransfer } from '@/models/transfer'
import { getCachedTokenPrice } from '@/services/balance'
import { Environment } from '@/store/environmentStore'
import { SubstrateAccount } from '@/store/substrateWalletStore'
import { getSenderAddress } from '@/utils/address'
import { trackTransferMetrics } from '@/utils/analytics'
import { createTx } from '@/utils/paraspell'
import { txWasCancelled } from '@/utils/transfer'
import { captureException } from '@sentry/nextjs'
import { getPolkadotSignerFromPjs, SignPayload, SignRaw } from 'polkadot-api/pjs-signer'
import useNotification from './useNotification'
import useOngoingTransfers from './useOngoingTransfers'
import { Sender, Status, TransferParams } from './useTransfer'

const useParaspellApi = () => {
  const { addOrUpdate, remove: removeOngoing } = useOngoingTransfers()
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
      onComplete,
    } = params

    const account = sender as SubstrateAccount

    const senderAddress = await getSenderAddress(sender)
    const tokenUSDValue = (await getCachedTokenPrice(token))?.usd ?? 0
    const date = new Date()
    // let locked = false

    if (!account.pjsSigner?.signPayload || !account.pjsSigner?.signRaw)
      throw new Error('Signer not found')

    try {
      const tx = await createTx(params, sourceChain.rpcConnection)

      setStatus('Signing')

      const polkadotSigner = getPolkadotSignerFromPjs(
        account.address,
        account.pjsSigner.signPayload as SignPayload,
        account.pjsSigner.signRaw as SignRaw,
      )

      const res = await tx.signAndSubmit(polkadotSigner)
      res.events.forEach(event => {
        console.log(event)
      })

      tx.signSubmitAndWatch(polkadotSigner).subscribe({
        next: async event => {
          console.log('Tx event: ', event.type)
          if (event.type === 'broadcasted') {
            // add to ongoing transfers
            // For a smoother UX, give it 2 seconds before adding the tx to 'ongoing'
            // and unlocking the UI by resetting the form back to 'Idle'.
            await new Promise(_ =>
              setTimeout(function () {
                setStatus('Idle')
                onComplete?.()
                addOrUpdate({
                  id: event.txHash.toString(),
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
                  status: `Submitting to ${sourceChain.name}`,
                } satisfies StoredTransfer)
              }, 2000),
            )
          }

          if (event.type === 'txBestBlocksState') {
            // Update the ongoing tx entry now containing the necessary
            // fields to be able to track its progress.
            // TODO extract from event
            // const eventsData = handleSubmittableEvents(result)
            addOrUpdate({
              id: event.txHash.toString(),
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
              // ...(messageHash && { crossChainMessageHash: messageHash }),
              //  ...(messageId && { parachainMessageId: messageId }),
              //  ...(extrinsicIndex && { sourceChainExtrinsicIndex: extrinsicIndex }),
              status: `Arriving at ${destinationChain.name}`,
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
                date,
              })
            }
            setStatus('Idle')
            return
          }
        },
        error: error => {
          throw new Error(error)
        },
        complete() {
          console.log('The transaction is complete')
        },
      })

      setStatus('Sending')
    } catch (e) {
      handleSendError(sender, e, setStatus)
    }
  }

  const handleSendError = (
    sender: Sender,
    e: unknown,
    setStatus: (status: Status) => void,
    txId?: string,
  ) => {
    setStatus('Idle')
    console.log('Transfer error:', e)
    const message = txWasCancelled(sender, e)
      ? 'Transfer a̶p̶p̶r̶o̶v̶e̶d rejected'
      : 'Failed to submit the transfer'

    if (txId) removeOngoing(txId)

    captureException(e)
    addNotification({
      message,
      severity: NotificationSeverity.Error,
    })
  }

  return { transfer }
}

export default useParaspellApi
