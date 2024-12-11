import useNotification from '@/hooks/useNotification'
import { Chain } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { Token } from '@/models/token'
import { AmountInfo } from '@/models/transfer'
import { getNativeToken } from '@/registry'
import { getCachedTokenPrice } from '@/services/balance'
import { Direction, resolveDirection } from '@/services/transfer'
import { getCurrencyId, getRelayNode } from '@/utils/paraspell'
import { toHuman } from '@/utils/transfer'
import { getOriginFeeDetails, getTNode } from '@paraspell/sdk'
import { captureException } from '@sentry/nextjs'
import { toEthereum, toPolkadot } from '@snowbridge/api'
import { useCallback, useEffect, useState } from 'react'
import useEnvironment from './useEnvironment'
import useSnowbridgeContext from './useSnowbridgeContext'
import { Eth, Polkadot } from '@/registry/mainnet/tokens'

const useFees = (
  senderAddress?: string | null,
  sourceChain?: Chain | null,
  destinationChain?: Chain | null,
  token?: Token | null,
  recipient?: string | null,
) => {
  const [fees, setFees] = useState<AmountInfo | null>(null)
  const [canPayFees, setCanPayFees] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const { snowbridgeContext } = useSnowbridgeContext()
  const { addNotification } = useNotification()
  const env = useEnvironment()

  const fetchFees = useCallback(async () => {
    if (!sourceChain || !destinationChain || !token || !recipient || !senderAddress) {
      setFees(null)
      return
    }

    const direction = resolveDirection(sourceChain, destinationChain)
    // TODO: this should be the fee token, not necessirly the native token. Also adjust the USD value accordingly below.
    const nativeToken = getNativeToken(sourceChain)

    try {
      setLoading(true)
      let fees: string
      let tokenUSDValue: number = 0

      switch (direction) {
        case Direction.ToEthereum: {
          if (!snowbridgeContext) throw new Error('Snowbridge context undefined')
          tokenUSDValue = (await getCachedTokenPrice(Polkadot.DOT))?.usd ?? 0
          fees = (await toEthereum.getSendFee(snowbridgeContext)).toString()
          break
        }

        case Direction.ToPolkadot: {
          if (!snowbridgeContext) throw new Error('Snowbridge context undefined')
          tokenUSDValue = (await getCachedTokenPrice(Eth.ETH))?.usd ?? 0
          fees = (
            await toPolkadot.getSendFee(
              snowbridgeContext,
              token.address,
              destinationChain.chainId,
              BigInt(0),
            )
          ).toString()
          break
        }

        case Direction.WithinPolkadot: {
          const relay = getRelayNode(env)
          const sourceChainNode = getTNode(sourceChain.chainId, relay)
          const destinationChainNode = getTNode(destinationChain.chainId, relay)
          if (!sourceChainNode || !destinationChainNode) throw new Error('Chain id not found')
          const currency = getCurrencyId(env, sourceChainNode, sourceChain.uid, token)

          const info = await getOriginFeeDetails({
            origin: sourceChainNode,
            destination: destinationChainNode,
            currency,
            amount: BigInt(10 ** token.decimals).toString(), // hardcoded amount because the fee is usually independent of the amount
            account: senderAddress,
            accountDestination: recipient,
            api: sourceChain.rpcConnection,
          })
          tokenUSDValue = (await getCachedTokenPrice(nativeToken))?.usd ?? 0
          fees = info.xcmFee.toString()
          setCanPayFees(info.sufficientForXCM)
          break
        }

        default:
          throw new Error('Unsupported direction')
      }

      setFees({
        amount: fees,
        token: nativeToken,
        inDollars: tokenUSDValue ? toHuman(fees, nativeToken) * tokenUSDValue : 0,
      })
    } catch (error) {
      setFees(null)
      captureException(error)
      console.log('Error: ', error)
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
    recipient,
    snowbridgeContext,
    senderAddress,
    addNotification,
  ])

  useEffect(() => {
    fetchFees()
  }, [fetchFees])

  return { fees, loading, refetch: fetchFees, canPayFees }
}

export default useFees
