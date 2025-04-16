import useNotification from '@/hooks/useNotification'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { AmountInfo } from '@/models/transfer'
import useTokenPrice from '@/hooks/useTokenPrice'
import { Direction, resolveDirection, toHuman } from '@/utils/transfer'
import { getPlaceholderAddress } from '@/utils/address'
import { getCurrencyId, getNativeToken, getParaSpellNode } from '@/lib/paraspell'
import {
  getOriginFeeDetails,
  getParaEthTransferFees,
  TNodeDotKsmWithRelayChains,
} from '@paraspell/sdk'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useEnvironmentStore } from '@/stores/environmentStore'
import useSnowbridgeContext from './useSnowbridgeContext'
import { resolveSdk } from '@/utils/routes'
import { getFeeEstimate } from '@/lib/snowbridge'
import { PolkadotTokens } from '@/registry/mainnet/tokens'
import { getBalance } from './useBalance'
import { useQuery } from '@tanstack/react-query'
import { CACHE_REVALIDATE_IN_SECONDS } from '@/utils/consts'

// NOTE: when bridging from Parachain to Ethereum, we have the local execution fees + the bridging fees.
// When bridging from AssetHub, the basic fees already take the bridging fees into account.
export type Fee =
  | { origin: 'Ethereum'; bridging: AmountInfo; execution: AmountInfo | null }
  | { origin: 'Polkadot'; fee: AmountInfo }

const getBridgeFeeToken = (destinationChain?: Chain | null): Token | null =>
  destinationChain?.network === 'Ethereum' ? PolkadotTokens.DOT : null

const getFeeToken = (sourceChain?: Chain | null): Token | null =>
  !sourceChain ? null : getNativeToken(sourceChain)

const useCachedBridgingFee = (bridgeFeeToken: Token | null) => {
  return useQuery({
    queryKey: ['bridging-fee-ah', bridgeFeeToken?.id],
    queryFn: async () => {
      return (await getParaEthTransferFees()).reduce((acc, x) => acc + BigInt(x), 0n)
    },
    enabled: !!bridgeFeeToken,
    staleTime: CACHE_REVALIDATE_IN_SECONDS * 1000,
  })
}

const useFees = (
  sourceChain?: Chain | null,
  destinationChain?: Chain | null,
  token?: Token | null,
  amount?: number | null,
  senderAddress?: string,
  recipientAddress?: string,
) => {
  const feeToken = useMemo(() => getFeeToken(sourceChain), [sourceChain])
  const bridgeFeeToken = useMemo(() => getBridgeFeeToken(destinationChain), [destinationChain])

  const { price: tokenPrice } = useTokenPrice(feeToken)
  const { price: bridgeFeeTokenPrice } = useTokenPrice(bridgeFeeToken)
  const { data: cachedBridgingFees, isLoading: isCachedBridgingFeesLoading } =
    useCachedBridgingFee(bridgeFeeToken)

  const [fees, setFees] = useState<AmountInfo | null>(null)
  const [bridgingFees, setBridgingFees] = useState<AmountInfo | null>(null)
  const [canPayFees, setCanPayFees] = useState<boolean>(true)

  const [canPayAdditionalFees, setCanPayAdditionalFees] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const { snowbridgeContext, isSnowbridgeContextLoading, snowbridgeContextError } =
    useSnowbridgeContext()
  const { addNotification } = useNotification()
  const env = useEnvironmentStore(state => state.current)

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

          const feeTokenInDollars = tokenPrice ?? 0
          const fee = info.xcmFee
          setFees({
            amount: fee,
            token: feeToken,
            inDollars: feeTokenInDollars ? toHuman(fee, feeToken) * feeTokenInDollars : 0,
          })
          setCanPayFees(info.sufficientForXCM)

          if (destinationChain.network === 'Ethereum' && !isCachedBridgingFeesLoading) {
            const bridgeFeeToken = getBridgeFeeToken(destinationChain) ?? PolkadotTokens.DOT
            const bridgeFeeTokenInDollars = bridgeFeeTokenPrice ?? 0
            const bridgingFees = cachedBridgingFees ?? 0n

            setBridgingFees({
              amount: bridgingFees.toString(),
              token: bridgeFeeToken,
              inDollars: Number(toHuman(bridgingFees, bridgeFeeToken)) * bridgeFeeTokenInDollars,
            })

            if (senderAddress) {
              const balance =
                (await getBalance(env, sourceChain, bridgeFeeToken, senderAddress))?.value ?? 0
              setCanPayAdditionalFees(bridgingFees < balance)
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
      // captureException(error) - Sentry
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
    isCachedBridgingFeesLoading,
  ])

  useEffect(() => {
    fetchFees()
  }, [fetchFees])

  return { fees, bridgingFees, loading, refetch: fetchFees, canPayFees, canPayAdditionalFees }
}

export default useFees
