import { useCallback, useEffect, useState } from 'react'
import { getNativeToken } from '@/config/registry'
import { getContext, getEnvironment } from '@/context/snowbridge'
import useNotification from '@/hooks/useNotification'
import { Chain, Network } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { Token } from '@/models/token'
import { Fees } from '@/models/transfer'
import { Direction, resolveDirection } from '@/services/transfer'
import * as Sentry from '@sentry/nextjs'
import { getFeesTokenUSDValue } from '@/services/balance'
import * as Snowbridge from '@snowbridge/api'
import { toHuman } from '@/utils/transfer'

import useEnvironment from './useEnvironment'

const useFees = (
  sourceChain?: Chain | null,
  destinationChain?: Chain | null,
  token?: Token | null,
) => {
  const [fees, setFees] = useState<Fees | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const [snowbridgeContext, setSnowbridgeContext] = useState<Snowbridge.Context>()
  const { addNotification } = useNotification()
  const { environment } = useEnvironment()

  const fetchFees = useCallback(async () => {
    if (!sourceChain || !destinationChain || !token || !snowbridgeContext) {
      setFees(null)
      return
    }

    const direction = resolveDirection(sourceChain, destinationChain)
    const nativeToken = getNativeToken(sourceChain)

    try {
      setLoading(true)
      let amount: string
      let tokenUSDValue: number = 0
      switch (direction) {
        case Direction.ToEthereum:
          const dotUSDValue = await getFeesTokenUSDValue(Network.Polkadot)
          tokenUSDValue = dotUSDValue?.[Network.Polkadot.toLowerCase()].usd ?? 0
          amount = (await Snowbridge.toEthereum.getSendFee(snowbridgeContext)).toString()
          break
        case Direction.ToPolkadot:
          const ethUSDValue = await getFeesTokenUSDValue(Network.Ethereum)
          tokenUSDValue = ethUSDValue?.[Network.Ethereum.toLowerCase()].usd ?? 0
          amount = (
            await Snowbridge.toPolkadot.getSendFee(
              snowbridgeContext,
              token.address,
              destinationChain.chainId,
              BigInt(0),
            )
          ).toString()
          break
        default:
          throw new Error('Unsupported direction')
      }

      setFees({
        amount,
        token: nativeToken,
        inDollars: tokenUSDValue ? toHuman(amount, nativeToken) * tokenUSDValue : 0,
      })
    } catch (error) {
      setFees(null)
      Sentry.captureException(error)
      addNotification({
        severity: NotificationSeverity.Error,
        message: 'Failed to fetch the fees. Please try again later.',
        dismissible: true,
      })
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceChain, destinationChain, token?.id, snowbridgeContext, addNotification])

  // call fetch fees
  useEffect(() => {
    fetchFees()
  }, [sourceChain, destinationChain, token?.id, fetchFees])

  // Load the Snowbridge context.
  useEffect(() => {
    const fetchContext = async () => {
      const snowbridgeEnv = getEnvironment(environment)
      const context = await getContext(snowbridgeEnv)
      setSnowbridgeContext(context)
    }

    fetchContext()
  }, [environment])

  return { fees, loading, refetch: fetchFees }
}

export default useFees
