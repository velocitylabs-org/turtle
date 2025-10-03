import type { TLocation } from '@paraspell/sdk'
import { captureException } from '@sentry/react'
import {
  ArbitrumTokens,
  type Chain,
  EthereumTokens,
  getTokenByLocation,
  isSameToken,
  PolkadotTokens,
  type Token,
} from '@velocitylabs-org/turtle-registry'
import { useCallback, useEffect, useState } from 'react'
import { encodeFunctionData, erc20Abi, type PublicClient, parseEther, parseUnits, type WalletClient } from 'viem'
import { usePublicClient, useWalletClient } from 'wagmi'
import { useChainflipQuote } from '@/hooks/useChainflipQuote'
import useNotification from '@/hooks/useNotification'
import type { Sender } from '@/hooks/useTransfer'
import { getParaSpellChain, getTokenFromSymbol, mapParaspellChainToTurtleRegistry } from '@/lib/paraspell/transfer'
import { getFeeEstimate } from '@/lib/snowbridge'
import { NotificationSeverity } from '@/models/notification'
import type { FeeDetails } from '@/models/transfer'
import { getCachedTokenPrice } from '@/services/balance'
import xcmRouterBuilderManager from '@/services/paraspell/xcmRouterBuilder.ts'
import xcmTransferBuilderManager from '@/services/paraspell/xcmTransferBuilder'
import { chainflipToRegistryChain, getFeeLabelFromType, getFeeTokenFromAssetSymbol } from '@/utils/chainflip'
import { resolveSdk } from '@/utils/routes'
import { Direction, isSwap, safeConvertAmount, toHuman } from '@/utils/transfer'
import useBalance from './useBalance'
import useSnowbridgeContext from './useSnowbridgeContext'

// NOTE: when bridging from Parachain -> Ethereum, we have the local execution fees + the bridging fees.
// When bridging from AssetHub, the basic fees already take the bridging fees into account.
// NOTE: when bridging from Parachain -> Ethereum, we have the local execution fees + the bridging fees.
// When bridging from AssetHub, the basic fees already take the bridging fees into account.

interface UseFeesParams {
  sourceChain: Chain | null
  destinationChain?: Chain | null
  sourceToken?: Token | null
  sourceTokenAmount?: number | null
  sender?: Sender | undefined
  recipientAddress?: string
  destinationToken?: Token | null
  sourceTokenAmountError?: string | null
  transferableAmount: bigint | null
}

export default function useFees(params: UseFeesParams) {
  const {
    sourceChain,
    destinationChain,
    sourceToken,
    destinationToken,
    sourceTokenAmount,
    sender,
    recipientAddress,
    sourceTokenAmountError,
    transferableAmount,
  } = params
  const [fees, setFees] = useState<FeeDetails[] | null>(null)
  // Indicates whether the source token balance is enough to cover both fees and transfer amount
  const [isBalanceSufficientForFees, setIsBalanceSufficientForFees] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const { snowbridgeContext, isSnowbridgeContextLoading, snowbridgeContextError } = useSnowbridgeContext()
  const { addNotification } = useNotification()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const senderAddress = sender?.address

  // Determine if we need ETH balance (only for SnowbridgeApi case)
  const sdk =
    sourceChain && destinationChain ? resolveSdk(sourceChain, destinationChain, sourceToken, destinationToken) : null
  const isSnowbridgeRoute = sdk === 'SnowbridgeApi'

  // Only fetch ETH balance when using SnowbridgeApi
  // useBalance handles undefined values gracefully by returning early
  const { balance: ethBalance } = useBalance({
    chain: isSnowbridgeRoute ? sourceChain : undefined,
    token: isSnowbridgeRoute ? EthereumTokens.ETH : undefined,
    address: isSnowbridgeRoute ? senderAddress : undefined,
  })

  const { chainflipQuote, isChainflipQuoteError } = useChainflipQuote({
    sourceChain,
    destinationChain,
    sourceToken: sourceToken,
    destinationToken: destinationToken,
    amount: safeConvertAmount(sourceTokenAmount, sourceToken)?.toString() ?? '0',
  })

  const fetchFees = useCallback(async () => {
    if (
      !sourceChain ||
      !destinationChain ||
      !sourceToken ||
      !destinationToken ||
      !sourceTokenAmount ||
      !senderAddress ||
      !recipientAddress ||
      sourceTokenAmountError
    ) {
      setFees(null)
      setIsBalanceSufficientForFees(true)
      return
    }

    if (!sdk) throw new Error('Route not supported')

    try {
      switch (sdk) {
        case 'ParaSpellApi': {
          setLoading(true)
          setIsBalanceSufficientForFees(true)
          const sourceChainNode = getParaSpellChain(sourceChain)
          if (!sourceChainNode) throw new Error('Source chain id not found')

          const destinationChainNode = getParaSpellChain(destinationChain)
          if (!destinationChainNode) throw new Error('Destination chain id not found')

          const isTokenSwap = !isSameToken(sourceToken, destinationToken)
          const sourceAmount = safeConvertAmount(sourceTokenAmount, sourceToken)!
          const commonParams = {
            sourceChain,
            destinationChain,
            sourceToken,
            sourceAmount,
            sender,
            recipient: recipientAddress,
          }

          // Get XCM fees based on operation type (swap vs transfer)
          const xcmFee = isTokenSwap
            ? await xcmRouterBuilderManager.getXcmFee({
                ...commonParams,
                destinationToken,
              })
            : await xcmTransferBuilderManager.getXcmFee(commonParams)

          // NOTE: 'sufficient' may be undefined when chains lack dry-run support, preventing fee/success validation.
          // - Present: reliable sufficiency indicator
          // - Missing: defaults to true, but user proceeds at own risk
          const origin: FeeDetails[] = []
          if (hasParaspellFee(xcmFee.origin)) {
            const originFee = xcmFee.origin
            const originToken = getToken(originFee.asset.location, originFee.asset.symbol)
            origin.push({
              title: 'Execution fees',
              chain: sourceChain,
              sufficient:
                originFee.sufficient === undefined
                  ? 'undetermined'
                  : originFee.sufficient
                    ? 'sufficient'
                    : 'insufficient',
              amount: {
                amount: originFee.fee,
                token: originToken,
                inDollars: await getTokenAmountInDollars(originToken, originFee.fee),
              },
            })
          }

          const destination: FeeDetails[] = []
          if (hasParaspellFee(xcmFee.destination)) {
            const destinationFee = xcmFee.destination
            const destinationToken = getToken(destinationFee.asset.location, destinationFee.asset.symbol)
            destination.push({
              title: 'Delivery fees',
              chain: destinationChain,
              sufficient:
                destinationFee.sufficient === undefined
                  ? 'undetermined'
                  : destinationFee.sufficient
                    ? 'sufficient'
                    : 'insufficient',
              amount: {
                amount: destinationFee.fee,
                token: destinationToken,
                inDollars: await getTokenAmountInDollars(destinationToken, destinationFee.fee),
              },
            })
          }

          const intermediate: FeeDetails[] = []
          if (xcmFee.hops.length > 0) {
            const isSwapping = isSwap({ sourceToken, destinationToken })
            for (const hop of xcmFee.hops) {
              const hopFee = hop.result
              if (hasParaspellFee(hopFee)) {
                const hopToken = getToken(hopFee.asset.location, hopFee.asset.symbol)
                const hopFeeDetailItem: FeeDetails = {
                  title: isSwapping ? 'Swap fees' : 'Routing fees',
                  chain: mapParaspellChainToTurtleRegistry(hop.chain),
                  sufficient:
                    hopFee.sufficient === undefined
                      ? 'undetermined'
                      : hopFee.sufficient
                        ? 'sufficient'
                        : 'insufficient',
                  amount: {
                    amount: hopFee.fee,
                    token: hopToken,
                    inDollars: await getTokenAmountInDollars(hopToken, hopFee.fee),
                  },
                }
                intermediate.push(hopFeeDetailItem)
              }
            }
          }

          const feeList: FeeDetails[] = [...origin, ...intermediate, ...destination]
          setFees(feeList)
          const sourceAmountBigInt = safeConvertAmount(sourceTokenAmount, sourceToken) ?? 0n

          Promise.all([
            // Get max-transferable amount
            transferableAmount ||
              xcmTransferBuilderManager.getTransferableAmount({
                sourceChain,
                destinationChain,
                sourceToken,
                sourceAmount: safeConvertAmount(sourceTokenAmount, sourceToken)!,
                sender,
                recipient: recipientAddress,
              }),
            // Get min-transferable amount
            xcmTransferBuilderManager.getMinTransferableAmount({
              sourceChain,
              destinationChain,
              sourceToken,
              sourceAmount: safeConvertAmount(sourceTokenAmount, sourceToken)!,
              sender,
              recipient: recipientAddress,
            }),
          ])
            .then(([maxTransferableAmount, minTransferableAmount]) => {
              // @ts-ignore NOTE: when minTransferableAmount is 0, it means that the user has no balance to cover the transfer
              if (minTransferableAmount === 0) {
                setIsBalanceSufficientForFees(false)
                return
              }

              let isSufficient = true
              if (maxTransferableAmount) {
                isSufficient = isSufficient && sourceAmountBigInt <= maxTransferableAmount
              }
              if (minTransferableAmount) {
                isSufficient = isSufficient && sourceAmountBigInt >= minTransferableAmount
              }
              setIsBalanceSufficientForFees(isSufficient)
            })
            .catch(error => {
              console.error('Error checking transferable amounts:', error)
            })

          break
        }

        case 'SnowbridgeApi': {
          if (!sourceChain || !senderAddress || !destinationChain || !sourceTokenAmount || !recipientAddress) {
            setLoading(false)
            setFees(null)
            return
          }

          setLoading(true)
          setIsBalanceSufficientForFees(true)
          if (isSnowbridgeContextLoading) {
            setFees(null)
            return
          }

          if (!snowbridgeContext || snowbridgeContextError)
            throw snowbridgeContextError ?? new Error('Snowbridge context undefined')

          // fee.origin is always 'Ethereum' and Direction.ToPolkadot, since we use Paraspell for direction 'ToEthereum'
          const snowbridgeFees = await getFeeEstimate(
            sourceToken,
            sourceChain,
            destinationChain,
            Direction.ToPolkadot,
            snowbridgeContext,
            senderAddress,
            recipientAddress,
            sourceTokenAmount,
          )
          if (!snowbridgeFees || snowbridgeFees.origin !== 'Ethereum') {
            throw new Error('getFeeEstimate could not run successfully')
          }

          // Check if this is an insufficient funds error where the amount is not enough to cover both the transfer fees and the requested amount
          if ('error' in snowbridgeFees && snowbridgeFees.error === 'INSUFFICIENT_FUNDS') {
            setFees(null)
            setIsBalanceSufficientForFees(false)
            return
          }

          const feeList: FeeDetails[] = []
          const ethBalanceAmount = ethBalance?.value ?? 0n
          const sourceAmount = safeConvertAmount(sourceTokenAmount, sourceToken)!
          const sourceEthAmount = sourceToken.id === EthereumTokens.ETH.id ? sourceAmount : 0n
          let executionAmount: bigint = 0n
          let bridgingAmount: bigint = 0n

          if ('execution' in snowbridgeFees && snowbridgeFees.execution) {
            // Execution fees are in ETH
            executionAmount = BigInt(snowbridgeFees.execution.amount ?? 0n)
            const execution: FeeDetails = {
              title: 'Execution fees',
              chain: sourceChain,
              sufficient: sourceEthAmount + executionAmount < ethBalanceAmount ? 'sufficient' : 'insufficient',
              amount: {
                amount: snowbridgeFees.execution.amount,
                token: snowbridgeFees.execution.token,
                inDollars: snowbridgeFees.execution.inDollars,
              },
            }
            feeList.push(execution)
          }

          if ('bridging' in snowbridgeFees && snowbridgeFees.bridging) {
            // Bridging fees are in ETH
            bridgingAmount = BigInt(snowbridgeFees.bridging.amount ?? 0n)
            const bridging: FeeDetails = {
              title: 'Bridging fees',
              chain: sourceChain,
              sufficient:
                sourceEthAmount + bridgingAmount + executionAmount < ethBalanceAmount ? 'sufficient' : 'insufficient',
              amount: {
                amount: snowbridgeFees.bridging.amount,
                token: snowbridgeFees.bridging.token,
                inDollars: snowbridgeFees.bridging.inDollars,
              },
            }
            feeList.push(bridging)
          }

          setFees(feeList)
          const isSufficient = sourceEthAmount + bridgingAmount + executionAmount < ethBalanceAmount // Check if the balance is enough for all fees
          setIsBalanceSufficientForFees(isSufficient)

          break
        }

        case 'ChainflipApi': {
          if (!chainflipQuote || isChainflipQuoteError) {
            setFees(null)
            setIsBalanceSufficientForFees(true)
            return
          }
          setLoading(true)

          const isEvmNetwork = sourceChain.network === 'Ethereum' || sourceChain.network === 'Arbitrum'

          const chainflipfeeList: FeeDetails[] = await Promise.all(
            chainflipQuote.includedFees.map(async fee => {
              // unexported Chainflip swapFee type {type: ChainflipFeeType, amount: string, asset: AssetSymbol, chain: ChainflipChain}
              const token = getFeeTokenFromAssetSymbol(fee.asset, fee.chain)
              const feeTokenInDollars = (await getCachedTokenPrice(token))?.usd ?? 0
              return {
                title: getFeeLabelFromType(fee.type),
                chain: chainflipToRegistryChain(fee.chain),
                // Chainflip handles fees for the user, so we can assume safely that the balance is sufficient
                sufficient: 'sufficient',
                amount: {
                  amount: fee.amount,
                  token: token,
                  inDollars: feeTokenInDollars ? toHuman(fee.amount, token) * feeTokenInDollars : 0,
                },
              }
            }),
          )

          const feeList: FeeDetails[] = [...chainflipfeeList]

          if (sourceChain.network === 'Polkadot') {
            const localTransferFeeToken = PolkadotTokens.DOT
            const feeTokenInDollars = (await getCachedTokenPrice(localTransferFeeToken))?.usd ?? 0
            const localTransferParams = {
              sourceChain,
              destinationChain: sourceChain, // Local transfer to AH
              sourceToken,
              sourceAmount: safeConvertAmount(sourceTokenAmount, sourceToken)!,
              sender,
              recipient: senderAddress, // Recipient here must be a placeholder address so we use the sender address
            }

            const networkFee = await xcmTransferBuilderManager.getOriginXcmFee(localTransferParams)
            if (!networkFee.fee) throw new Error('ChainflipApi Local transfer fee not found')

            feeList.unshift({
              title: 'Transfer fees',
              chain: sourceChain,
              sufficient: networkFee.sufficient ? 'sufficient' : 'insufficient',
              amount: {
                amount: networkFee.fee,
                token: localTransferFeeToken,
                inDollars: feeTokenInDollars ? toHuman(networkFee.fee, localTransferFeeToken) * feeTokenInDollars : 0,
              },
            })
          }

          if (isEvmNetwork) {
            if (!publicClient || !walletClient) throw new Error('Public client or wallet client not found')

            const { estimatedGasFee: networkFee, isBalanceSufficient } = await getEip1559NetworkFee(
              publicClient,
              walletClient,
              senderAddress as `0x${string}`,
              sourceToken,
              sourceTokenAmount,
            )

            const feeToken = EthereumTokens.ETH
            const feeTokenInDollars = (await getCachedTokenPrice(feeToken))?.usd ?? 0

            feeList.unshift({
              title: 'Transfer fees',
              chain: sourceChain,
              sufficient: isBalanceSufficient ? 'sufficient' : 'insufficient',
              amount: {
                amount: networkFee,
                token: feeToken,
                inDollars: feeTokenInDollars ? toHuman(networkFee, feeToken) * feeTokenInDollars : 0,
              },
            })
          }

          setFees(feeList)
          break
        }

        default:
          throw new Error('Unsupported direction')
      }
    } catch (error) {
      setFees(null)
      captureException(error, {
        extra: {
          error,
          sourceToken: sourceToken?.id,
          sourceChain: sourceChain?.uid,
          destinationToken: destinationToken?.id,
          destinationChain: destinationChain?.uid,
          sourceTokenAmount,
        },
        tags: {
          hook: 'useFees',
          sdk,
        },
      })
      console.error('useFees > error is', error)
      addNotification({
        severity: NotificationSeverity.Error,
        message: 'Failed to fetch the fees. Please try again later.',
        dismissible: true,
      })
    } finally {
      setLoading(false)
    }
  }, [
    sourceChain,
    destinationChain,
    sourceToken,
    chainflipQuote,
    isChainflipQuoteError,
    snowbridgeContext,
    addNotification,
    senderAddress,
    recipientAddress,
    sourceTokenAmount,
    destinationToken,
    isSnowbridgeContextLoading,
    snowbridgeContextError,
    sender,
    ethBalance,
    sdk,
    sourceTokenAmountError,
    transferableAmount,
    walletClient,
    publicClient,
  ])

  useEffect(() => {
    fetchFees()
  }, [fetchFees])

  // biome-ignore lint/correctness/useExhaustiveDependencies: We need fees to be in this array of dependencies
  useEffect(() => {
    if (sourceTokenAmountError) {
      setFees(null)
      setLoading(false)
      setIsBalanceSufficientForFees(true)
    }
  }, [fees, sourceTokenAmountError])

  return { fees, isBalanceSufficientForFees, loading, refetch: fetchFees }
}

async function getTokenAmountInDollars(token: Token, amount: bigint): Promise<number> {
  try {
    const tokenPrice = (await getCachedTokenPrice(token))?.usd ?? 0
    return tokenPrice ? toHuman(amount, token) * tokenPrice : 0
  } catch {
    return 0
  }
}

// Checks if a Paraspell fee item has actual fees to be paid
function hasParaspellFee(feeItem: { feeType: string; fee: bigint } | undefined): boolean {
  return feeItem !== undefined && feeItem.feeType !== 'noFeeRequired' && feeItem.fee !== 0n
}

/**
 * Estimates the network fee for an Ethereum transfer in Chainflip swaps.
 * It's based on the EIP-1559 standard.
 * Supports both native ETH and ERC-20 (USDC/USDT) transfers, and verifies balance sufficiency.
 */
const getEip1559NetworkFee = async (
  publicClient: PublicClient,
  walletClient: WalletClient,
  senderAddress: `0x${string}`,
  sourceToken: Token,
  sourceTokenAmount: number,
): Promise<{ estimatedGasFee: bigint; isBalanceSufficient: boolean }> => {
  const isEvmToken = sourceToken.id === EthereumTokens.ETH.id || sourceToken.id === ArbitrumTokens.ETH.id
  let gas: bigint

  if (isEvmToken) {
    gas = await publicClient.estimateGas({
      account: walletClient.account,
      to: senderAddress, // Recipient here must be a placeholder address so we use the sender address
      value: parseEther(sourceTokenAmount.toString()),
    })
  } else {
    const data = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [senderAddress, parseUnits(sourceTokenAmount.toString(), sourceToken.decimals)],
    })

    gas = await publicClient.estimateGas({
      account: walletClient.account,
      to: sourceToken.address as `0x${string}`, // Token smart contract address
      data: data,
    })
  }

  const gasPrice = await publicClient.getGasPrice()
  const estimatedGasFee = gas * gasPrice
  const isBalanceSufficient = await checkEip1559BalanceSufficiency(
    publicClient,
    sourceToken,
    gas,
    gasPrice,
    sourceTokenAmount,
    senderAddress,
  )
  return { estimatedGasFee, isBalanceSufficient }
}

/**
 * Checks the balance sufficiency for an Ethereum transfer in Chainflip swaps.
 * It's based on the EIP-1559 standard.
 * Supports both native ETH and ERC-20 (USDC/USDT) transfers.
 */
const checkEip1559BalanceSufficiency = async (
  publicClient: PublicClient,
  sourceToken: Token,
  gas: bigint,
  gasPrice: bigint,
  sourceTokenAmount: number,
  address: `0x${string}`,
): Promise<boolean> => {
  const feesValues = await publicClient.estimateFeesPerGas()
  const maxFeePerGas = feesValues.maxFeePerGas ?? gasPrice
  const maxGasFee = gas * maxFeePerGas
  const ethBalance = await publicClient.getBalance({ address })
  const isEvmToken = sourceToken.id === EthereumTokens.ETH.id || sourceToken.id === ArbitrumTokens.ETH.id

  // ETH balance check
  if (isEvmToken) {
    const transferAmount = parseEther(sourceTokenAmount.toString())
    return ethBalance >= transferAmount + maxGasFee
  }

  // ERC-20 transfer: user must have ETH for gas
  if (ethBalance < maxGasFee) return false

  // ERC-20 token balance check
  const erc20Balance = await publicClient.readContract({
    address: sourceToken.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
  })

  return erc20Balance >= parseUnits(sourceTokenAmount.toString(), sourceToken.decimals)
}

function getToken(location: TLocation | undefined, symbol: string) {
  let token: Token | undefined
  if (location) {
    token = getTokenByLocation(location)
  }
  if (!token) {
    token = getTokenFromSymbol(symbol)
  }
  if (!token) {
    throw new Error(`Token not found for location ${JSON.stringify(location)} and symbol ${symbol}`)
  }
  return token
}
