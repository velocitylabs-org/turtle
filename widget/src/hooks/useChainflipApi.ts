import { captureException } from '@sentry/react'
import { useQueryClient } from '@tanstack/react-query'
import { type Chain, PolkadotTokens } from '@velocitylabs-org/turtle-registry'
import { InvalidTxError, type TxEvent } from 'polkadot-api'
import { type Account, type Address, erc20Abi, type PublicClient, type WalletClient } from 'viem'
import { useChainId, usePublicClient, useSwitchChain, useWalletClient } from 'wagmi'
import { arbitrum, mainnet } from 'wagmi/chains'
import { extractPapiEvent, getPolkadotSigner } from '@/lib/polkadot/papi'
import { type Notification, NotificationSeverity } from '@/models/notification'
import { type StoredTransfer, TxStatus } from '@/models/transfer'
import { getCachedTokenPrice } from '@/services/balance'
import xcmTransferBuilderManager from '@/services/paraspell/xcmTransferBuilder'
import { useChainflipStore } from '@/store/chainflipStore'
import type { SubstrateAccount } from '@/store/substrateWalletStore'
import { getChainSpecificAddress, getSenderAddress } from '@/utils/address'
import { trackTransferMetrics, updateTransferMetrics } from '@/utils/analytics'
import { type ChainflipQuote, getDepositAddress, getRequiredBlockConfirmation } from '@/utils/chainflip'
import { addToOngoingTransfers } from '@/utils/tracking'
import { convertAmount, Direction, resolveDirection, txWasCancelled } from '@/utils/transfer'
import useNotification from './useNotification'
import useOngoingTransfers from './useOngoingTransfers'
import type { Sender, Status, TransferParams } from './useTransfer'

/**
 * This ChainflipApi file handles submitting swaps to the Chainflip network.
 *
 * The Chainflip Vault smart contract is not supported in the Polkadot environment.
 * Instead, we generate a deposit address using the Chainflip SDK and manage the transfer manually.
 * This is abstracted in the swap flow to ensure a seamless user experience.
 *
 * For transfers from AssetHub, we use the Paraspell Builder for its ease of use.
 * Using the Paraspell Builder prevent us from writing extensive PAPI boilerplate code including (but not limited to):
 * - Complex CLI interactions
 * - Generating @polkadot-api/descriptors
 * - Creating the AssetHub client
 * - Ongoing maintenance
 *
 * TL;DR: Don’t be surprised to see some Paraspell code used to interact with the AssetHub chain.
 */

const useChainflipApi = () => {
  const { getChainflipStoredQuote } = useChainflipStore()
  const qClient = useQueryClient()
  const { addNotification } = useNotification()
  const publicClient = usePublicClient()
  const { addOrUpdate, remove: removeOngoingTransfer } = useOngoingTransfers()
  const { switchChainAsync } = useSwitchChain()
  const chainId = useChainId()
  const { data: walletClient } = useWalletClient()

  const enforceSourceChain = async (sourceChain: Chain): Promise<void> => {
    if (sourceChain.network === 'Arbitrum' && !(chainId === arbitrum.id)) {
      await switchChainAsync({ chainId: arbitrum.id })
    }
    if (sourceChain.network === 'Ethereum' && !(chainId === mainnet.id)) {
      await switchChainAsync({ chainId: mainnet.id })
    }
  }

  const transfer = async (params: TransferParams, setStatus: (status: Status) => void): Promise<void> => {
    if (!walletClient) throw new Error('WalletClient not found')
    if (!publicClient) throw new Error('RPC client not available')

    const {
      sourceChain,
      destinationChain,
      sourceToken,
      destinationToken,
      destinationAmount,
      sourceAmount,
      sender,
      recipient,
      onComplete,
      fees,
    } = params

    try {
      setStatus('Loading')
      const chainflipQuote = await getChainflipStoredQuote(qClient, params)

      // Get chainflip deposit address
      const depositPayload = await getDepositAddress(chainflipQuote, sender.address, recipient)
      if (!depositPayload) throw new Error('Failed to generate the deposit address')

      setStatus('Validating')
      const direction = resolveDirection(sourceChain, destinationChain)
      switch (direction) {
        case Direction.ToPolkadot: {
          const depositAddress = depositPayload.depositAddress as Address
          const srcTokenContractAddress = sourceToken.address as Address
          await enforceSourceChain(sourceChain)

          const requiredBlockConfirmation = await getRequiredBlockConfirmation(chainflipQuote.destAsset.chain)
          const txHash = await submitEvmNetworkTransfer(
            chainflipQuote,
            publicClient,
            walletClient,
            srcTokenContractAddress,
            depositAddress,
            requiredBlockConfirmation,
            setStatus,
          )
          if (!txHash) throw new Error('Transaction hash not found - Transfer failed')

          const senderAddress = await getSenderAddress(sender)
          const sourceTokenUSDValue = (await getCachedTokenPrice(sourceToken))?.usd ?? 0
          const destinationTokenUSDValue = (await getCachedTokenPrice(destinationToken))?.usd ?? 0
          const date = new Date()

          addOrUpdate({
            id: txHash.toString(),
            sourceChain,
            sourceToken,
            sourceAmount: sourceAmount.toString(),
            sourceTokenUSDValue,
            destChain: destinationChain,
            destinationToken,
            destinationAmount: destinationAmount?.toString(),
            destinationTokenUSDValue,
            sender: senderAddress,
            recipient,
            date,
            fees,
            status: `Submitting to ${sourceChain.name}`,
            uniqueTrackingId: depositPayload.depositChannelId,
          } satisfies StoredTransfer)

          onComplete?.()
          setStatus('Idle')

          trackTransferMetrics({
            transferParams: params,
            txId: txHash,
            senderAddress,
            sourceTokenUSDValue,
            destinationTokenUSDValue,
            date,
            isSwap: true,
          })
          break
        }
        case Direction.ToArbitrum:
        case Direction.ToEthereum: {
          const swapParams = params
          const depositAddress = depositPayload.depositAddress
          // Here we format the transfer params as a ground base for a local Polkadot transfer
          // We don't use the Form's recipient address and the destchain but the Assethub deposit address generated by Chainflip
          const polkadotTransferParams = getPolkadotTransferParams(swapParams, depositAddress)
          // DryRun transfer
          await verifyPolkadotTransfer(polkadotTransferParams)
          // Verify ED for DOT transfers
          await verifyDotExistentialDeposit(polkadotTransferParams)

          await submitPolkadotTransfer(
            polkadotTransferParams,
            swapParams,
            depositPayload.depositChannelId,
            setStatus,
            addOrUpdate,
            removeOngoingTransfer,
            addNotification,
          )
          break
        }

        default:
          throw new Error('Unsupported chainflip flow')
      }
    } catch (e) {
      handleSendError(params.sender, e, removeOngoingTransfer, addNotification, setStatus)
    }
  }

  return { transfer }
}

// Ethereum and Arbitrum swaps
const submitEvmNetworkTransfer = async (
  chainflipQuote: ChainflipQuote,
  publicClient: PublicClient,
  walletClient: WalletClient,
  sourceTokenAddress: Address,
  depositAddress: Address,
  requiredBlockConfirmation: number | null,
  setStatus?: (status: Status) => void,
): Promise<`0x${string}`> => {
  const { depositAmount, srcAsset } = chainflipQuote
  const value = BigInt(depositAmount)
  // ETH TRANSFER
  if (srcAsset.asset === 'ETH') {
    // Dry run via simulateCalls
    await publicClient.simulateCalls({
      account: walletClient.account,
      calls: [
        {
          to: depositAddress,
          value,
        },
      ],
    })

    // Dry run via estimateGas
    await publicClient.estimateGas({
      account: walletClient.account,
      to: depositAddress,
      value,
    })

    if (setStatus) setStatus('Signing')
    const txHash = await walletClient.sendTransaction({
      account: walletClient.account as Account,
      chain: walletClient.chain,
      to: depositAddress,
      value,
    })

    if (setStatus) setStatus('Sending')
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      confirmations: requiredBlockConfirmation ?? 0,
    })

    if (!receipt) {
      throw Error(`Transaction ${txHash} not included`)
    }
    return txHash
  }

  // ERC20 TRANSFER

  // Dry run via simulateContract
  const dryRun = await publicClient.simulateContract({
    account: walletClient.account,
    address: sourceTokenAddress,
    abi: erc20Abi,
    functionName: 'transfer',
    args: [depositAddress, value],
  })

  if (setStatus) setStatus('Signing')
  const txHash = await walletClient.writeContract(dryRun.request)
  if (setStatus) setStatus('Sending')
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
    confirmations: requiredBlockConfirmation ?? 0,
  })
  if (!receipt) {
    throw Error(`Transaction ${txHash} not included`)
  }
  return txHash
}

const submitPolkadotTransfer = async (
  polkadotTransferParams: TransferParams,
  swapParams: TransferParams,
  depositChannelId: string,
  setStatus: (status: Status) => void,
  addOrUpdate: (transfer: StoredTransfer) => void,
  removeOngoingTransfer: (id: string) => void,
  addNotification: (notification: Omit<Notification, 'id'>) => void,
): Promise<void> => {
  const { sourceChain, sourceToken, sender, destinationToken, destinationAmount, sourceAmount, fees, onComplete } =
    polkadotTransferParams
  const { destinationChain, recipient } = swapParams

  // Here we create the unsigned transaction with Paraspell Builder
  const unsignedTx = await xcmTransferBuilderManager.createTransferTx(polkadotTransferParams)

  const polkadotSigner = getPolkadotSigner(swapParams.sender as SubstrateAccount)
  const senderAddress = await getSenderAddress(sender)
  const formattedSenderAddress = getChainSpecificAddress(senderAddress, sourceChain)
  const sourceTokenUSDValue = (await getCachedTokenPrice(sourceToken))?.usd ?? 0
  const destinationTokenUSDValue = (await getCachedTokenPrice(destinationToken))?.usd ?? 0
  const date = new Date()

  const transferToStore = {
    id: '',
    sourceChain,
    sourceToken,
    sourceAmount: sourceAmount.toString(),
    sourceTokenUSDValue,
    // We use the final destinationChain from the swapParams (ex: ETH)
    // not the polkadotTransferParams.destinationChain (ex: AssetHub)
    destChain: destinationChain,
    destinationToken,
    destinationAmount: destinationAmount?.toString(),
    destinationTokenUSDValue,
    sender: formattedSenderAddress,
    // We use the final recipient from the swapParams (ex: ETH)
    // not the chainflip deposit address
    recipient: recipient,
    date,
    fees,
    uniqueTrackingId: depositChannelId,
    // Same as destchain
    status: `Submitting to ${sourceChain.name}`,
  }

  await new Promise((resolve, reject) => {
    setStatus('Signing')
    unsignedTx.signSubmitAndWatch(polkadotSigner).subscribe({
      next: async (event: TxEvent) => {
        try {
          transferToStore.id = event.txHash

          const onSignedCallback = () => {
            onComplete?.()
            setStatus('Idle')

            trackTransferMetrics({
              transferParams: swapParams,
              txId: event.txHash,
              senderAddress: formattedSenderAddress,
              sourceTokenUSDValue,
              destinationTokenUSDValue,
              date,
              isSwap: true,
            })
            xcmTransferBuilderManager.disconnect(polkadotTransferParams)
          }
          await handlePolkadotTxEvents(event, addOrUpdate, transferToStore, resolve, onSignedCallback)
        } catch (error) {
          xcmTransferBuilderManager.disconnect(polkadotTransferParams)
          handleSendError(
            sender,
            error,
            removeOngoingTransfer,
            addNotification,
            setStatus,
            event.txHash,
            polkadotTransferParams,
            swapParams,
          )
          reject(error instanceof Error ? error : new Error(String(error)))
        }
      },
      error: callbackError => {
        let enhancedError = callbackError
        if (callbackError instanceof InvalidTxError) {
          enhancedError = new Error(`InvalidTxError - Transaction validation failed: ${callbackError.message}`, {
            cause: callbackError,
          })
        }
        xcmTransferBuilderManager.disconnect(polkadotTransferParams)
        handleSendError(
          sender,
          enhancedError,
          removeOngoingTransfer,
          addNotification,
          setStatus,
          transferToStore.id,
          polkadotTransferParams,
          swapParams,
        )
        reject(enhancedError instanceof Error ? enhancedError : new Error(String(enhancedError)))
      },
      complete: () => {
        console.log('The transaction is complete')
      },
    })
  })
}

const getPolkadotTransferParams = (params: TransferParams, depositAddress: string): TransferParams => {
  return {
    ...params,
    recipient: depositAddress,
    destinationChain: params.sourceChain,
  } satisfies TransferParams
}

const verifyPolkadotTransfer = async (params: TransferParams): Promise<void> => {
  const dryRun = await xcmTransferBuilderManager.dryRun(params)
  if (!dryRun.origin.success) throw new Error(`DryRun failed: ${dryRun.origin.failureReason}`)
}

const verifyDotExistentialDeposit = async (params: TransferParams): Promise<void> => {
  if (params.sourceToken.id === PolkadotTokens.DOT.id) {
    // Convert ED number to BigInt
    const ASSET_HUB_DOT_EXISTENTIAL_DEPOSIT = 0.01 // DOT
    const assethubEd: bigint = convertAmount(ASSET_HUB_DOT_EXISTENTIAL_DEPOSIT, params.sourceToken)

    const originFees = await xcmTransferBuilderManager.getOriginXcmFee(params)
    if (!originFees.fee) throw new Error('Origin fees not found when verifying existential deposit')

    const isExistentialDepositMet = params.sourceAmount - originFees.fee >= assethubEd
    // TO DO: Replace the code above with the code below after we bump PS SDK to v11
    // const isExistentialDepositMet = await xcmTransferBuilderManager.isExistentialDepositMetAfterTransfer(params)
    if (!isExistentialDepositMet) throw new Error('Existential deposit will not be met.')
  }
}

const handlePolkadotTxEvents = async (
  event: TxEvent,
  addOrUpdate: (transfer: StoredTransfer) => void,
  transferToStore: StoredTransfer,
  resolve: (value?: unknown) => void,
  onComplete?: () => void,
): Promise<void> => {
  if (event.type === 'signed') {
    await addToOngoingTransfers(
      {
        ...transferToStore,
        id: event.txHash,
      },
      addOrUpdate,
      onComplete,
    )
  }

  const onchainEvents = extractPapiEvent(event)
  if (!onchainEvents) return

  if (!onchainEvents.isExtrinsicSuccess) throw new Error('Can not swap tokens. Extrinsic failed.')

  addOrUpdate({
    ...transferToStore,
    id: event.txHash,
    finalizedAt: new Date(),
  })
  resolve()
}

const handleSendError = (
  sender: Sender,
  e: unknown,
  removeOngoingTransfer: (id: string) => void,
  addNotification: (notification: Omit<Notification, 'id'>) => void,
  setStatus: (status: Status) => void,
  txId?: string,
  polkadotTransferParams?: TransferParams,
  swapParams?: TransferParams,
) => {
  setStatus('Idle')
  const cancelledByUser = txWasCancelled(sender, e)
  const error = e instanceof Error ? e : new Error(String(e))
  const message = cancelledByUser ? 'Transfer rejected' : error.message || 'Failed to submit the transfer'

  if (txId) removeOngoingTransfer(txId)
  if (!cancelledByUser)
    captureException(e, {
      level: 'error',
      extra: {
        sender,
        ...(txId && { txId }),
        ...(polkadotTransferParams && { polkadotTransferParams }),
        ...(swapParams && { swapParams }),
        error,
        errorCause: error.cause,
      },
    })

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

export default useChainflipApi
