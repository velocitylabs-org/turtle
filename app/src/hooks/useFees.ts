import { captureException } from '@sentry/nextjs'
import {
  type Balance,
  type Chain,
  EthereumTokens,
  MainnetRegistry,
  PolkadotTokens,
  type Token,
} from '@velocitylabs-org/turtle-registry'
import { useCallback, useEffect, useState } from 'react'
import useNotification from '@/hooks/useNotification'
import type { Sender } from '@/hooks/useTransfer'
import { NotificationSeverity } from '@/models/notification'
import type { FeeDetails } from '@/models/transfer'
import { getCachedTokenPrice } from '@/services/balance'
import xcmTransferBuilderManager from '@/services/paraspell/xcmTransferBuilder'
import { Direction } from '@/services/transfer'
import { getParaSpellNode } from '@/utils/paraspellTransfer'
import { resolveSdk } from '@/utils/routes'
import { getFeeEstimate } from '@/utils/snowbridge'
import { safeConvertAmount, toHuman } from '@/utils/transfer'
import useBalance from './useBalance'
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
  } = params
  const [fees, setFees] = useState<FeeDetails[] | null>(null)
  // Indicates whether the source token balance is enough to cover both fees and transfer amount
  const [isBalanceSufficientForFees, setIsBalanceSufficientForFees] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const { snowbridgeContext, isSnowbridgeContextLoading, snowbridgeContextError } = useSnowbridgeContext()
  const { addNotification } = useNotification()
  const senderAddress = sender?.address

  // Determine if we need ETH balance (only for SnowbridgeApi case)
  const sdk = sourceChain && destinationChain ? resolveSdk(sourceChain, destinationChain) : null
  const isSnowbridgeRoute = sdk === 'SnowbridgeApi'

  // Only fetch ETH balance when using SnowbridgeApi
  // useBalance handles undefined values gracefully by returning early
  const { balance: ethBalance } = useBalance({
    chain: isSnowbridgeRoute ? sourceChain : undefined,
    token: isSnowbridgeRoute ? EthereumTokens.ETH : undefined,
    address: isSnowbridgeRoute ? senderAddress : undefined,
  })

  const fetchFees = useCallback(async () => {
    if (
      !sourceChain ||
      !destinationChain ||
      !sourceToken ||
      !destinationToken ||
      !sourceTokenAmount ||
      !senderAddress ||
      !recipientAddress
    ) {
      setFees(null)
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
          if (xcmFee.origin && xcmFee.origin.feeType !== 'noFeeRequired') {
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
          if (xcmFee.destination && xcmFee.destination.feeType !== 'noFeeRequired') {
            const destinationToken = getTokenFromSymbol(xcmFee.destination.currency)
            destination.push({
              title: 'Destination fees',
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
            for (const hop of xcmFee.hops) {
              if (hop.result.feeType !== 'noFeeRequired') {
                const hopToken = getTokenFromSymbol(hop.result.currency)
                const hopFeeDetailItem: FeeDetails = {
                  title: isBridgeToEthereum ? 'Bridging fees' : 'Swap fees',
                  chain: mapParaspellChainToRegistry(hop.chain),
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
          setFees(feeList)
          const isSufficient = checkBalanceSufficiency(feeList, sourceToken, sourceTokenAmount, sourceTokenBalance) // Check if the balance is enough for all fees
          setIsBalanceSufficientForFees(isSufficient)

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
            const executionAmount = snowbridgeFees.execution.amount ?? 0n
            const execution: FeeDetails = {
              title: 'Execution fees',
              chain: sourceChain,
              sufficient: BigInt(executionAmount) < BigInt(ethBalanceAmount) ? 'sufficient' : 'insufficient',
              amount: {
                amount: snowbridgeFees.execution.amount,
                token: snowbridgeFees.execution.token,
                inDollars: snowbridgeFees.execution.inDollars,
              },
            }
            feeList.push(execution)
          }

          if ('bridging' in snowbridgeFees && snowbridgeFees.bridging) {
            const bridgingAmount = snowbridgeFees.bridging.amount ?? 0n
            const bridging: FeeDetails = {
              title: 'Bridging fees',
              chain: sourceChain,
              sufficient: BigInt(bridgingAmount) < BigInt(ethBalanceAmount) ? 'sufficient' : 'insufficient',
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
    sourceTokenBalance,
    sdk,
  ])

  useEffect(() => {
    fetchFees()
  }, [fetchFees])

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

function mapParaspellChainToRegistry(chainName: string): Chain {
  const map: Record<string, string> = {
    AssetHubPolkadot: 'AssetHub',
    BridgeHubPolkadot: 'Polkadot',
    BifrostPolkadot: 'Bifrost',
    AssetHubKusama: 'KusamaAssetHub',
  }
  const name = map[chainName] ?? chainName
  const chain = MainnetRegistry.chains.find(c => removeWhitespace(c.name) === removeWhitespace(name))
  if (!chain) {
    throw new Error(`Chain not found for name: ${chainName}`)
  }
  return chain
}

function removeWhitespace(str: string) {
  return str.replace(/\s+/g, '')
}

function checkBalanceSufficiency(
  feeList: FeeDetails[],
  sourceToken: Token,
  sourceAmount: number,
  sourceTokenBalance: Balance | undefined,
): boolean {
  if (!sourceTokenBalance) return false

  // Sum all fees that use the same token as the source token
  const totalFeesInSourceToken = feeList.reduce((sum, fee) => {
    if (fee.amount.token?.id === sourceToken.id) {
      return sum + BigInt(fee.amount.amount ?? 0n)
    }
    return sum
  }, 0n)

  const totalRequired = totalFeesInSourceToken + safeConvertAmount(sourceAmount, sourceToken)!
  return totalRequired <= BigInt(sourceTokenBalance.value ?? 0n)
}
