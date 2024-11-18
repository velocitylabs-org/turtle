import useNotification from '@/hooks/useNotification'
import { Chain } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { getCoingekoId, Token } from '@/models/token'
import { Fees } from '@/models/transfer'
import { getNativeToken } from '@/registry'
import { getTokenPrice } from '@/services/balance'
import { Direction, resolveDirection } from '@/services/transfer'
import { getCurrencyId, getRelayNode } from '@/utils/paraspell'
import { toHuman } from '@/utils/transfer'
import { getOriginFeeDetails, getTNode } from '@paraspell/sdk'
import { captureException } from '@sentry/nextjs'
import { toEthereum, toPolkadot } from '@snowbridge/api'
import { useCallback, useEffect, useRef, useState } from 'react'
import useEnvironment from './useEnvironment'
import useSnowbridgeContext from './useSnowbridgeContext'

const DEBOUNCE_DELAY_MS = 500

const useFees = (
  senderAddress?: string | null,
  sourceChain?: Chain | null,
  destinationChain?: Chain | null,
  token?: Token | null,
  amount?: bigint | null,
  recipient?: string | null,
) => {
  const [fees, setFees] = useState<Fees | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const { snowbridgeContext } = useSnowbridgeContext()
  const { addNotification } = useNotification()
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const env = useEnvironment()

  const fetchFees = useCallback(async () => {
    if (!sourceChain || !destinationChain || !token || !amount || !recipient || !senderAddress) {
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

          tokenUSDValue = (await getTokenPrice('polkadot'))?.usd ?? 0
          fees = (await toEthereum.getSendFee(snowbridgeContext)).toString()
          break
        }

        case Direction.ToPolkadot: {
          if (!snowbridgeContext) throw new Error('Snowbridge context undefined')

          tokenUSDValue = (await getTokenPrice('ethereum'))?.usd ?? 0
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
          const currency = getCurrencyId(
            env,
            sourceChainNode,
            sourceChain.uid,
            token,
            destinationChain,
          )

          const info = await getOriginFeeDetails({
            origin: sourceChainNode,
            destination: destinationChainNode,
            currency,
            amount: amount.toString(),
            account: senderAddress,
            accountDestination: recipient,
            api: sourceChain.rpcConnection,
          })
          fees = info.xcmFee.toString()

          tokenUSDValue = (await getTokenPrice(getCoingekoId(nativeToken)))?.usd ?? 0
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
  }, [
    env,
    sourceChain,
    destinationChain,
    token,
    amount,
    recipient,
    snowbridgeContext,
    senderAddress,
    addNotification,
  ])

  // Debounced fetch fees
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      fetchFees()
    }, DEBOUNCE_DELAY_MS)

    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [amount, fetchFees])

  return { fees, loading, refetch: fetchFees }
}

export default useFees
