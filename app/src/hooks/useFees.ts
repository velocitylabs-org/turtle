import { captureException } from '@sentry/nextjs'
import { type Chain, PolkadotTokens, type Token } from '@velocitylabs-org/turtle-registry'
import { useCallback, useEffect, useState } from 'react'
import useNotification from '@/hooks/useNotification'
import type { Sender } from '@/hooks/useTransfer'
import { NotificationSeverity } from '@/models/notification'
import type { AmountInfo } from '@/models/transfer'
import { getCachedTokenPrice } from '@/services/balance'
import xcmTransferBuilderManager from '@/services/paraspell/xcmTransferBuilder'
import { Direction, resolveDirection } from '@/services/transfer'
import { type ChainflipFee, getFeeTokenFromAssetSymbol } from '@/utils/chainflip'
import { getNativeToken, getParaSpellNode, isChainSupportingToken } from '@/utils/paraspellTransfer'
import { resolveSdk } from '@/utils/routes'
import { getFeeEstimate } from '@/utils/snowbridge'
import { safeConvertAmount, toHuman } from '@/utils/transfer'
import useBalance from './useBalance'
import { useChainflipQuote } from './useChainflipQuote'
import useSnowbridgeContext from './useSnowbridgeContext'

// NOTE: when bridging from Parachain -> Ethereum, we have the local execution fees + the bridging fees.
// When bridging from AssetHub, the basic fees already take the bridging fees into account.
export type Fee =
  | { origin: 'Ethereum'; bridging: AmountInfo; execution: AmountInfo | null }
  | { origin: 'Polkadot'; fee: AmountInfo }

interface UseFeesParams {
  sourceChain: Chain | null
  destinationChain?: Chain | null
  sourceToken?: Token | null
  sourceTokenAmount?: number | null
  sender?: Sender | undefined
  recipientAddress?: string
  destinationToken?: Token | null
}

const useFees = (params: UseFeesParams) => {
  const { sourceChain, destinationChain, sourceToken, destinationToken, sourceTokenAmount, sender, recipientAddress } =
    params
  const [fees, setFees] = useState<AmountInfo | null>(null)
  const [bridgingFee, setBridgingFee] = useState<AmountInfo | null>(null)
  const [chainflipFees, setChainflipFees] = useState<ChainflipFee[]>([])
  const [canPayFees, setCanPayFees] = useState<boolean>(true)
  const [canPayAdditionalFees, setCanPayAdditionalFees] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const { snowbridgeContext, isSnowbridgeContextLoading, snowbridgeContextError } = useSnowbridgeContext()
  const { addNotification } = useNotification()
  const senderAddress = sender?.address
  const { balance: feeBalance } = useBalance({
    chain: sourceChain,
    token: sourceChain ? getNativeToken(sourceChain) : undefined,
    address: senderAddress,
  })

  const { balance: dotBalance } = useBalance({
    chain: sourceChain,
    token: isChainSupportingToken(sourceChain, PolkadotTokens.DOT) ? PolkadotTokens.DOT : undefined,
    address: senderAddress,
  })

  const { chainflipQuote, isLoadingChainflipQuote, isFetchingChainflipQuote, isChainflipQuoteError } =
    useChainflipQuote({
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
      !recipientAddress
    ) {
      setFees(null)
      setBridgingFee(null)
      setChainflipFees([])
      return
    }

    const sdk = resolveSdk(sourceChain, destinationChain, sourceToken, destinationToken)
    if (!sdk) throw new Error('Route not supported')

    try {
      // reset
      setBridgingFee(null)
      setCanPayAdditionalFees(true)
      setChainflipFees([])

      switch (sdk) {
        case 'ParaSpellApi': {
          setLoading(true)
          const sourceChainNode = getParaSpellNode(sourceChain)
          if (!sourceChainNode) throw new Error('Source chain id not found')

          const destinationChainNode = getParaSpellNode(destinationChain)
          if (!destinationChainNode) throw new Error('Destination chain id not found')

          const originXcmFee = await xcmTransferBuilderManager.getOriginXcmFee({
            sourceChain: sourceChain,
            destinationChain: destinationChain,
            sourceToken,
            sourceAmount: safeConvertAmount(sourceTokenAmount, sourceToken)!,
            sender,
            recipient: recipientAddress,
          })

          const { currency: feeCurrency, fee: feeAmount, sufficient: sufficientForXCM } = originXcmFee

          if (!feeCurrency) throw new Error('Fee currency not available from XCM transfer builder')
          if (!feeAmount) throw new Error('Fee amount not available from XCM transfer builder')

          const feeToken = PolkadotTokens[feeCurrency as keyof typeof PolkadotTokens]
          const feeTokenInDollars = (await getCachedTokenPrice(feeToken))?.usd ?? 0
          setFees({
            amount: feeAmount,
            token: feeToken,
            inDollars: feeTokenInDollars ? toHuman(feeAmount, feeToken) * feeTokenInDollars : 0,
          })

          if (sufficientForXCM !== undefined) {
            setCanPayFees(sufficientForXCM)
          }

          // The bridging fee when sending to Ethereum is paid in DOT
          if (destinationChain.network === 'Ethereum') {
            const bridgeFeeToken = PolkadotTokens.DOT
            const bridgeFeeTokenInDollars = (await getCachedTokenPrice(bridgeFeeToken))?.usd ?? 0
            const bridgeFee = await getCachedBridgingFee()

            setBridgingFee({
              amount: bridgeFee,
              token: bridgeFeeToken,
              inDollars: Number(toHuman(bridgeFee, bridgeFeeToken)) * bridgeFeeTokenInDollars,
            })

            // if the bridging fee is the same as the execution fee, sum them both before checking the user can pay for it all.
            const toPay = fees?.token === bridgeFeeToken ? BigInt(fees.amount) + bridgeFee : bridgeFee

            // if the dotBalance is not available, we act as if it's ok. This prevents a delay
            // in the UI showing the error label for insufficient fee balance, which is particularly
            // noticable when switching chains.
            // biome-ignore lint/suspicious/noDoubleEquals: dotBalance
            setCanPayAdditionalFees(dotBalance === undefined || toPay < (dotBalance?.value ?? 0))
          }
          break
        }

        case 'SnowbridgeApi': {
          if (!sourceChain || !senderAddress || !destinationChain || !sourceTokenAmount || !recipientAddress) {
            setLoading(false)
            setFees(null)
            setBridgingFee(null)
            setChainflipFees([])
            return
          }

          setLoading(true)
          const direction = resolveDirection(sourceChain, destinationChain)
          if (
            (direction === Direction.ToEthereum || direction === Direction.ToPolkadot) &&
            isSnowbridgeContextLoading
          ) {
            setFees(null)
            setBridgingFee(null)
            return
          }

          if (!snowbridgeContext || snowbridgeContextError)
            throw snowbridgeContextError ?? new Error('Snowbridge context undefined')

          const fee = await getFeeEstimate(
            sourceToken,
            sourceChain,
            destinationChain,
            direction,
            snowbridgeContext,
            senderAddress,
            recipientAddress,
            sourceTokenAmount,
          )
          if (!fee) {
            setFees(null)
            setBridgingFee(null)
            return
          }

          switch (fee.origin) {
            case 'Ethereum': {
              setFees(fee.execution)
              setBridgingFee(fee.bridging)

              const totalCost = BigInt(fee.execution?.amount ?? 0n) + BigInt(fee.bridging.amount)
              setCanPayAdditionalFees(totalCost < BigInt(feeBalance?.value ?? 0n))
              break
            }
            case 'Polkadot': {
              setFees(fee.fee)
              break
            }
          }
          break
        }

        case 'ChainflipApi': {
          if (!chainflipQuote || isChainflipQuoteError) {
            setFees(null)
            setBridgingFee(null)
            setChainflipFees([])
            break
          }
          setLoading(isLoadingChainflipQuote || isFetchingChainflipQuote)

          const feesData: ChainflipFee[] = await Promise.all(
            chainflipQuote.includedFees.map(async fee => {
              const token = getFeeTokenFromAssetSymbol(fee.asset, fee.chain)
              const feeTokenInDollars = (await getCachedTokenPrice(token))?.usd ?? 0
              return {
                amount: fee.amount,
                token: token,
                inDollars: feeTokenInDollars ? toHuman(fee.amount, token) * feeTokenInDollars : 0,
                type: fee.type,
              }
            }),
          )

          setChainflipFees(feesData)
          break
        }

        default:
          throw new Error('Unsupported direction')
      }
    } catch (error) {
      setFees(null)
      setBridgingFee(null)
      setChainflipFees([])
      captureException(error)
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
    sourceToken?.id,
    chainflipQuote,
    isLoadingChainflipQuote,
    isFetchingChainflipQuote,
    isChainflipQuoteError,
    snowbridgeContext,
    addNotification,
    senderAddress,
    recipientAddress,
    sourceTokenAmount,
    dotBalance,
    feeBalance,
    destinationToken,
    isSnowbridgeContextLoading,
    snowbridgeContextError,
    fees?.token,
    fees?.amount,
    sender,
  ])

  useEffect(() => {
    fetchFees()
  }, [fetchFees])

  return {
    fees,
    bridgingFee,
    loading,
    refetch: fetchFees,
    canPayFees,
    canPayAdditionalFees,
    chainflipFees,
  }
}

export default useFees

/**
 * Fetches and caches the bridging fee of a transfer from AH to Ethereum.
 * It serves as a cached layer.
 *
 * @returns - A Promise resolving to the current bridging fee value.
 */
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
