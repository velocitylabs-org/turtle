import { config } from '@/config'
import { NotificationSeverity } from '@/models/notification'
import { StoredTransfer } from '@/models/transfer'
import { getCachedTokenPrice } from '@/services/balance'
import { Environment } from '@/store/environmentStore'
import { SubstrateAccount } from '@/store/substrateWalletStore'
import { getSenderAddress } from '@/utils/address'
import { trackTransferMetrics } from '@/utils/analytics'
import { isProduction } from '@/utils/env'
import { extractPapiEvent } from '@/utils/papi'
import {
  createTx,
  dryRun,
  DryRunResult,
  getCurrencyId,
  getRelayNode,
  moonbeamTransfer,
} from '@/utils/paraspell'
import { extractPjsEvents } from '@/utils/pjs'
import { txWasCancelled } from '@/utils/transfer'
import { getAssetMultiLocation, getTNode } from '@paraspell/sdk'
import { RouterBuilder } from '@paraspell/xcm-router'
import { ISubmittableResult } from '@polkadot/types/types'
import { captureException } from '@sentry/nextjs'
import { switchChain } from '@wagmi/core'
import { InvalidTxError, TxEvent } from 'polkadot-api'
import { getPolkadotSignerFromPjs, SignPayload, SignRaw } from 'polkadot-api/pjs-signer'
import { Config, useConnectorClient } from 'wagmi'
import { moonbeam } from 'wagmi/chains'
import useNotification from './useNotification'
import useOngoingTransfers from './useOngoingTransfers'
import { Sender, Status, TransferParams } from './useTransfer'

type TransferEvent =
  | { type: 'pjs'; eventData: ISubmittableResult }
  | { type: 'papi'; eventData: TxEvent }

const useParaspellApi = () => {
  const { addOrUpdate, remove: removeOngoing } = useOngoingTransfers()
  const { addNotification } = useNotification()
  const { data: viemClient } = useConnectorClient<Config>({ chainId: moonbeam.id })

  // main transfer function which is exposed to the components.
  const transfer = async (params: TransferParams, setStatus: (status: Status) => void) => {
    setStatus('Loading')

    try {
      if (params.sourceToken.id !== params.destinationToken.id) await handleSwap(params, setStatus)
      else if (params.sourceChain.uid === 'moonbeam')
        await handleMoonbeamTransfer(params, setStatus)
      else await handlePolkadotTransfer(params, setStatus)
    } catch (e) {
      handleSendError(params.sender, e, setStatus)
    }
  }

  const handleMoonbeamTransfer = async (
    params: TransferParams,
    setStatus: (status: Status) => void,
  ) => {
    await switchChain(config, { chainId: moonbeam.id })
    const hash = await moonbeamTransfer(params, viemClient)

    const senderAddress = await getSenderAddress(params.sender)
    const tokenUSDValue = (await getCachedTokenPrice(params.sourceToken))?.usd ?? 0
    const date = new Date()

    const transferToStore = {
      id: hash,
      sourceChain: params.sourceChain,
      sourceToken: params.sourceToken,
      destinationToken: params.destinationToken,
      tokenUSDValue,
      sender: senderAddress,
      destChain: params.destinationChain,
      amount: params.amount.toString(),
      recipient: params.recipient,
      date,
      environment: params.environment,
      fees: params.fees,
      status: `Submitting to ${params.sourceChain.name}`,
    }

    await addToOngoingTransfers(transferToStore, () => {
      setStatus('Idle')
      params.onComplete?.()
    })

    // We intentionally track the transfer on submit. The intention was clear, and if it fails somehow we see it in sentry and fix it.
    if (params.environment === Environment.Mainnet && isProduction) {
      trackTransferMetrics({
        id: hash,
        sender: senderAddress,
        sourceChain: params.sourceChain,
        token: params.sourceToken,
        amount: params.amount,
        destinationChain: params.destinationChain,
        tokenUSDValue,
        fees: params.fees,
        recipient: params.recipient,
        date,
        environment: params.environment,
      })

      setStatus('Idle')
    }
  }

  const handlePolkadotTransfer = async (
    params: TransferParams,
    setStatus: (status: Status) => void,
  ) => {
    const account = params.sender as SubstrateAccount

    if (!account.pjsSigner?.signPayload || !account.pjsSigner?.signRaw)
      throw new Error('Signer not found')

    // Validate the transfer
    setStatus('Validating')

    const validationResult = await validateTransfer(params)
    if (validationResult.type === 'Supported' && !validationResult.success)
      throw new Error(`Transfer dry run failed: ${validationResult.failureReason}`)

    const tx = await createTx(params, params.sourceChain.rpcConnection)
    setStatus('Signing')

    const polkadotSigner = getPolkadotSignerFromPjs(
      account.address,
      account.pjsSigner.signPayload as SignPayload,
      account.pjsSigner.signRaw as SignRaw,
    )

    const senderAddress = await getSenderAddress(params.sender)
    const tokenUSDValue = (await getCachedTokenPrice(params.sourceToken))?.usd ?? 0
    const date = new Date()

    tx.signSubmitAndWatch(polkadotSigner).subscribe({
      next: async (event: TxEvent) => {
        const transferToStore = {
          id: event.txHash?.toString() ?? '',
          sourceChain: params.sourceChain,
          sourceToken: params.sourceToken,
          destinationToken: params.destinationToken,
          tokenUSDValue,
          sender: senderAddress,
          destChain: params.destinationChain,
          amount: params.amount.toString(),
          recipient: params.recipient,
          date,
          environment: params.environment,
          fees: params.fees,
          status: `Submitting to ${params.sourceChain.name}`,
        }

        try {
          await handleTxEvent({ type: 'papi', eventData: event }, transferToStore)
        } catch (error) {
          handleSendError(params.sender, error, setStatus, event.txHash.toString())
        }
      },
      error: callbackError => {
        if (callbackError instanceof InvalidTxError) {
          console.log(`InvalidTxError - TransactionValidityError: ${callbackError.error}`)
          handleSendError(params.sender, callbackError, setStatus)
        }
        handleSendError(params.sender, callbackError, setStatus)
      },
      complete: () => console.log('The transaction is complete'),
    })

    setStatus('Sending')
  }

  const handleSwap = async (params: TransferParams, setStatus: (status: Status) => void) => {
    const account = params.sender as SubstrateAccount

    if (!account.pjsSigner?.signPayload || !account.pjsSigner?.signRaw)
      throw new Error('Signer not found')

    setStatus('Signing')

    const senderAddress = await getSenderAddress(params.sender)
    const tokenUSDValue = (await getCachedTokenPrice(params.sourceToken))?.usd ?? 0
    const date = new Date()

    const relay = getRelayNode(params.environment)
    const sourceChainFromId = getTNode(params.sourceChain.chainId, relay)
    const destinationChainFromId = getTNode(params.destinationChain.chainId, relay)
    if (!sourceChainFromId || !destinationChainFromId)
      throw new Error('Transfer failed: chain id not found.')

    const currencyIdFrom = getCurrencyId(
      params.environment,
      sourceChainFromId,
      params.sourceChain.uid,
      params.sourceToken,
    )

    const currencyIdTo = getCurrencyId(
      params.environment,
      destinationChainFromId,
      params.destinationChain.uid,
      params.destinationToken,
    )
    const multilocation = getAssetMultiLocation(destinationChainFromId, currencyIdTo)
    console.log(params.destinationToken.multilocation)

    // TODO: outsource to utils/paraspell.ts
    const routerPlan = await RouterBuilder()
      .from('Hydration')
      .to('Hydration')
      .currencyFrom({ symbol: 'DOT' }) // DOT
      .currencyTo({ symbol: 'HDX' }) // ACA
      .amount('1500000000')
      .slippagePct('1')
      .senderAddress(account.address)
      .recipientAddress(params.recipient)
      .signer(account.pjsSigner as any)
      .buildTransactions()

    console.log(routerPlan)

    const step1 = routerPlan.at(0)

    step1?.tx.signAndSend(account.address, async result => {
      const transferToStore = {
        id: result.txHash?.toString() ?? '',
        sourceChain: params.sourceChain,
        sourceToken: params.sourceToken,
        destinationToken: params.destinationToken,
        tokenUSDValue,
        sender: senderAddress,
        destChain: params.destinationChain,
        amount: params.amount.toString(),
        recipient: params.recipient,
        date,
        environment: params.environment,
        fees: params.fees,
        status: `Submitting to ${params.sourceChain.name}`,
        swapInformation: { plan: routerPlan, currentStep: 0 },
      }

      try {
        await handleTxEvent({ type: 'pjs', eventData: result }, transferToStore)
      } catch (error) {
        handleSendError(params.sender, error, setStatus, result.txHash.toString())
      }
    })
  }

  /** Handle the incoming transaction events and update the ongoing transfers accordingly. Supports PAPI and PJS events. */
  const handleTxEvent = async (event: TransferEvent, transferToStore: StoredTransfer) => {
    if (
      (event.type === 'papi' && event.eventData.type === 'signed') ||
      (event.type === 'pjs' && event.eventData.status.isBroadcast)
    ) {
      await addToOngoingTransfers({
        ...transferToStore,
        id: event.eventData.txHash.toString(),
      })
    }

    let eventsData
    if (event.type === 'papi') eventsData = extractPapiEvent(event.eventData)
    else if (event.type === 'pjs') eventsData = extractPjsEvents(event.eventData)
    if (!eventsData) return

    const { messageHash, messageId, extrinsicIndex } = eventsData

    addOrUpdate({
      ...transferToStore,
      id: event.eventData.txHash.toString(),
      crossChainMessageHash: messageHash,
      parachainMessageId: messageId,
      sourceChainExtrinsicIndex: extrinsicIndex,
      status: `Arriving at ${transferToStore.destChain.name}`,
      finalizedAt: new Date(),
    })
  }

  const validateTransfer = async (params: TransferParams): Promise<DryRunResult> => {
    try {
      const result = await dryRun(params, params.sourceChain.rpcConnection)

      return {
        type: 'Supported',
        ...result,
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('DryRunApi is not available'))
        return { type: 'Unsupported', success: false, failureReason: e.message }

      return {
        type: 'Supported',
        success: false,
        failureReason: (e as Error).message,
      }
    }
  }

  const addToOngoingTransfers = async (
    transferToStore: StoredTransfer,
    onComplete?: () => void,
  ): Promise<void> => {
    // For a smoother UX, give it 2 seconds before adding the tx to 'ongoing'
    // and unlocking the UI by resetting the form back to 'Idle'.
    await new Promise(resolve =>
      setTimeout(() => {
        addOrUpdate(transferToStore)
        onComplete?.()
        resolve(true)
      }, 2000),
    )
  }

  const handleSendError = (
    sender: Sender,
    e: unknown,
    setStatus: (status: Status) => void,
    txId?: string,
  ) => {
    setStatus('Idle')
    console.log('Transfer error:', e)
    const cancelledByUser = txWasCancelled(sender, e)
    const message = cancelledByUser ? 'Transfer a̶p̶p̶r̶o̶v̶e̶d rejected' : 'Failed to submit the transfer'

    if (txId) removeOngoing(txId)
    if (!cancelledByUser) captureException(e)

    addNotification({
      message,
      severity: NotificationSeverity.Error,
    })
  }

  return { transfer }
}

export default useParaspellApi
