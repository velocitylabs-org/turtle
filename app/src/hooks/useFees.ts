// import { getOriginFeeDetails, TNodeDotKsmWithRelayChains } from '@paraspell/sdk'
import { captureException } from '@sentry/nextjs'
import { Chain, Token } from '@velocitylabs-org/turtle-registry'
import { useCallback, useEffect, useState } from 'react'
// import { FeeContext } from '@/context/fee'
import useNotification from '@/hooks/useNotification'
import { AmountInfo } from '@/models/transfer'

// import { getCachedTokenPrice } from '@/services/balance'
import { Direction, resolveDirection } from '@/services/transfer'
// import { getPlaceholderAddress } from '@/utils/address'
import {
  getNativeToken,
  // getParaSpellNode,
  // getParaspellToken,
  // isChainSupportingToken,
} from '@/utils/paraspellTransfer'
import { resolveSdk } from '@/utils/routes'
import { getFeeEstimate } from '@/utils/snowbridge'
// import { toHuman } from '@/utils/transfer'
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
  const [fees, setFees] = useState<AmountInfo | null>(null)
  const [bridgingFee, setBridgingFee] = useState<AmountInfo | null>(null)
  const [canPayAdditionalFees, setCanPayAdditionalFees] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const { snowbridgeContext, isSnowbridgeContextLoading, snowbridgeContextError } =
    useSnowbridgeContext()
  const { addNotification } = useNotification()
  const env = useEnvironment()
  const { balance: feeBalance } = useBalance({
    env: env,
    chain: sourceChain,
    token: sourceChain ? getNativeToken(sourceChain) : undefined,
    address: senderAddress,
  })

  const fetchFees = useCallback(async () => {
    // Do we need to check for tokens? You can't select a token if you don't have a source chain.
    // Same for destination chain.
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
    addNotification,
    senderAddress,
    recipientAddress,
    amount,
    // dotBalance,
    feeBalance,
    destToken,
  ])

  useEffect(() => {
    fetchFees()
  }, [fetchFees])

  return { fees, bridgingFee, loading, refetch: fetchFees, canPayAdditionalFees }
}

export default useFees
