import { NotificationSeverity } from '@/models/notification'
import { StoredTransfer } from '@/models/transfer'
import { getTokenPrice } from '@/services/balance'
import { Environment } from '@/store/environmentStore'
import { Account as SubstrateAccount } from '@/store/substrateWalletStore'
import { getSenderAddress } from '@/utils/address'
import { trackTransferMetrics } from '@/utils/analytics'
import { txWasCancelled } from '@/utils/transfer'
import { captureException } from '@sentry/nextjs'
import useNotification from './useNotification'
import useOngoingTransfers from './useOngoingTransfers'
import { Status, TransferParams } from './useTransfer'
import { Builder } from '@paraspell/sdk'

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

    setStatus('Loading')
    const account = sender as SubstrateAccount
    let isComplete = false
    try {
      const txResult = await Builder()
        .from('AssetHubPolkadot')
        .to('Ethereum')
        .currency({ symbol: 'WETH' }) //Any supported asset by bridge eg. WETH, WBTC, SHIB and more - {symbol: currencySymbol} | {id: currencyID}
        .amount(amount)
        .address(recipient) //AccountKey20 recipient address
        .build()
      console.log('txResult', txResult.toJSON())

      await txResult.signAndSend(
        account.address,
        { signer: account.signer as any },
        async result => {
          try {
            const { txHash, status, events, isError, internalError } = result
            console.log('isError', isError)
            console.log('internalError', internalError)

            // verify transaction hash & transfer isn't completed
            if (!txHash) throw new Error('Transfer error: Failed to generate the transaction hash')
            console.log('txHash', txHash.toString())

            if (isComplete) return

            console.log('status', status.toJSON())

            // Wait until block is finalized before handling transfer data
            if (status.isFinalized) {
              let messageHash: string | undefined
              let messageId: string | undefined
              let extrinsicSuccess: boolean = false

              // Filter the events to get the needed data
              events.forEach(({ event: { data, method, section } }) => {
                console.log('method:', method, 'section:', section, 'data', data.toJSON())
                if (
                  method === 'XcmpMessageSent' &&
                  section === 'xcmpQueue' &&
                  'messageHash' in data
                ) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  messageHash = (data.messageHash as any).toString()
                }
                if (method === 'Sent' && section === 'polkadotXcm' && 'messageId' in data) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  messageId = (data.messageId as any).toString()
                }
                if (method === 'ExtrinsicSuccess' && section === 'system') {
                  extrinsicSuccess = true
                }
              })

              if (!extrinsicSuccess)
                throw new Error('Transfer failed. Returned extrinsicSuccess: false')
              if (!messageHash) throw new Error('Cross chain messageHash missing')
              if (!messageId) throw new Error('Parachain messageId missing')

              // Add transfer to storage
              const senderAddress = await getSenderAddress(sender)
              const tokenUSDValue =
                (await getTokenPrice(token.coingeckoId ?? token.symbol))?.usd ?? 0
              const date = new Date()

              addTransferToStorage({
                id: txHash.toString(),
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
                crossChainMessageHash: messageHash,
                parachainMessageId: messageId,
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
                  date: date.toISOString(),
                })
              }
              // Mark the transfer as complete and return
              isComplete = true
              setStatus('Idle')
              return
            }
          } catch (callbackError) {
            // Handle errors occurring in the async callback
            if (!txWasCancelled(sender, callbackError)) captureException(callbackError)
            handleSendError(callbackError)
            setStatus('Idle')
          }
        },
      )
    } catch (e) {
      if (!txWasCancelled(sender, e)) captureException(e)
      handleSendError(e)
      setStatus('Idle')
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

export default useParaspellApi
