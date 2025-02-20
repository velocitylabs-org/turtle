import useNotification from '@/hooks/useNotification'
import { Chain } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { Token } from '@/models/token'
import { AmountInfo } from '@/models/transfer'
import { getCachedTokenPrice } from '@/services/balance'
import { Direction, resolveDirection } from '@/services/transfer'
import { getPlaceholderAddress } from '@/utils/address'
import { getCurrencyId, getNativeToken, getParaSpellNode } from '@/utils/paraspell'
import { toHuman } from '@/utils/transfer'
import {
  getOriginFeeDetails,
  TNodeDotKsmWithRelayChains,
  getParaEthTransferFees,
} from '@paraspell/sdk'
import { captureException } from '@sentry/nextjs'
import { useCallback, useEffect, useState } from 'react'
import useEnvironment from './useEnvironment'
import useSnowbridgeContext from './useSnowbridgeContext'
import { getRoute } from '@/utils/routes'
import { getFeeEstimate } from '@/utils/snowbridge'
import { PolkadotTokens } from '@/registry/mainnet/tokens'
import { isAssetHub } from '@/registry/helpers'

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
  const [bridgingFees, setBridgingFees] = useState<AmountInfo | null>(null)
  const [canPayFees, setCanPayFees] = useState<boolean>(true)
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

    const route = getRoute(env, sourceChain, destinationChain)
    if (!route) throw new Error('Route not supported')

    // TODO: this should be the fee token, not necessarily the native token.
    const feeToken = getNativeToken(sourceChain)

    try {
      setLoading(true)
      setBridgingFees(null)

      switch (route.sdk) {
        case 'ParaSpellApi': {
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
            ahAccount: getPlaceholderAddress(sourceChain.supportedAddressTypes[0]),
          })

          const feeTokenInDollars = (await getCachedTokenPrice(feeToken))?.usd ?? 0
          const fee = info.xcmFee
          setFees({
            amount: fee,
            token: feeToken,
            inDollars: feeTokenInDollars ? toHuman(fee, feeToken) * feeTokenInDollars : 0,
          })
          setCanPayFees(info.sufficientForXCM)

          // NOTE: when bridging from Parachain -> Ethereum, we have the local execution fees + the bridging fees.
          // When bridging from AssetHub, the basic fees already take the bridging fees into account.
          if (
            destinationChain.network === 'Ethereum' &&
            !isAssetHub(sourceChain) &&
            snowbridgeContext
          ) {
            const bridgeFeeToken = PolkadotTokens.DOT
            const bridgeFeeTokenInDollars = (await getCachedTokenPrice(bridgeFeeToken))?.usd ?? 0
            //todo(nuno): cache this
            const bridgingFee = (await getParaEthTransferFees()).reduce((acc, x) => acc + x)

            setBridgingFees({
              amount: bridgingFee,
              token: bridgeFeeToken,
              inDollars: Number(toHuman(bridgingFee, bridgeFeeToken)) * bridgeFeeTokenInDollars,
            })
          }

          break
        }

        case 'SnowbridgeApi': {
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
              setFees(fee.bridging)
              setBridgingFees(fee.execution)
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
      console.error(error)
      addNotification({
        severity: NotificationSeverity.Error,
        message: 'Failed to fetch the fees. Please try again later.',
        dismissible: true,
      })
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

  return { fees, bridgingFees, loading, refetch: fetchFees, canPayFees }
}

export default useFees
