import { useQueryClient } from '@tanstack/react-query'
import { type Chain, Ethereum } from '@velocitylabs-org/turtle-registry'
import { type Account, type Address, erc20Abi, type PublicClient, type WalletClient } from 'viem'
import { usePublicClient, useSwitchChain, useWalletClient } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { NotificationSeverity } from '@/models/notification'
// import type { StoredTransfer } from '@/models/transfer'
import { Direction, resolveDirection } from '@/services/transfer'
import { useChainflipStore } from '@/store/chainflipStore'
import { truncateAddress } from '@/utils/address'
import { type ChainflipQuote, getDepositAddress, getRequiredBlockConfirmation } from '@/utils/chainflip'
import useNotification from './useNotification'
// import useOngoingTransfers from './useOngoingTransfers'
import type { Status, TransferParams } from './useTransfer'

const useChainflipApi = () => {
  const { getCachedQuote, fetchNewQuote } = useChainflipStore()
  const { addNotification } = useNotification()
  const publicClient = usePublicClient()
  // const { addOrUpdate } = useOngoingTransfers()
  const qClient = useQueryClient()
  const { switchChainAsync } = useSwitchChain()
  const { data: walletClient } = useWalletClient()

  const transfer = async (params: TransferParams, setStatus: (status: Status) => void) => {
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
      // fees,
      // bridgingFee,
    } = params

    const queryParams = {
      sourceChain,
      destinationChain,
      sourceToken: sourceToken,
      destinationToken: destinationToken,
      amount: sourceAmount.toString(),
    }

    try {
      setStatus('Loading')
      // Get cached quote from store
      let chainflipQuote = getCachedQuote(qClient, queryParams)
      // Fetch a new quote if not cached quote are found
      if (!chainflipQuote) chainflipQuote = await fetchNewQuote(qClient, queryParams)
      if (!chainflipQuote) throw new Error('No Chainflip quote available')

      // Get chainflip deposit address
      const depositPayload = await getDepositAddress(chainflipQuote, sender.address, recipient)
      if (!depositPayload) throw new Error('Failed to generated the deposit address')
      const depositAddress = depositPayload.depositAddress as Address
      const srcTokenContractAddress = sourceToken.address as Address

      addNotification({
        message: `Deposit channel opened: ${truncateAddress(depositAddress, 4, 4)}`,
        severity: NotificationSeverity.Success,
        dismissible: true,
      })

      setStatus('Validating')
      let txHash: `0x${string}` | undefined

      const direction = resolveDirection(sourceChain, destinationChain)
      switch (direction) {
        case Direction.ToPolkadot: {
          await enforceSourceChain(walletClient, sourceChain)

          const requiredBlockConfirmation = await getRequiredBlockConfirmation(chainflipQuote.destAsset.chain)

          txHash = await submitTransfer(
            chainflipQuote,
            publicClient,
            walletClient,
            srcTokenContractAddress,
            depositAddress,
            requiredBlockConfirmation,
            setStatus,
          )
          break
        }
        case Direction.ToEthereum: {
          //TODO: Implement ToEthereum
          break
        }

        default:
          throw new Error('Unsupported chainflip flow')
      }
      onComplete?.()
      if (!txHash) throw new Error('Transaction hash not found - Transfer failed')

      // const senderAddress = await getSenderAddress(sender)
      // const date = new Date()

      // addOrUpdate({
      //   id: txHash.toString(),
      //   sourceChain,
      //   sourceToken,
      //   destinationToken,
      //   sourceTokenUSDValue: 0,
      //   sender: senderAddress,
      //   destChain: destinationChain,
      //   sourceAmount: sourceAmount.toString(),
      //   recipient,
      //   date,
      //   fees,
      //   bridgingFee,
      //   uniqueTrackingId: depositPayload.depositChannelId,
      // } satisfies StoredTransfer)

      // trackTransferMetrics({
      //   transferParams: params,
      //   txId: txHash,
      //   senderAddress,
      //   sourceTokenUSDValue,
      //   destinationTokenUSDValue,
      //   date,
      // })
    } catch (e) {
      console.log('error', e)
      // handleSendError(params.sender, e, setStatus)
    } finally {
      setStatus('Idle')
    }
  }

  const enforceSourceChain = async (walletClient: WalletClient, sourceChain: Chain): Promise<void> => {
    if (walletClient.chain?.id !== mainnet.id && sourceChain.uid === Ethereum.uid) {
      await switchChainAsync({ chainId: mainnet.id })
    }
  }

  return { transfer }
}

export default useChainflipApi

const submitTransfer = async (
  chainflipQuote: ChainflipQuote,
  publicClient: PublicClient,
  walletClient: WalletClient,
  sourceTokenAddress: Address,
  depositAddress: Address,
  requiredBlockConfirmation: number | null,
  setStatus: (status: Status) => void,
): Promise<`0x${string}`> => {
  // ETH TRANSFER
  if (chainflipQuote.srcAsset.asset === 'ETH') {
    // Dry run via simulateCalls
    await publicClient.simulateCalls({
      account: walletClient.account,
      calls: [
        {
          to: depositAddress,
          value: BigInt(chainflipQuote.depositAmount),
        },
      ],
    })

    // Dry run via estimateGas
    await publicClient.estimateGas({
      account: walletClient.account,
      to: depositAddress,
      value: BigInt(chainflipQuote.depositAmount),
    })

    setStatus('Sending')
    const txHash = await walletClient.sendTransaction({
      account: walletClient.account as Account,
      chain: walletClient.chain,
      to: depositAddress,
      value: BigInt(chainflipQuote.depositAmount),
    })

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
    args: [depositAddress, BigInt(chainflipQuote.depositAmount)],
  })

  setStatus('Sending')
  const txHash = await walletClient.writeContract(dryRun.request)

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
    confirmations: requiredBlockConfirmation ?? 0,
  })
  if (!receipt) {
    throw Error(`Transaction ${txHash} not included`)
  }
  return txHash
}
