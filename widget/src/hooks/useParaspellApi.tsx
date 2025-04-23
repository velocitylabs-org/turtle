import { txWasCancelled } from '@/utils/transfer'
import { Sender, Status, TransferParams } from './useTransfer'
import useNotification from './useNotification'
import { NotificationSeverity } from '@/models/notification'
import { switchChain } from '@wagmi/core'
import { wagmiConfig } from '@/providers/config'
import { getSenderAddress } from '@/utils/address'
import { moonbeam } from 'wagmi/chains'
import { getTokenPrice } from '@/utils/token'
import { createTx, dryRun, DryRunResult, moonbeamTransfer } from '@/lib/paraspell'
import { Config, useConnectorClient } from 'wagmi'
import { SubstrateAccount } from '@/stores/substrateWalletStore'
import { InvalidTxError } from 'polkadot-api'
import type { TxEvent } from 'polkadot-api'
import { getPolkadotSignerFromPjs, SignPayload, SignRaw } from 'polkadot-api/pjs-signer'
import { handleObservableEvents } from '@/lib/papi'
import useOngoingTransfers from './useOngoingTransfers'

const useParaspellApi = () => {
  const { addNotification } = useNotification()
  const { addOrUpdate, remove: removeOngoing } = useOngoingTransfers()
  const { data: viemClient } = useConnectorClient<Config>({ chainId: moonbeam.id })

  // main transfer function which is exposed to the components.
  const transfer = async (params: TransferParams, setStatus: (status: Status) => void) => {
    setStatus('Loading')

    try {
      if (params.sourceChain.uid === 'moonbeam') await handleMoonbeamTransfer(params, setStatus)
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
    const tokenUSDValue = (await getTokenPrice(params.token))?.usd ?? 0
    const date = new Date()
    await addToOngoingTransfers(hash, params, senderAddress, tokenUSDValue, date, setStatus)

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

    const validationResult = await validate(params)
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
    const tokenUSDValue = (await getTokenPrice(params.token))?.usd ?? 0
    const date = new Date()

    tx.signSubmitAndWatch(polkadotSigner).subscribe({
      next: async (event: TxEvent) =>
        await handleTxEvent(event, params, senderAddress, tokenUSDValue, date, setStatus),
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

  const handleTxEvent = async (
    event: TxEvent,
    params: TransferParams,
    senderAddress: string,
    tokenUSDValue: number,
    date: Date,
    setStatus: (status: Status) => void,
  ) => {
    if (event.type === 'signed') {
      await addToOngoingTransfers(
        event.txHash.toString(),
        params,
        senderAddress,
        tokenUSDValue,
        date,
        setStatus,
      )
    }

    try {
      updateOngoingTransfers(event, params, senderAddress, tokenUSDValue, date)
    } catch (error) {
      handleSendError(params.sender, error, setStatus, event.txHash.toString())
    }

    // if (params.environment === Environment.Mainnet && isProduction) {
    //   trackTransferMetrics({
    //     id: event.txHash.toString(),
    //     sender: senderAddress,
    //     sourceChain: params.sourceChain,
    //     token: params.token,
    //     amount: params.amount,
    //     destinationChain: params.destinationChain,
    //     tokenUSDValue,
    //     fees: params.fees,
    //     recipient: params.recipient,
    //     date,
    //     environment: params.environment,
    //   })
    //   setStatus('Idle')
    // }
  }

  const addToOngoingTransfers = async (
    txHash: string,
    params: TransferParams,
    senderAddress: string,
    tokenUSDValue: number,
    date: Date,
    setStatus: (status: Status) => void,
  ): Promise<void> => {
    // For a smoother UX, give it 2 seconds before adding the tx to 'ongoing'
    // and unlocking the UI by resetting the form back to 'Idle'.
    await new Promise(resolve =>
      setTimeout(() => {
        setStatus('Idle')
        params.onComplete?.()
        addOrUpdate({
          id: txHash,
          sourceChain: params.sourceChain,
          token: params.token,
          tokenUSDValue,
          sender: senderAddress,
          destChain: params.destinationChain,
          amount: params.amount.toString(),
          recipient: params.recipient,
          date,
          environment: params.environment,
          fees: params.fees,
          bridgingFees: params.bridgingFees,
          status: `Submitting to ${params.sourceChain.name}`,
        })
        resolve(true)
      }, 2000),
    )
  }

  const updateOngoingTransfers = (
    event: TxEvent,
    params: TransferParams,
    senderAddress: string,
    tokenUSDValue: number,
    date: Date,
  ) => {
    const eventsData = handleObservableEvents(event)
    if (!eventsData) return

    const { messageHash, messageId, extrinsicIndex } = eventsData

    // Update the ongoing tx entry now containing the necessary
    // fields to be able to track its progress.
    addOrUpdate({
      id: event.txHash.toString(),
      sourceChain: params.sourceChain,
      token: params.token,
      tokenUSDValue,
      sender: senderAddress,
      destChain: params.destinationChain,
      amount: params.amount.toString(),
      recipient: params.recipient,
      date,
      environment: params.environment,
      fees: params.fees,
      bridgingFees: params.bridgingFees,
      ...(messageHash && { crossChainMessageHash: messageHash }),
      ...(messageId && { parachainMessageId: messageId }),
      ...(extrinsicIndex && { sourceChainExtrinsicIndex: extrinsicIndex }),
      status: `Arriving at ${params.destinationChain.name}`,
      finalizedAt: new Date(),
    })
  }

  const validate = async (params: TransferParams): Promise<DryRunResult> => {
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
    // if (!cancelledByUser) captureException(e) - Sentry

    addNotification({
      message,
      severity: NotificationSeverity.Error,
    })
  }

  return { transfer }
}

export default useParaspellApi
