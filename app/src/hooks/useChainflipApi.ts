import { captureException } from '@sentry/nextjs'
import { useQueryClient } from '@tanstack/react-query'
import { type Chain, Ethereum, PolkadotTokens } from '@velocitylabs-org/turtle-registry'
import { InvalidTxError, type TxEvent } from 'polkadot-api'
import { type Account, type Address, erc20Abi, type PublicClient, type WalletClient } from 'viem'
import { usePublicClient, useSwitchChain, useWalletClient } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { type Notification, NotificationSeverity } from '@/models/notification'
import type { StoredTransfer } from '@/models/transfer'
import { getCachedTokenPrice } from '@/services/balance'
import xcmTransferBuilderManager from '@/services/paraspell/xcmTransferBuilder'
import { Direction, resolveDirection } from '@/services/transfer'
import { useChainflipStore } from '@/store/chainflipStore'
import type { SubstrateAccount } from '@/store/substrateWalletStore'
import { getChainSpecificAddress, getSenderAddress, truncateAddress } from '@/utils/address'
import { type ChainflipQuote, getDepositAddress, getRequiredBlockConfirmation } from '@/utils/chainflip'
import { extractPapiEvent, getPolkadotSigner } from '@/utils/papi'
import { convertAmount, txWasCancelled } from '@/utils/transfer'
import { addToOngoingTransfers } from '@/utils/transferTracking'
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
  const { data: walletClient } = useWalletClient()

  const enforceSourceChain = async (walletClient: WalletClient, sourceChain: Chain): Promise<void> => {
    if (walletClient.chain?.id !== mainnet.id && sourceChain.uid === Ethereum.uid) {
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
      sourceAmount,
      sender,
      recipient,
      onComplete,
      fees,
      bridgingFee,
    } = params

    try {
      setStatus('Loading')
      const chainflipQuote = await getChainflipStoredQuote(qClient, params)

      // Get chainflip deposit address
      const depositPayload = await getDepositAddress(chainflipQuote, sender.address, recipient)
      if (!depositPayload) throw new Error('Failed to generate the deposit address')

      addNotification({
        message: `Deposit channel opened: ${truncateAddress(depositPayload.depositAddress, 4, 4)}`,
        severity: NotificationSeverity.Success,
        dismissible: true,
      })

      setStatus('Validating')
      let txHash: string | undefined

      const direction = resolveDirection(sourceChain, destinationChain)
      switch (direction) {
        case Direction.ToPolkadot: {
          const depositAddress = depositPayload.depositAddress as Address
          const srcTokenContractAddress = sourceToken.address as Address
          await enforceSourceChain(walletClient, sourceChain)

          const requiredBlockConfirmation = await getRequiredBlockConfirmation(chainflipQuote.destAsset.chain)

          txHash = await submitEthereumTransfer(
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
          const date = new Date()

          addOrUpdate({
            id: txHash.toString(),
            sourceChain,
            sourceToken,
            destinationToken: destinationToken,
            sourceTokenUSDValue,
            sender: senderAddress,
            destChain: destinationChain,
            sourceAmount: sourceAmount.toString(),
            recipient,
            date,
            fees,
            bridgingFee,
            uniqueTrackingId: depositPayload.depositChannelId,
          } satisfies StoredTransfer)

          onComplete?.()
          setStatus('Idle')

          // trackTransferMetrics({
          //   transferParams: params,
          //   txId: txHash,
          //   senderAddress,
          //   sourceTokenUSDValue,
          //   destinationTokenUSDValue,
          //   date,
          // })
          break
        }
        case Direction.ToEthereum: {
          const swapParams = params
          const depositAddress = depositPayload.depositAddress
          const polkadotTransferParams = getPolkadotTransferParams(swapParams, depositAddress)
          await verifyPolkadotTransfer(polkadotTransferParams)
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

const submitEthereumTransfer = async (
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
  const { sourceChain, sourceToken, sender, destinationToken, sourceAmount, bridgingFee, fees, onComplete } =
    polkadotTransferParams
  const { destinationChain, recipient } = swapParams

  // Here we create the unsigned transaction with Paraspell Builder
  const unsignedTx = await xcmTransferBuilderManager.createTransferTx(polkadotTransferParams)

  const polkadotSigner = getPolkadotSigner(swapParams.sender as SubstrateAccount)
  const senderAddress = await getSenderAddress(sender)
  const formattedSenderAddress = getChainSpecificAddress(senderAddress, sourceChain)
  const sourceTokenUSDValue = (await getCachedTokenPrice(sourceToken))?.usd ?? 0
  const date = new Date()

  const transferToStore = {
    id: '',
    sourceChain,
    sourceToken,
    destinationToken,
    sourceTokenUSDValue,
    sender: formattedSenderAddress,
    // We use the final destinationChain from the swapParams (ex: ETH)
    // not the polkadotTransferParams.destinationChain (ex: AssetHub)
    destChain: destinationChain,
    sourceAmount: sourceAmount.toString(),
    // We use the final recipient from the swapParams (ex: ETH)
    // not the chainflip deposit address
    recipient: recipient,
    date,
    bridgingFee,
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
          transferToStore.id = event.txHash?.toString()

          const onSignedCallback = () => {
            onComplete?.()
            setStatus('Idle')
            // trackTransferMetrics({
            //   transferParams: params,
            //   txId: event.txHash?.toString(),
            //   senderAddress,
            //   sourceTokenUSDValue,
            //   destinationTokenUSDValue,
            //   date,
            // })
            xcmTransferBuilderManager.disconnect(polkadotTransferParams)
          }
          await handlePolkadotTxEvents(event, addOrUpdate, transferToStore, resolve, onSignedCallback)
        } catch (error) {
          xcmTransferBuilderManager.disconnect(polkadotTransferParams)
          handleSendError(sender, error, removeOngoingTransfer, addNotification, setStatus, event.txHash?.toString())
          reject(error instanceof Error ? error : new Error(String(error)))
        }
      },
      error: callbackError => {
        let enhancedError = callbackError
        if (callbackError instanceof InvalidTxError) {
          enhancedError = new Error(`InvalidTxError - Transaction validation failed: ${callbackError.error}`)
        }
        xcmTransferBuilderManager.disconnect(polkadotTransferParams)
        handleSendError(sender, enhancedError, removeOngoingTransfer, addNotification, setStatus)
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
        id: event.txHash.toString(),
      },
      addOrUpdate,
      onComplete,
    )
  }

  const onchainEvents = extractPapiEvent(event)
  if (!onchainEvents) return
  console.log('isExtrinsicSuccess:', onchainEvents.isExtrinsicSuccess)

  if (!onchainEvents.isExtrinsicSuccess) {
    throw new Error('Can not swap tokens. Extrinsic failed.')
  }

  addOrUpdate({
    ...transferToStore,
    id: event.txHash.toString(),
    status: `Arriving at ${transferToStore.destChain.name}`,
    finalizedAt: new Date(),
  })
  console.log('resolve promise')
  resolve()
}

const handleSendError = (
  sender: Sender,
  e: unknown,
  removeOngoingTransfer: (id: string) => void,
  addNotification: (notification: Omit<Notification, 'id'>) => void,
  setStatus: (status: Status) => void,
  txId?: string,
) => {
  setStatus('Idle')
  const cancelledByUser = txWasCancelled(sender, e)
  const error = e instanceof Error ? e : new Error(String(e))
  const message = cancelledByUser ? 'Transfer rejected' : error.message || 'Failed to submit the transfer'

  if (txId) removeOngoingTransfer(txId)
  if (!cancelledByUser) captureException(e)

  addNotification({
    message,
    severity: NotificationSeverity.Error,
  })

  // if (txId) {
  //   updateTransferMetrics({
  //     txHashId: txId,
  //     status: TxStatus.Failed,
  //   })
  // }
}

export default useChainflipApi
