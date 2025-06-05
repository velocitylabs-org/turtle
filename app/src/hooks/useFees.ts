import { TXcmFeeDetail } from '@paraspell/sdk'
import { captureException } from '@sentry/nextjs'
import { Chain, PolkadotTokens, Token } from '@velocitylabs-org/turtle-registry'
import { useCallback, useEffect, useState } from 'react'
import { AmountInfo } from '@/models/transfer'
import { getCachedTokenPrice } from '@/services/balance'
import { Direction, resolveDirection } from '@/services/transfer'
import {
  getNativeToken,
  getOriginAndDestXCMFee,
  isChainSupportingToken,
} from '@/utils/paraspellTransfer'
import { resolveSdk } from '@/utils/routes'
import { getFeeEstimate } from '@/utils/snowbridge'
import { toHuman } from '@/utils/transfer'
import useBalance from './useBalance'
import useEnvironment from './useEnvironment'
import useSnowbridgeContext from './useSnowbridgeContext'

// NOTE: when bridging from Parachain -> Ethereum, we have the local execution fees + the bridging fees.
// When bridging from AssetHub, the basic fees already take the bridging fees into account.
export type Fee =
  | { origin: 'Ethereum'; bridging: AmountInfo; execution: AmountInfo | null }
  | { origin: 'Polkadot'; fee: AmountInfo }

const useFees = (
  sourceChain: Chain | null,
  destinationChain?: Chain | null,
  token?: Token | null,
  amount?: number | null,
  senderAddress?: string,
  recipientAddress?: string,
  destToken?: Token | null,
) => {
  // States
  const [fees, setFees] = useState<AmountInfo | null>(null)
  const [xcmDestinationfees, setXCMDestinationFees] = useState<AmountInfo | null>(null)
  const [bridgingFee, setBridgingFee] = useState<AmountInfo | null>(null)
  const [canPayFees, setCanPayFees] = useState<boolean>(true)
  const [canPayAdditionalFees, setCanPayAdditionalFees] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)

  // Hooks
  const { snowbridgeContext, isSnowbridgeContextLoading, snowbridgeContextError } =
    useSnowbridgeContext()
  const env = useEnvironment()
  const { balance: feeBalance } = useBalance({
    env: env,
    chain: sourceChain,
    token: sourceChain ? getNativeToken(sourceChain) : undefined,
    address: senderAddress,
  })
  const { balance: dotBalance } = useBalance({
    env: env,
    chain: sourceChain,
    token: isChainSupportingToken(sourceChain, PolkadotTokens.DOT) ? PolkadotTokens.DOT : undefined,
    address: senderAddress,
  })

  // Fee Logic
  const fetchFees = useCallback(async () => {
    if (!sourceChain || !destinationChain || !token || !destToken) {
      setFees(null)
      setBridgingFee(null)
      return
    }

    const sdk = resolveSdk(sourceChain, destinationChain)
    if (!sdk) throw new Error('Route not supported')

    try {
      // reset
      setBridgingFee(null)
      setCanPayAdditionalFees(true)

      switch (sdk) {
        case 'ParaSpellApi': {
          setLoading(true)

          const feesPayload = await getOriginAndDestXCMFee(
            sourceChain,
            destinationChain,
            token,
            amount,
            recipientAddress,
            senderAddress,
          )

          if (!feesPayload) return

          const { origin: sourceFeePayload, destination: destinationFeePayload } = feesPayload

          console.log('sourceFeePayload', sourceFeePayload)
          console.log('destinationFeePayload', destinationFeePayload)

          // TODO: this should be the fee token, not necessarily the native token.
          const sourceFeeToken = getNativeToken(sourceChain)
          const sourcefee = sourceFeePayload.fee ?? 0n
          const feeTokenInDollars = (await getCachedTokenPrice(sourceFeeToken))?.usd ?? 0

          setFees({
            amount: sourcefee,
            token: sourceFeeToken,
            inDollars: feeTokenInDollars
              ? toHuman(sourcefee, sourceFeeToken) * feeTokenInDollars
              : 0,
          })

          const isSufficientFee = (xcmfee: TXcmFeeDetail) => {
            if (!senderAddress || !amount || xcmfee.feeType !== 'paymentInfo') return true
            if (xcmfee.feeType === 'paymentInfo' && xcmfee.sufficient) return xcmfee.sufficient
            return true
          }

          setCanPayFees(isSufficientFee(sourceFeePayload))

          let destinationFeeToken: Token
          let destinationTokenInDollars: number
          const destinationfee = destinationFeePayload.fee ?? 0n

          if (destinationFeePayload.feeType === 'paymentInfo') {
            // Should we convert the destinationFeePayload to the token sent ?
            destinationFeeToken = getNativeToken(destinationChain)
            destinationTokenInDollars = (await getCachedTokenPrice(destinationFeeToken))?.usd ?? 0
          } else {
            destinationFeeToken = token
            destinationTokenInDollars = (await getCachedTokenPrice(destinationFeeToken))?.usd ?? 0
          }

          setXCMDestinationFees({
            amount: destinationfee,
            token: destinationFeeToken,
            inDollars: destinationTokenInDollars
              ? toHuman(destinationfee, destinationFeeToken) * destinationTokenInDollars
              : 0,
          })

          // destination fee (source chain native token or destination chain native token)
          // destination fee token
          // destination fee in dollars
          // canPayDestination fee
          // confirm there are no dest fee to Eth might need to handle eth exception in getXCMTransferInfo or getOriginAndDestXCMFee

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
            const toPay =
              fees?.token === bridgeFeeToken ? BigInt(fees.amount) + bridgeFee : bridgeFee

            // if the dotBalance is not available, we act as if it's ok. This prevents a delay
            // in the UI showing the error label for insufficient fee balance, which is particularly
            // noticable when switching chains.
            setCanPayAdditionalFees(dotBalance == undefined || toPay < (dotBalance?.value ?? 0))
          }
          break
        }

        case 'SnowbridgeApi': {
          if (!sourceChain || !senderAddress || !destinationChain || !amount || !recipientAddress) {
            setLoading(false)
            setFees(null)
            setBridgingFee(null)
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
            token,
            sourceChain,
            destinationChain,
            direction,
            snowbridgeContext,
            senderAddress,
            recipientAddress,
            amount,
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

        default:
          throw new Error('Unsupported direction')
      }
    } catch (error) {
      setFees(null)
      setBridgingFee(null)
      captureException(error)
      console.error('useFees > error is', error)
    } finally {
      setLoading(false)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    env,
    sourceChain,
    destinationChain,
    token?.id,
    snowbridgeContext,
    senderAddress,
    recipientAddress,
    amount,
    dotBalance,
    feeBalance,
    destToken,
  ])

  useEffect(() => {
    fetchFees()
  }, [fetchFees])

  return {
    fees,
    xcmDestinationfees,
    bridgingFee,
    loading,
    refetch: fetchFees,
    canPayFees,
    canPayAdditionalFees,
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
