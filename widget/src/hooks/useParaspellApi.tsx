import { TDryRunNodeResult } from '@paraspell/sdk'
import { getTokenPrice, isSameToken } from '@velocitylabs-org/turtle-registry'
import { switchChain } from '@wagmi/core'
import { InvalidTxError } from 'polkadot-api'
import type { TxEvent } from 'polkadot-api'
import { getPolkadotSignerFromPjs, SignPayload, SignRaw } from 'polkadot-api/pjs-signer'
import { Config, useConnectorClient } from 'wagmi'
import { moonbeam } from 'wagmi/chains'
import { createRouterPlan } from '@/lib/paraspell/swap'
import {
  createTransferTx,
  dryRun,
  DryRunResult,
  isExistentialDepositMetAfterTransfer,
  moonbeamTransfer,
} from '@/lib/paraspell/transfer'
import { extractPapiEvent } from '@/lib/polkadot/papi'
import { NotificationSeverity } from '@/models/notification'
import { CompletedTransfer, OnChainBaseEvents, StoredTransfer, TxStatus } from '@/models/transfer'
import { wagmiConfig } from '@/providers/config'
import { SubstrateAccount } from '@/stores/substrateWalletStore'
import { getSenderAddress } from '@/utils/address'
import { wait } from '@/utils/datetime'
import { getExplorerLink } from '@/utils/explorer'
import { isSameChainSwap, isSwapWithTransfer, txWasCancelled } from '@/utils/transfer'
import useCompletedTransfers from './useCompletedTransfers'
import useNotification from './useNotification'
import useOngoingTransfers from './useOngoingTransfers'
import { Sender, Status, TransferParams } from './useTransfer'

const useParaspellApi = () => {
  const { addNotification } = useNotification()
  const { addCompletedTransfer } = useCompletedTransfers()
  const { addOrUpdate, remove: removeOngoing } = useOngoingTransfers()
  const { data: viemClient } = useConnectorClient<Config>({ chainId: moonbeam.id })

  // main transfer function which is exposed to the components.
  const transfer = async (params: TransferParams, setStatus: (status: Status) => void) => {
    setStatus('Loading')

    try {
      if (!isSameToken(params.sourceToken, params.destinationToken))
        await handleSwap(params, setStatus)
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
    await switchChain(wagmiConfig, { chainId: moonbeam.id })
    const hash = await moonbeamTransfer(params, viemClient)

    const senderAddress = await getSenderAddress(params.sender)
    const tokenUSDValue = (await getTokenPrice(params.sourceToken))?.usd ?? 0
    const date = new Date()

    const transferToStore = {
      id: hash,
      sourceChain: params.sourceChain,
      sourceToken: params.sourceToken,
      destinationToken: params.destinationToken,
      sourceTokenUSDValue: tokenUSDValue,
      sender: senderAddress,
      destChain: params.destinationChain,
      sourceAmount: params.sourceAmount.toString(),
      recipient: params.recipient,
      date,
      environment: params.environment,
      bridgingFee: params.bridgingFee,
      fees: params.fees,
      status: `Submitting to ${params.sourceChain.name}`,
    }

    await addToOngoingTransfers(transferToStore, () => {
      setStatus('Idle')
      params.onComplete?.()
    })

    // We intentionally track the transfer on submit. The intention was clear, and if it fails somehow we see it in sentry and fix it.
    // if (params.environment === Environment.Mainnet && isProduction) {
    //   trackTransferMetrics()
    //   setStatus('Idle')
    // }
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

    if (validationResult.type === 'Unsupported') {
      addNotification({
        message: getFailureReason(validationResult),
        severity: NotificationSeverity.Warning,
      })
    }
    if (validationResult.type === 'Supported') {
      if (!validationResult.origin.success) {
        throw new Error(`Transfer dry run failed: ${validationResult.origin.failureReason}`)
      }
      if (validationResult.destination && !validationResult.destination.success) {
        throw new Error(`Transfer dry run failed: ${validationResult.destination.failureReason}`)
      }

      if (validationResult.origin.success && validationResult.destination?.success) {
        const isExistentialDepositMet = await isExistentialDepositMetAfterTransfer(params)
        if (!isExistentialDepositMet)
          throw new Error('Transfer failed: existential deposit will not be met.')
      }
    }

    const tx = await createTransferTx(params, params.sourceChain.rpcConnection)
    setStatus('Signing')

    const polkadotSigner = getPolkadotSignerFromPjs(
      account.address,
      account.pjsSigner.signPayload as SignPayload,
      account.pjsSigner.signRaw as SignRaw,
    )

    const senderAddress = await getSenderAddress(params.sender)
    const tokenUSDValue = (await getTokenPrice(params.sourceToken))?.usd ?? 0
    const date = new Date()

    tx.signSubmitAndWatch(polkadotSigner).subscribe({
      next: async (event: TxEvent) => {
        const transferToStore = {
          id: event.txHash?.toString() ?? '',
          sourceChain: params.sourceChain,
          sourceToken: params.sourceToken,
          destinationToken: params.destinationToken,
          sourceTokenUSDValue: tokenUSDValue,
          sender: senderAddress,
          destChain: params.destinationChain,
          sourceAmount: params.sourceAmount.toString(),
          recipient: params.recipient,
          date,
          environment: params.environment,
          bridgingFee: params.bridgingFee,
          fees: params.fees,
          status: `Submitting to ${params.sourceChain.name}`,
        }

        try {
          await handleTxEvent(event, transferToStore, () => {
            setStatus('Idle')
            params.onComplete?.()
          })
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

    setStatus('Loading')

    const sourceTokenUSDValue = (await getTokenPrice(params.sourceToken))?.usd ?? 0
    const destinationTokenUSDValue = (await getTokenPrice(params.destinationToken))?.usd ?? 0
    const date = new Date()

    const routerPlan = await createRouterPlan(params)

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
          id: event.txHash?.toString() ?? '',
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
          environment: params.environment,
          fees: params.fees,
          bridgingFee: params.bridgingFee,
          status: `Submitting to ${params.sourceChain.name}`,
          swapInformation: { plan: routerPlan, currentStep: 0 },
        }

        try {
          await handleTxEvent(event, transferToStore, () => {
            setStatus('Idle')
            params.onComplete?.()
          })
        } catch (error) {
          handleSendError(params.sender, error, setStatus, event.txHash?.toString())
        }
      },
      error: callbackError => {
        handleSendError(params.sender, callbackError, setStatus)
      },
      complete: () => console.log('The first swap transaction is complete'),
    })

    setStatus('Sending')
  }

  // /** Handle the incoming transaction events and update the ongoing transfers accordingly. Supports PAPI and PJS events. */
  const handleTxEvent = async (
    event: TxEvent,
    transferToStore: StoredTransfer,
    onComplete?: () => void,
  ) => {
    if (event.type === 'signed') {
      await addToOngoingTransfers(
        {
          ...transferToStore,
          id: event.txHash.toString(),
        },
        onComplete,
      )
    }

    const onchainEvents = extractPapiEvent(event)
    if (!onchainEvents) return

    const { messageHash, messageId, extrinsicIndex } = onchainEvents

    addOrUpdate({
      ...transferToStore,
      id: event.txHash.toString(),
      crossChainMessageHash: messageHash,
      parachainMessageId: messageId,
      sourceChainExtrinsicIndex: extrinsicIndex,
      status: `Arriving at ${transferToStore.destChain.name}`,
      finalizedAt: new Date(),
    })

    monitorSwapWithTransfer(transferToStore, onchainEvents)
    handleSameChainSwapStorage(transferToStore)
  }

  const monitorSwapWithTransfer = (transfer: StoredTransfer, eventsData: OnChainBaseEvents) => {
    // Swap + XCM Transfer are handled with the BatchAll extinsic from utility pallet
    if (isSwapWithTransfer(transfer) && !eventsData.isBatchCompleted)
      throw new Error('Swap transfer did not completed - Batch failed')

    return
  }

  const handleSameChainSwapStorage = async (transfer: StoredTransfer) => {
    if (!isSameChainSwap(transfer)) return

    // Wait for 3 seconds to ensure user can read swap status update
    // before completing the transfer
    await wait(3000)

    const explorerLink = getExplorerLink(transfer)
    removeOngoing(transfer.id)
    addCompletedTransfer({
      id: transfer.id,
      result: TxStatus.Succeeded,
      sourceToken: transfer.sourceToken,
      destinationToken: transfer.destinationToken,
      sourceChain: transfer.sourceChain,
      destChain: transfer.destChain,
      sourceAmount: transfer.sourceAmount,
      destinationAmount: transfer.destinationAmount,
      sourceTokenUSDValue: transfer.sourceTokenUSDValue ?? 0,
      destinationTokenUSDValue: transfer.destinationTokenUSDValue,
      fees: transfer.fees,
      bridgingFee: transfer.bridgingFee,
      sender: transfer.sender,
      recipient: transfer.recipient,
      date: transfer.date,
      ...(explorerLink && { explorerLink }),
    } satisfies CompletedTransfer)
  }

  const isDryRunApiSupported = (dryRunNodeResult: TDryRunNodeResult) => {
    return !(
      !dryRunNodeResult.success &&
      dryRunNodeResult.failureReason.includes('DryRunApi is not available')
    )
  }

  const getFailureReason = (dryRunResult: DryRunResult) => {
    const defaultDryRunMessage = "Transfer may not succeed. DryRun can't be performed."
    if ('failureReason' in dryRunResult.origin) return dryRunResult.origin.failureReason
    if (dryRunResult.destination && 'failureReason' in dryRunResult.destination)
      return dryRunResult.destination.failureReason

    return defaultDryRunMessage
  }

  const validateTransfer = async (params: TransferParams): Promise<DryRunResult> => {
    try {
      const result = await dryRun(params, params.sourceChain.rpcConnection)
      if (
        !isDryRunApiSupported(result.origin) ||
        (result.destination && !isDryRunApiSupported(result.destination))
      ) {
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
      if (e instanceof Error && e.message.includes('DryRunApi is not available'))
        return { type: 'Unsupported', origin: { success: false, failureReason: e.message } }

      return {
        type: 'Supported',
        origin: {
          success: false,
          failureReason: (e as Error).message,
        },
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
    const message = cancelledByUser ? 'Transfer rejected' : 'Failed to submit the transfer'

    if (txId) removeOngoing(txId)
    // if (!cancelledByUser) captureException(e) - Sentry

    addNotification({
      message,
      severity: NotificationSeverity.Error,
    })
  }

  return { transfer }
}

export default useParaspellApi
