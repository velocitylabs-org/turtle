import useNotification from '@/hooks/useNotification'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { AmountInfo } from '@/models/transfer'
import { PolkadotTokens } from '@/registry/mainnet/tokens'
import { getCachedTokenPrice } from '@/services/balance'
import { Direction, resolveDirection } from '@/services/transfer'
import { getPlaceholderAddress } from '@/utils/address'
import { getCurrencyId, getNativeToken, getParaSpellNode } from '@/utils/paraspellTransfer'
import { resolveSdk } from '@/utils/routes'
import { getFeeEstimate } from '@/utils/snowbridge'
import { toHuman } from '@/utils/transfer'
import { getOriginFeeDetails, TNodeDotKsmWithRelayChains } from '@paraspell/sdk'
import { captureException } from '@sentry/nextjs'
import { useCallback, useEffect, useState } from 'react'
import { getBalance } from './useBalance'
import useEnvironment from './useEnvironment'
import useSnowbridgeContext from './useSnowbridgeContext'

// NOTE: when bridging from Parachain -> Ethereum, we have the local execution fees + the bridging fees.
// When bridging from AssetHub, the basic fees already take the bridging fees into account.
export type Fee =
  | { origin: 'Ethereum'; bridging: AmountInfo; execution: AmountInfo | null }
  | { origin: 'Polkadot'; fee: AmountInfo }

const useFees = (
  sourceChain?: Chain | null,
  destinationChain?: Chain | null,
  token?: Token | null,
  amount?: number | null,
  senderAddress?: string,
  recipientAddress?: string,
) => {
  const [fees, setFees] = useState<AmountInfo | null>(null)
  const [bridgingFee, setBridgingFees] = useState<AmountInfo | null>(null)
  const [canPayFees, setCanPayFees] = useState<boolean>(true)
  const [canPayAdditionalFees, setCanPayAdditionalFees] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const { snowbridgeContext, isSnowbridgeContextLoading, snowbridgeContextError } =
    useSnowbridgeContext()
  const { addNotification } = useNotification()
  const env = useEnvironment()

  const fetchFees = useCallback(async () => {
    if (!sourceChain || !destinationChain || !token) {
      setFees(null)
      setBridgingFees(null)
      return
    }

    const sdk = resolveSdk(sourceChain, destinationChain)
    if (!sdk) throw new Error('Route not supported')

    // TODO: this should be the fee token, not necessarily the native token.
    const feeToken = getNativeToken(sourceChain)

    try {
      setBridgingFees(null)

      switch (sdk) {
        case 'ParaSpellApi': {
          setLoading(true)
          const sourceChainNode = getParaSpellNode(sourceChain)
          if (!sourceChainNode) throw new Error('Source chain id not found')

          const destinationChainNode = getParaSpellNode(destinationChain)
          if (!destinationChainNode) throw new Error('Destination chain id not found')

          const currency = getCurrencyId(env, sourceChainNode, sourceChain.uid, token)
          const info = await getOriginFeeDetails({
            origin: sourceChainNode as TNodeDotKsmWithRelayChains,
            destination: destinationChainNode,
            currency: { ...currency, amount: BigInt(10 ** token.decimals).toString() }, // hardcoded amount because the fee is usually independent of the amount
            account: getPlaceholderAddress(sourceChain.supportedAddressTypes[0]), // hardcode sender address because the fee is usually independent of the sender
            accountDestination: getPlaceholderAddress(destinationChain.supportedAddressTypes[0]), // hardcode recipient address because the fee is usually independent of the recipient
            api: sourceChain.rpcConnection,
          })

          const feeTokenInDollars = (await getCachedTokenPrice(feeToken))?.usd ?? 0
          const fee = info.xcmFee
          setFees({
            amount: fee,
            token: feeToken,
            inDollars: feeTokenInDollars ? toHuman(fee, feeToken) * feeTokenInDollars : 0,
          })
          setCanPayFees(info.sufficientForXCM)

          if (destinationChain.network === 'Ethereum') {
            const bridgeFeeToken = PolkadotTokens.DOT
            const bridgeFeeTokenInDollars = (await getCachedTokenPrice(bridgeFeeToken))?.usd ?? 0
            const bridgingFee = await getCachedBridgingFee()

            setBridgingFees({
              amount: bridgingFee,
              token: bridgeFeeToken,
              inDollars: Number(toHuman(bridgingFee, bridgeFeeToken)) * bridgeFeeTokenInDollars,
            })

            if (senderAddress) {
              const balance =
                (await getBalance(env, sourceChain, bridgeFeeToken, senderAddress))?.value ?? 0
              setCanPayAdditionalFees(bridgingFee < balance)
            }
          }

          break
        }

        case 'SnowbridgeApi': {
          if (!sourceChain || !senderAddress || !destinationChain || !recipientAddress || !amount) {
            setLoading(false)
            setFees(null)
            setBridgingFees(null)
            return
          }

          setLoading(true)
          const direction = resolveDirection(sourceChain, destinationChain)
          if (
            (direction === Direction.ToEthereum || direction === Direction.ToPolkadot) &&
            isSnowbridgeContextLoading
          ) {
            setFees(null)
            setBridgingFees(null)
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
            setBridgingFees(null)
            return
          }

          switch (fee.origin) {
            case 'Ethereum': {
              setFees(fee.execution)
              setBridgingFees(fee.bridging)
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
      setBridgingFees(null)
      captureException(error)
      console.error('useFees > error is', error)
      // addNotification({
      //   severity: NotificationSeverity.Error,
      //   message: 'Failed to fetch the fees. Please try again later.',
      //   dismissible: true,
      // })
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
    addNotification,
    senderAddress,
    recipientAddress,
    amount,
  ])

  useEffect(() => {
    fetchFees()
  }, [fetchFees])

  return { fees, bridgingFee, loading, refetch: fetchFees, canPayFees, canPayAdditionalFees }
}

export default useFees

/**
 * Fetches and caches the bridging fee of a transfer from AH -> Ethereum.
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
