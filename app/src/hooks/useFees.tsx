import useNotification from '@/hooks/useNotification'
import { Chain } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { Token } from '@/models/token'
import { AmountInfo } from '@/models/transfer'
import { getCachedTokenPrice } from '@/services/balance'
import { Direction, resolveDirection } from '@/services/transfer'
import { getPlaceholderAddress } from '@/utils/address'
import { getCurrencyId, getNativeToken, getRelayNode, getTNode } from '@/utils/paraspell'
import { toHuman } from '@/utils/transfer'
import { getOriginFeeDetails, TNodeDotKsmWithRelayChains } from '@paraspell/sdk'
import { captureException } from '@sentry/nextjs'
import { useCallback, useEffect, useState } from 'react'
import useEnvironment from './useEnvironment'
import useSnowbridgeContext from './useSnowbridgeContext'
import { getRoute } from '@/utils/routes'
import { getFeeEstimate } from '@/utils/snowbridge'

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
  const [ethereumTxfees, setEthereumTxFees] = useState<AmountInfo | null>(null)
  const [canPayFees, setCanPayFees] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const { snowbridgeContext, isSnowbridgeContextLoading, snowbridgeContextError } =
    useSnowbridgeContext()
  const { addNotification } = useNotification()
  const env = useEnvironment()

  const fetchFees = useCallback(async () => {
    if (!sourceChain || !destinationChain || !token) {
      setFees(null)
      setEthereumTxFees(null)
      return
    }

    // nuno
    const route = getRoute(env, sourceChain, destinationChain)
    if (!route) throw new Error('Route not supported')

    let direction = resolveDirection(sourceChain, destinationChain)
    direction = sourceChain.chainId === 2034 ? Direction.WithinPolkadot : direction
    // TODO: this should be the fee token, not necessarily the native token. Also adjust the USD value accordingly below.
    const feeToken = getNativeToken(sourceChain)

    try {
      setLoading(true)

      switch (route.sdk) {
        case 'ParaSpellApi': {
          const relay = getRelayNode(env)
          const sourceChainNode = getTNode(sourceChain, relay)
          if (!sourceChainNode) throw new Error('Source chain id not found')

          const destinationChainNode = getTNode(destinationChain, relay)
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

          break
        }

        case 'SnowbridgeApi': {
          const direction = resolveDirection(sourceChain, destinationChain)
          if (
            (direction === Direction.ToEthereum || direction === Direction.ToPolkadot) &&
            isSnowbridgeContextLoading
          ) {
            setFees(null)
            setEthereumTxFees(null)
            return
          }

          const fee = await getFeeEstimate(
            token,
            destinationChain,
            direction,
            snowbridgeContextError,
            senderAddress,
            recipientAddress,
            amount,
            snowbridgeContext,
          )
          if (!fee) {
            setFees(null) // todo(nuno): make sure we want to set it to null - what if there's an error after we already got the fees once successfully?
            setEthereumTxFees(null)
            return
          }

          switch (fee.origin) {
            case 'Ethereum': {
              setFees(fee.bridging)
              setEthereumTxFees(fee.execution)
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
      setEthereumTxFees(null)
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

  return { fees, ethereumTxfees, loading, refetch: fetchFees, canPayFees }
}

export default useFees
