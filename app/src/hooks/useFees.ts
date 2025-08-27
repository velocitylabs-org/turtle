import { captureException } from '@sentry/nextjs'
import { type Balance, type Chain, EthereumTokens, PolkadotTokens, type Token } from '@velocitylabs-org/turtle-registry'
import { useCallback, useEffect, useState } from 'react'
import useNotification from '@/hooks/useNotification'
import type { Sender } from '@/hooks/useTransfer'
import { NotificationSeverity } from '@/models/notification'
import type { FeeDetails } from '@/models/transfer'
import { getCachedTokenPrice } from '@/services/balance'
import xcmTransferBuilderManager from '@/services/paraspell/xcmTransferBuilder'
import { Direction } from '@/services/transfer'
import { getFeeLabelFromType, getFeeTokenFromAssetSymbol, toRegistryChain } from '@/utils/chainflip'
import { getParaSpellNode, mapParaspellChainToTurtleRegistry } from '@/utils/paraspellTransfer'
import { resolveSdk } from '@/utils/routes'
import { getFeeEstimate } from '@/utils/snowbridge'
import { isSwap, safeConvertAmount, toHuman } from '@/utils/transfer'
import useBalance from './useBalance'
import { useChainflipQuote } from './useChainflipQuote'
import useSnowbridgeContext from './useSnowbridgeContext'

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
  sourceTokenBalance?: Balance | undefined
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
    sourceTokenBalance,
    sourceTokenAmountError,
    transferableAmount,
  } = params
  const [fees, setFees] = useState<FeeDetails[] | null>(null)
  // Indicates whether the source token balance is enough to cover both fees and transfer amount
  const [isBalanceSufficientForFees, setIsBalanceSufficientForFees] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const { snowbridgeContext, isSnowbridgeContextLoading, snowbridgeContextError } = useSnowbridgeContext()
  const { addNotification } = useNotification()
  const senderAddress = sender?.address

  // Determine if we need ETH balance (only for SnowbridgeApi case)
  const sdk =
    sourceChain && destinationChain ? resolveSdk(sourceChain, destinationChain, sourceToken, destinationToken) : null
  const isSnowbridgeRoute = sdk === 'SnowbridgeApi'
  const isBridgingToEthereum = destinationChain?.network === 'Ethereum'

  // Only fetch ETH balance when using SnowbridgeApi
  // useBalance handles undefined values gracefully by returning early
  const { balance: ethBalance } = useBalance({
    chain: isSnowbridgeRoute ? sourceChain : undefined,
    token: isSnowbridgeRoute ? EthereumTokens.ETH : undefined,
    address: isSnowbridgeRoute ? senderAddress : undefined,
  })

  const { balance: dotBalance } = useBalance({
    chain: isBridgingToEthereum ? sourceChain : undefined,
    token: isBridgingToEthereum ? PolkadotTokens.DOT : undefined,
    address: isBridgingToEthereum ? senderAddress : undefined,
  })

  const { chainflipQuote, isLoadingChainflipQuote, isChainflipQuoteError } = useChainflipQuote({
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
          const sourceChainNode = getParaSpellNode(sourceChain)
          if (!sourceChainNode) throw new Error('Source chain id not found')

          const destinationChainNode = getParaSpellNode(destinationChain)
          if (!destinationChainNode) throw new Error('Destination chain id not found')

          const xcmFee = await xcmTransferBuilderManager.getXcmFee({
            sourceChain,
            destinationChain,
            sourceToken,
            sourceAmount: safeConvertAmount(sourceTokenAmount, sourceToken)!,
            sender,
            recipient: recipientAddress,
          })

          // NOTE: 'sufficient' may be undefined when chains lack dry-run support, preventing fee/success validation.
          // - Present: reliable sufficiency indicator
          // - Missing: defaults to true, but user proceeds at own risk
          const origin: FeeDetails[] = []
          if (hasParaspellFee(xcmFee.origin)) {
            const originToken = getTokenFromSymbol(xcmFee.origin.currency)
            origin.push({
              title: 'Execution fees',
              chain: sourceChain,
              sufficient:
                xcmFee.origin.sufficient === undefined
                  ? 'undetermined'
                  : xcmFee.origin.sufficient
                    ? 'sufficient'
                    : 'insufficient',
              amount: {
                amount: xcmFee.origin.fee,
                token: originToken,
                inDollars: await getTokenAmountInDollars(originToken, xcmFee.origin.fee),
              },
            })
          }

          const destination: FeeDetails[] = []
          if (hasParaspellFee(xcmFee.destination)) {
            const destinationToken = getTokenFromSymbol(xcmFee.destination.currency)
            destination.push({
              title: 'Delivery fees',
              chain: destinationChain,
              sufficient:
                xcmFee.destination.sufficient === undefined
                  ? 'undetermined'
                  : xcmFee.destination.sufficient
                    ? 'sufficient'
                    : 'insufficient',
              amount: {
                amount: xcmFee.destination.fee,
                token: destinationToken,
                inDollars: await getTokenAmountInDollars(destinationToken, xcmFee.destination.fee),
              },
            })
          }

          const isBridgeToEthereum = destinationChain.network === 'Ethereum'
          const intermediate: FeeDetails[] = []
          if (xcmFee.hops.length > 0) {
            const isSwapping = isSwap({ sourceToken, destinationToken })
            for (const hop of xcmFee.hops) {
              if (hasParaspellFee(hop.result)) {
                const hopToken = getTokenFromSymbol(hop.result.currency)
                const hopFeeDetailItem: FeeDetails = {
                  title: isBridgeToEthereum ? 'Bridging fees' : isSwapping ? 'Swap fees' : 'Routing fees',
                  chain: mapParaspellChainToTurtleRegistry(hop.chain),
                  sufficient:
                    hop.result.sufficient === undefined
                      ? 'undetermined'
                      : hop.result.sufficient
                        ? 'sufficient'
                        : 'insufficient',
                  amount: {
                    amount: hop.result.fee,
                    token: hopToken,
                    inDollars: await getTokenAmountInDollars(hopToken, hop.result.fee),
                  },
                }
                intermediate.push(hopFeeDetailItem)
              }
            }
          }

          const feeList: FeeDetails[] = [...origin, ...intermediate, ...destination]

          // NOTE: if dry run fails, it means that we don't have bridging fees in the fee list, so we need to add it manually (this is a way around while paraspell work on improving this)
          // The bridging fee when sending to Ethereum is paid in DOT
          if (destinationChain.network === 'Ethereum' && !feeList.find(fee => fee.title === 'Bridging fees')) {
            const bridgeFeeToken = PolkadotTokens.DOT
            const bridgeFeeTokenInDollars = (await getCachedTokenPrice(bridgeFeeToken))?.usd ?? 0
            const bridgeFee = await getCachedBridgingFee()
            const bridgeFeeInNumber = Number(toHuman(bridgeFee, bridgeFeeToken))
            const isSufficient = checkBalanceSufficiency(feeList, bridgeFeeToken, bridgeFeeInNumber, dotBalance)
            feeList.push({
              title: 'Bridging fees',
              chain: sourceChain,
              sufficient: !dotBalance ? 'undetermined' : isSufficient ? 'sufficient' : 'insufficient',
              amount: {
                amount: bridgeFee,
                token: bridgeFeeToken,
                inDollars: bridgeFeeInNumber * bridgeFeeTokenInDollars,
              },
            })
          }

          setFees(feeList)

          // Use the provided transferableAmount if available (from max button), otherwise calculate it
          let maxTransferableAmount = transferableAmount
          if (!maxTransferableAmount) {
            maxTransferableAmount = await xcmTransferBuilderManager.getTransferableAmount({
              sourceChain,
              destinationChain,
              sourceToken,
              sourceAmount: safeConvertAmount(sourceTokenAmount, sourceToken)!,
              sender,
              recipient: recipientAddress,
            })
          }

          if (maxTransferableAmount) {
            const sourceAmountBigInt = safeConvertAmount(sourceTokenAmount, sourceToken) ?? 0n
            const isSufficientForFees = sourceAmountBigInt <= maxTransferableAmount
            setIsBalanceSufficientForFees(isSufficientForFees)
          }

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

          if ('execution' in snowbridgeFees && snowbridgeFees.execution) {
            const executionAmount = BigInt(snowbridgeFees.execution.amount ?? 0n)
            const execution: FeeDetails = {
              title: 'Execution fees',
              chain: sourceChain,
              sufficient: executionAmount < ethBalanceAmount ? 'sufficient' : 'insufficient',
              amount: {
                amount: snowbridgeFees.execution.amount,
                token: snowbridgeFees.execution.token,
                inDollars: snowbridgeFees.execution.inDollars,
              },
            }
            feeList.push(execution)
          }

          if ('bridging' in snowbridgeFees && snowbridgeFees.bridging) {
            const bridgingAmount = BigInt(snowbridgeFees.bridging.amount ?? 0n)

            // Find execution fees from feeList and check if same token
            let totalFees = bridgingAmount
            const executionFee = feeList.find(fee => fee.title === 'Execution fees')
            if (executionFee?.amount?.token?.id === snowbridgeFees.bridging.token?.id) {
              const executionAmount = BigInt(executionFee.amount.amount ?? 0n)
              totalFees = bridgingAmount + executionAmount
            }

            const bridging: FeeDetails = {
              title: 'Bridging fees',
              chain: sourceChain,
              sufficient: totalFees <= ethBalanceAmount ? 'sufficient' : 'insufficient',
              amount: {
                amount: snowbridgeFees.bridging.amount,
                token: snowbridgeFees.bridging.token,
                inDollars: snowbridgeFees.bridging.inDollars,
              },
            }
            feeList.push(bridging)
          }

          setFees(feeList)
          const isSufficient = checkBalanceSufficiency(feeList, sourceToken, sourceTokenAmount, sourceTokenBalance) // Check if the balance is enough for all fees
          setIsBalanceSufficientForFees(isSufficient)

          break
        }

        case 'ChainflipApi': {
          if (!chainflipQuote || isChainflipQuoteError) {
            setFees(null)
            setIsBalanceSufficientForFees(true) // TODO: check if this is correct
            break
          }
          setLoading(isLoadingChainflipQuote)

          const chainflipfeeList: FeeDetails[] = await Promise.all(
            chainflipQuote.includedFees.map(async fee => {
              const token = getFeeTokenFromAssetSymbol(fee.asset, fee.chain)
              const feeTokenInDollars = (await getCachedTokenPrice(token))?.usd ?? 0
              return {
                title: getFeeLabelFromType(fee.type),
                chain: toRegistryChain(fee.chain),
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
            const feeTokenInDollars = (await getCachedTokenPrice(sourceToken))?.usd ?? 0
            const localTransferParams = {
              sourceChain,
              destinationChain: sourceChain, // Local transfer to AH
              sourceToken,
              sourceAmount: safeConvertAmount(sourceTokenAmount, sourceToken)!,
              sender,
              recipient: senderAddress, // Recipient here must be a placeholder address
            }

            const originFee = await xcmTransferBuilderManager.getOriginXcmFee(localTransferParams)
            if (!originFee.fee) throw new Error('ChainflipApi Local transfer fee not found')

            feeList.unshift({
              title: 'Transfer fees',
              chain: sourceChain,
              sufficient: originFee.sufficient ? 'sufficient' : 'insufficient', // Should I check balance here?
              amount: {
                amount: originFee.fee,
                token: sourceToken,
                inDollars: feeTokenInDollars ? toHuman(originFee.fee, sourceToken) * feeTokenInDollars : 0,
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
    isLoadingChainflipQuote,
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
    dotBalance,
    sourceTokenBalance,
    sdk,
    sourceTokenAmountError,
    transferableAmount,
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

function getTokenFromSymbol(symbol: string): Token {
  const symbolUpper = symbol.toUpperCase()
  const tokensBySymbol = { ...EthereumTokens, ...PolkadotTokens }
  const token = tokensBySymbol[symbolUpper as keyof typeof tokensBySymbol]
  if (!token) {
    throw new Error(`Token not found for symbol: ${symbolUpper}`)
  }
  return token as Token
}

// Checks if a Paraspell fee item has actual fees to be paid
function hasParaspellFee(feeItem: { feeType: string; fee: bigint } | undefined): boolean {
  return feeItem !== undefined && feeItem.feeType !== 'noFeeRequired' && feeItem.fee !== 0n
}

function checkBalanceSufficiency(
  feeList: FeeDetails[],
  sourceToken: Token,
  sourceAmount: number,
  sourceTokenBalance: Balance | undefined,
): boolean {
  if (!sourceTokenBalance || !sourceTokenBalance.value) return false

  // Sum all fees that use the same token as the source token
  const totalFeesInSourceToken = feeList.reduce((sum, fee) => {
    if (fee.amount.token?.id === sourceToken.id) {
      const feeAmount = BigInt(fee.amount.amount ?? 0n)
      return sum + feeAmount
    }
    return sum
  }, 0n)

  const sourceConvertedAmount = safeConvertAmount(sourceAmount, sourceToken)
  if (!sourceConvertedAmount) return false

  const totalRequired = totalFeesInSourceToken + sourceConvertedAmount
  return totalRequired <= sourceTokenBalance.value
}

const getCachedBridgingFee = async (): Promise<bigint> => {
  const response = await fetch(`/api/bridging-fee`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const { error } = await response.json()
    throw new Error(error || `Failed to fetch bridging fee`)
  }
  return await response.json().then(BigInt)
}
