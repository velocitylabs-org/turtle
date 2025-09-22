import type { TDryRunChainResult } from '@paraspell/sdk'
import { captureException } from '@sentry/nextjs'
import { isSameToken } from '@velocitylabs-org/turtle-registry'
import { switchChain } from '@wagmi/core'
import { InvalidTxError, type TxEvent } from 'polkadot-api'
import { getPolkadotSignerFromPjs, type SignPayload, type SignRaw } from 'polkadot-api/pjs-signer'
import type { Client } from 'viem'
import { type Config, useConnectorClient } from 'wagmi'
import { moonbeam } from 'wagmi/chains'
import { config } from '@/config'
import { NotificationSeverity } from '@/models/notification'
import { type CompletedTransfer, type OnChainBaseEvents, type StoredTransfer, TxStatus } from '@/models/transfer'
import { getCachedTokenPrice } from '@/services/balance'
import evmTransferBuilderManager from '@/services/paraspell/evmTransferBuilder'
import xcmRouterBuilderManager from '@/services/paraspell/xcmRouterBuilder'
import xcmTransferBuilderManager from '@/services/paraspell/xcmTransferBuilder'
import type { SubstrateAccount } from '@/store/substrateWalletStore'
import { getSenderAddress } from '@/utils/address'
import { trackTransferMetrics, updateTransferMetrics } from '@/utils/analytics'
import { extractPapiEvent } from '@/utils/papi'
import type { DryRunResult } from '@/utils/paraspellTransfer'
import { getExplorerLink, hashToHex, isSameChainSwap, isSwapWithTransfer, txWasCancelled } from '@/utils/transfer'
import useCompletedTransfers from './useCompletedTransfers'
import useNotification from './useNotification'
import useOngoingTransfers from './useOngoingTransfers'
import type { Sender, Status, TransferParams } from './useTransfer'

const useParaspellApi = () => {
  const { addOrUpdate, remove: removeOngoing } = useOngoingTransfers()
  const { addCompletedTransfer } = useCompletedTransfers()
  const { addNotification } = useNotification()
  const { data: viemClient } = useConnectorClient<Config>({ chainId: moonbeam.id })

  // main transfer function which is exposed to the components.
  const transfer = async (params: TransferParams, setStatus: (status: Status) => void) => {
    setStatus('Loading')

    try {
      if (!isSameToken(params.sourceToken, params.destinationToken)) await handleSwap(params, setStatus)
      else if (params.sourceChain.uid === 'moonbeam') await handleMoonbeamTransfer(params, setStatus)
      else await handlePolkadotTransfer(params, setStatus)
    } catch (e) {
      handleSendError(params.sender, e, setStatus)
    }
  }

  const handleMoonbeamTransfer = async (params: TransferParams, setStatus: (status: Status) => void) => {
    await switchChain(config, { chainId: moonbeam.id })
    const hash = await evmTransferBuilderManager.transferTx(params, viemClient as Client)

    const senderAddress = await getSenderAddress(params.sender)
    const sourceTokenUSDValue = (await getCachedTokenPrice(params.sourceToken))?.usd ?? 0
    const destinationTokenUSDValue = (await getCachedTokenPrice(params.destinationToken))?.usd ?? 0
    const date = new Date()

    const transferToStore = {
      id: hash,
      sourceChain: params.sourceChain,
      sourceToken: params.sourceToken,
      destinationToken: params.destinationToken,
      sourceTokenUSDValue,
      sender: senderAddress,
      destChain: params.destinationChain,
      sourceAmount: params.sourceAmount.toString(),
      recipient: params.recipient,
      date,
      fees: params.fees,
      status: `Submitting to ${params.sourceChain.name}`,
    }

    await addToOngoingTransfers(transferToStore, () => {
      setStatus('Idle')
      params.onComplete?.()
      trackTransferMetrics({
        transferParams: params,
        txId: hash,
        senderAddress,
        sourceTokenUSDValue,
        destinationTokenUSDValue,
        date,
      })
      evmTransferBuilderManager.disconnect(params)
    })

    setStatus('Idle')
  }

  const handlePolkadotTransfer = async (params: TransferParams, setStatus: (status: Status) => void) => {
    const account = params.sender as SubstrateAccount

    if (!account.pjsSigner?.signPayload || !account.pjsSigner?.signRaw) throw new Error('Signer not found')

    // Validate the transfer
    setStatus('Validating')

    const validationResult = await validatePolkadotTransfer(params)

    const dryRunCapturePayload = {
      extra: {
        sourceChain: params.sourceChain.uid,
        destinationChain: params.destinationChain.uid,
        token: params.sourceToken.id,
      },
    }

    if (validationResult.type === 'Unsupported') {
      addNotification({
        message: getFailureReason(validationResult),
        severity: NotificationSeverity.Warning,
      })
      captureException(new Error('DryRun Error: Unsupported'), {
        ...dryRunCapturePayload,
        level: 'warning',
      })
    }
    if (validationResult.type === 'Supported') {
      if (!validationResult.origin.success) {
        captureException(new Error('DryRun Error: Origin Validation Failed'), {
          ...dryRunCapturePayload,
          level: 'warning',
        })
        throw new Error(`Transfer dry run failed: ${validationResult.origin.failureReason}`)
      }
      if (validationResult.destination && !validationResult.destination.success) {
        captureException(new Error('DryRun Error: Destination Validation Failed'), {
          ...dryRunCapturePayload,
          level: 'warning',
        })
        throw new Error(`Transfer dry run failed: ${validationResult.destination.failureReason}`)
      }

      if (validationResult.origin.success && validationResult.destination?.success) {
        const isExistentialDepositMet = await xcmTransferBuilderManager.isExistentialDepositMetAfterTransfer(params)
        if (!isExistentialDepositMet) throw new Error('Transfer failed: existential deposit will not be met.')
      }
    }

    const tx = await xcmTransferBuilderManager.createTransferTx(params)
    setStatus('Signing')

    const polkadotSigner = getPolkadotSignerFromPjs(
      account.address,
      account.pjsSigner.signPayload as SignPayload,
      account.pjsSigner.signRaw as SignRaw,
    )

    const senderAddress = await getSenderAddress(params.sender)
    const sourceTokenUSDValue = (await getCachedTokenPrice(params.sourceToken))?.usd ?? 0
    const destinationTokenUSDValue = (await getCachedTokenPrice(params.destinationToken))?.usd ?? 0
    const date = new Date()

    tx.signSubmitAndWatch(polkadotSigner).subscribe({
      next: async (event: TxEvent) => {
        const transferToStore = {
          id: hashToHex(event.txHash),
          sourceChain: params.sourceChain,
          sourceToken: params.sourceToken,
          destinationToken: params.destinationToken,
          sourceTokenUSDValue,
          sender: senderAddress,
          destChain: params.destinationChain,
          sourceAmount: params.sourceAmount.toString(),
          recipient: params.recipient,
          date,
          fees: params.fees,
          status: `Submitting to ${params.sourceChain.name}`,
        }

        try {
          await handleTxEvent(event, transferToStore, () => {
            setStatus('Idle')
            params.onComplete?.()
            trackTransferMetrics({
              transferParams: params,
              txId: hashToHex(event.txHash),
              senderAddress,
              sourceTokenUSDValue,
              destinationTokenUSDValue,
              date,
            })
            xcmTransferBuilderManager.disconnect(params)
          })
        } catch (error) {
          handleSendError(params.sender, error, setStatus, hashToHex(event.txHash))
          xcmTransferBuilderManager.disconnect(params)
        }
      },
      error: callbackError => {
        if (callbackError instanceof InvalidTxError) {
          console.log(`InvalidTxError - TransactionValidityError: ${callbackError.error}`)
          handleSendError(params.sender, callbackError, setStatus)
        }
        handleSendError(params.sender, callbackError, setStatus)
        xcmTransferBuilderManager.disconnect(params)
      },
      complete: () => {
        console.log('The transaction is complete')
        xcmTransferBuilderManager.disconnect(params)
      },
    })

    setStatus('Sending')
  }

  const handleSwap = async (params: TransferParams, setStatus: (status: Status) => void) => {
    const account = params.sender as SubstrateAccount
    if (!account.pjsSigner?.signPayload || !account.pjsSigner?.signRaw) throw new Error('Signer not found')

    setStatus('Loading')

    const sourceTokenUSDValue = (await getCachedTokenPrice(params.sourceToken))?.usd ?? 0
    const destinationTokenUSDValue = (await getCachedTokenPrice(params.destinationToken))?.usd ?? 0
    const date = new Date()

    const routerPlan = await xcmRouterBuilderManager.createRouterPlan(params)

    const firstTransaction = routerPlan.at(0)
    if (!firstTransaction) throw new Error('No steps in router plan')

    setStatus('Signing')

    const polkadotSigner = getPolkadotSignerFromPjs(
      account.address,
      account.pjsSigner.signPayload as SignPayload,
      account.pjsSigner.signRaw as SignRaw,
    )

    firstTransaction.tx.signSubmitAndWatch(polkadotSigner).subscribe({
      next: async (event: TxEvent) => {
        const transferToStore = {
          id: hashToHex(event.txHash),
          sourceChain: params.sourceChain,
          sourceToken: params.sourceToken,
          destinationToken: params.destinationToken,
          sourceTokenUSDValue,
          destinationTokenUSDValue,
          sender: account.address,
          destChain: params.destinationChain,
          sourceAmount: params.sourceAmount.toString(),
          destinationAmount: params.destinationAmount?.toString(),
          recipient: params.recipient,
          date,
          fees: params.fees,
          status: `Submitting to ${params.sourceChain.name}`,
          swapInformation: { plan: routerPlan, currentStep: 0 },
        }

        try {
          await handleTxEvent(event, transferToStore, () => {
            setStatus('Idle')
            params.onComplete?.()
            trackTransferMetrics({
              transferParams: params,
              txId: hashToHex(event.txHash),
              senderAddress: account.address,
              sourceTokenUSDValue,
              destinationTokenUSDValue,
              date,
              isSwap: true,
            })
            xcmRouterBuilderManager.disconnect(params)
          })
        } catch (error) {
          handleSendError(params.sender, error, setStatus, hashToHex(event.txHash))
          await xcmRouterBuilderManager.disconnect(params)
        }
      },
      // biome-ignore lint/suspicious/noExplicitAny: any
      error: (callbackError: any) => {
        handleSendError(params.sender, callbackError, setStatus)
        xcmRouterBuilderManager.disconnect(params)
      },
      complete: () => {
        console.log('The swap transaction is complete')
        xcmRouterBuilderManager.disconnect(params)
      },
    })

    setStatus('Sending')
  }

  /** Handle the incoming transaction events and update the ongoing transfers accordingly. */
  const handleTxEvent = async (event: TxEvent, transferToStore: StoredTransfer, onComplete?: () => void) => {
    if (event.type === 'signed') {
      await addToOngoingTransfers(
        {
          ...transferToStore,
          id: hashToHex(event.txHash),
        },
        onComplete,
      )
    }

    const onchainEvents = extractPapiEvent(event)
    if (!onchainEvents) return

    const { messageHash, messageId, extrinsicIndex } = onchainEvents

    addOrUpdate({
      ...transferToStore,
      id: hashToHex(event.txHash),
      crossChainMessageHash: messageHash,
      parachainMessageId: messageId,
      sourceChainExtrinsicIndex: extrinsicIndex,
      status: `Arriving at ${transferToStore.destChain.name}`,
      finalizedAt: new Date(),
    })

    monitorSwapWithTransfer(transferToStore, onchainEvents)
    handleSameChainSwapStorage(transferToStore, event)
  }

  const monitorSwapWithTransfer = (transfer: StoredTransfer, eventsData: OnChainBaseEvents) => {
    // By default, swaps are submitted using the Execute extrinsic from PolkadotXcm pallet.
    if (isSwapWithTransfer(transfer) && transfer.sourceChain.supportExecuteExtrinsic) {
      if (!eventsData.isExecuteAttemptCompleted || !eventsData.isExtrinsicSuccess)
        throw new Error('Swap transfer did not complete - Execute function not successful')
    } else {
      // Fallback to the BatchAll extinsic from utility pallet
      if (isSwapWithTransfer(transfer) && !eventsData.isBatchCompleted)
        throw new Error('Swap transfer did not complete - Batch failed')
    }
  }

  const handleSameChainSwapStorage = async (transfer: StoredTransfer, txEvent: TxEvent) => {
    if (!isSameChainSwap(transfer)) return

    const txSuccessful =
      txEvent.type === 'finalized' &&
      txEvent.events.some(event => event.type === 'System' && event.value.type === 'ExtrinsicSuccess')

    if (!txSuccessful) {
      captureException(new Error('Swap failed'), { extra: { transfer } })
      console.error('Swap failed!')
    }

    addNotification({
      message: txSuccessful ? 'Swap succeeded!' : 'Swap failed!',
      severity: txSuccessful ? NotificationSeverity.Success : NotificationSeverity.Error,
    })

    const explorerLink = getExplorerLink(transfer)
    removeOngoing(transfer.id)
    addCompletedTransfer({
      id: transfer.id,
      result: txSuccessful ? TxStatus.Succeeded : TxStatus.Failed,
      sourceToken: transfer.sourceToken,
      destinationToken: transfer.destinationToken,
      sourceChain: transfer.sourceChain,
      destChain: transfer.destChain,
      sourceAmount: transfer.sourceAmount,
      destinationAmount: transfer.destinationAmount,
      sourceTokenUSDValue: transfer.sourceTokenUSDValue ?? 0,
      destinationTokenUSDValue: transfer.destinationTokenUSDValue,
      fees: transfer.fees,
      sender: transfer.sender,
      recipient: transfer.recipient,
      date: transfer.date,
      ...(explorerLink && { explorerLink }),
    } satisfies CompletedTransfer)

    updateTransferMetrics({
      txHashId: transfer.id,
      status: txSuccessful ? TxStatus.Succeeded : TxStatus.Failed,
    })
  }

  const isDryRunApiSupported = (dryRunChainResult: TDryRunChainResult) => {
    return !(!dryRunChainResult.success && dryRunChainResult.failureReason.includes('DryRunApi is not available'))
  }

  const getFailureReason = (dryRunResult: DryRunResult) => {
    const defaultDryRunMessage = "Transfer may not succeed. DryRun can't be performed."
    if ('failureReason' in dryRunResult.origin) return dryRunResult.origin.failureReason
    if (dryRunResult.destination && 'failureReason' in dryRunResult.destination)
      return dryRunResult.destination.failureReason

    return defaultDryRunMessage
  }

  const validatePolkadotTransfer = async (params: TransferParams): Promise<DryRunResult> => {
    try {
      const result = await xcmTransferBuilderManager.dryRun(params)
      if (!isDryRunApiSupported(result.origin) || (result.destination && !isDryRunApiSupported(result.destination))) {
        return {
          type: 'Unsupported',
          ...result,
        }
      }

      return {
        type: 'Supported',
        ...result,
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred'
      const failureResult = {
        success: false,
        failureReason: errorMessage,
        currency: params.sourceToken.symbol,
      } as TDryRunChainResult

      if (e instanceof Error && e.message.includes('DryRunApi is not available'))
        return {
          type: 'Unsupported',
          origin: failureResult,
          hops: [],
        }

      return {
        type: 'Supported',
        origin: failureResult,
        hops: [],
      }
    }
  }

  const addToOngoingTransfers = async (transferToStore: StoredTransfer, onComplete?: () => void): Promise<void> => {
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

  const handleSendError = (sender: Sender, e: unknown, setStatus: (status: Status) => void, txId?: string) => {
    setStatus('Idle')
    console.log('Transfer error:', e)
    const cancelledByUser = txWasCancelled(sender, e)
    const message = cancelledByUser
      ? 'Transfer rejected'
      : 'Failed to submit the transfer. Make sure you have enough DOT'

    if (txId) removeOngoing(txId)
    if (!cancelledByUser) captureException(e)

    addNotification({
      message,
      severity: NotificationSeverity.Error,
    })

    if (txId) {
      updateTransferMetrics({
        txHashId: txId,
        status: TxStatus.Failed,
      })
    }
  }

  return { transfer }
}

export default useParaspellApi
