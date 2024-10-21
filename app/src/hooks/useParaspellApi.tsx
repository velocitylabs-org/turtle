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
import { assets, Builder } from '@paraspell/sdk'
import { ISubmittableResult } from '@polkadot/types/types'
import { ApiPromise, WsProvider } from '@polkadot/api'

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
    const isComplete = false

    try {
      const txResult = await createTx(params)
      await txResult.signAndSend(
        account.address,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { signer: account.signer as any },
        async result => {
          try {
            if (isComplete) return

            const eventsData = handleSubmittableEvents(result, isComplete)
            if (eventsData) {
              const { messageHash, messageId } = eventsData

              // Add transfer to storage
              const senderAddress = await getSenderAddress(sender)
              const tokenUSDValue =
                (await getTokenPrice(token.coingeckoId ?? token.symbol))?.usd ?? 0
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

const handleSubmittableEvents = (result: ISubmittableResult, exitCallBack: boolean) => {
  const { txHash, status, events, isError, internalError, isCompleted, dispatchError } = result
  // check for execution errors
  if (isError || internalError) throw new Error('Transfer failed')

  // verify transaction hash
  if (!txHash) throw new Error('Failed to generate the transaction hash')
  console.log('status', status.toJSON())

  // Wait until block is finalized before handling transfer data
  if (isCompleted && status.isFinalized) {
    // check for extrinsic errors
    if (dispatchError !== undefined) {
      if (dispatchError.isModule) {
        const { docs, section } = dispatchError.registry.findMetaError(dispatchError.asModule)
        throw new Error(`${docs.join(' ')} - Pallet '${section}'`)
      }
    }

    // Verify extrinsic success
    const extrinsicSuccess = result.findRecord('system', 'ExtrinsicSuccess')
    if (!extrinsicSuccess) throw new Error(`'ExtrinsicSuccess' event not found`)

    let messageHash: string | undefined
    let messageId: string | undefined

    // Filter the events to get the needed data
    events.forEach(({ event: { data, method, section } }) => {
      if (method === 'XcmpMessageSent' && section === 'xcmpQueue' && 'messageHash' in data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messageHash = (data.messageHash as any).toString()
      }
      if (method === 'Sent' && section === 'polkadotXcm' && 'messageId' in data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messageId = (data.messageId as any).toString()
      }
    })
    if (!messageHash) throw new Error('Cross chain messageHash missing')
    if (!messageId) throw new Error('Parachain messageId missing')

    // Mark the transfer as complete and return
    exitCallBack = true
    return { messageHash, messageId, exitCallBack }
  }
}

const createTx = async (params: TransferParams, wssEndpoint?: string) => {
  let api: ApiPromise | undefined = undefined
  if (wssEndpoint) {
    const wsProvider = new WsProvider(wssEndpoint)
    api = await ApiPromise.create({
      provider: wsProvider,
    })
  }

  const { sourceChain, destinationChain, token, amount, recipient } = params
  const sourceChainFromId = assets.getTNode(sourceChain.chainId)
  const destinationChainFromId = assets.getTNode(destinationChain.chainId)
  if (!sourceChainFromId || !destinationChainFromId)
    throw new Error('Transfer creation failed: chain is missing.')

  // ✋ TODO: verify currency, feeAsset && xcmVersion parameters
  return await Builder(api) // Api parameter is optional
    .from(sourceChainFromId)
    .to(destinationChainFromId)
    .currency({ symbol: token.symbol.toUpperCase() }) //{id: currencyID} | {symbol: currencySymbol}, | {multilocation: multilocationJson} | {multiasset: multilocationJsonArray}
    /*.feeAsset(feeAsset) - Parameter required when using MultilocationArray*/
    .amount(amount) // Token amount
    .address(recipient) // AccountId32 or AccountKey20 address or custom Multilocation
    /*.xcmVersion(Version.V1/V2/V3/V4)  //Optional parameter for manual override of XCM Version used in call*/
    .build()
}

export default useParaspellApi
