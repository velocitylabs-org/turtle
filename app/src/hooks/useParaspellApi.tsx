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
import { InvalidTxError, TxEvent } from 'polkadot-api'
import { handleObservableEvent } from '@/utils/papi'
// import { ChainDispatchError } from "@polkadot-api/descriptors"

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

      tx.signSubmitAndWatch(polkadotSigner).subscribe({
        next: async (event: TxEvent) => {
          if (event.type === 'broadcasted' || event.type === 'signed') {
            // event.type === 'broadcasted' ?
            // For a smoother UX, give it 2 seconds before adding the tx to 'ongoing'
            // and unlocking the UI by resetting the form back to 'Idle'.
            console.log('Signed ou broadcasted?', event.type)
            // await new Promise(_ =>
            //   setTimeout(function () {
            //     setStatus('Idle')
            //     onComplete?.()
            //     addOrUpdate({
            //       id: event.txHash.toString(),
            //       sourceChain,
            //       token,
            //       tokenUSDValue,
            //       sender: senderAddress,
            //       destChain: destinationChain,
            //       amount: amount.toString(),
            //       recipient,
            //       date,
            //       environment,
            //       fees,
            //       status: `Submitting to ${sourceChain.name}`,
            //     } satisfies StoredTransfer)
            //   }, 2000),
            // )
          }
          const eventData = handleObservableEvent(event)
          // const eventsData = handleSubmittableEvents(result)
          // if (eventsData) {
          //   const { messageHash, messageId, extrinsicIndex } = eventsData
          //   const id = getTxId(result)
          // ......
          if (event.type === 'finalized' || (event.type === 'txBestBlocksState' && event.found)) {
            // Update the ongoing tx entry now containing the necessary
            // fields to be able to track its progress.
            if (!event.txHash) throw new Error('Failed to generate the transaction hash')

            if (!event.ok) {
              // const err: ChainDispatchError = event.dispatchError
              // if (err.type === 'Module' && err.value.type === 'Balances') 'keep checking...'
              const dispatchError = event.dispatchError
              if (dispatchError.type === 'Module') {
                // const { docs, section } = dispatchError.registry.findMetaError(dispatchError.asModule)
                // throw new Error(`${docs.join(' ')} - Pallet '${section}'`)
                const error = dispatchError.value as any
                console.log('dispatchError', error)
                console.log('dispatchError type', 'type' in error && error.type)

                throw new Error('dispatchError')
              }
            }
          }

          if (event.type === 'finalized') {
            if (!event.txHash) throw new Error('Failed to generate the transaction hash')
            const {
              block: { index: txIndex, number: blockNumber },
              events,
            } = event

            const extrinsicIndex = `${blockNumber}-${txIndex}`
            let messageHash: string | undefined
            let messageId: string | undefined

            events.forEach(({ type: section, value: { type: method, value: data } }) => {
              console.log(method, ' - ', section, ': ', data)
              // Get messageHash from parachainSystem pallet (ex: DOT from Para to Para )
              if (
                section === 'ParachainSystem' &&
                method === 'UpwardMessageSent' &&
                'message_hash' in data
              ) {
                messageHash = data.message_hash.asHex()
              }
              // Get messageHash from xcmpQueue pallet (ex: AH to ETH)
              if (
                method === 'XcmpMessageSent' &&
                section === 'XcmpQueue' &&
                'message_hash' in data
              ) {
                messageHash = data.message_hash.asHex()
              }
              // Get messageId from xcmPallet pallet (ex: Relay Chain to AH)
              if (section === 'XcmPallet' && method === 'Sent' && 'message_id' in data) {
                messageId = data.message_id.asHex()
              }
              // Get messageId from polkadotXcm pallet (ex: AH to Relay Chain or ETH)
              if (section === 'PolkadotXcm' && method === 'Sent' && 'message_id' in data) {
                messageId = data.message_id.asHex()
              }
            })

            if (!messageHash && !messageId && !extrinsicIndex)
              throw new Error('MessageHash, MessageId and ExtrinsicIndex are all missing')

            return { messageHash, messageId, extrinsicIndex }
          }

          // addOrUpdate({
          //   id: event.txHash.toString(),
          //   sourceChain,
          //   token,
          //   tokenUSDValue,
          //   sender: senderAddress,
          //   destChain: destinationChain,
          //   amount: amount.toString(),
          //   recipient,
          //   date,
          //   environment,
          //   fees,
          //   // ...(messageHash && { crossChainMessageHash: messageHash }),
          //   //  ...(messageId && { parachainMessageId: messageId }),
          //   //  ...(extrinsicIndex && { sourceChainExtrinsicIndex: extrinsicIndex }),
          //   status: `Arriving at ${destinationChain.name}`,
          // } satisfies StoredTransfer)

          // // metrics
          // if (environment === Environment.Mainnet) {
          //   trackTransferMetrics({
          //     sender: senderAddress,
          //     sourceChain: sourceChain.name,
          //     token: token.name,
          //     amount: amount.toString(),
          //     destinationChain: destinationChain.name,
          //     usdValue: tokenUSDValue,
          //     usdFees: fees.inDollars,
          //     recipient: recipient,
          //     date,
          //   })
          // }
          setStatus('Idle')
          return
        },
        error: e => {
          if (e instanceof InvalidTxError) {
            // const typedErr: TransactionValidityError<typeof myChain> = err.error
            // console.log(typedErr)
            const broadcastingError = `InvalidTxError - Broadcasting: ${e.error}`
            console.log(broadcastingError, e)
            throw new Error(
              broadcastingError,
              // 'message' in e && e.message.toString(), ??
            )
          }
          console.log('Generic error: ', e)
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
