'use client'

import { TXcmFeeDetail } from '@paraspell/sdk'
import { captureException } from '@sentry/nextjs'
import { Chain, Environment, PolkadotTokens, Token } from '@velocitylabs-org/turtle-registry'
import { createContext, useCallback, useEffect, useState } from 'react'
import useBalance from '@/hooks/useBalance'
import useSnowbridgeContext from '@/hooks/useSnowbridgeContext'
import { AmountInfo } from '@/models/transfer'
import { getCachedBridgingFee, getCachedTokenPrice } from '@/services/balance'
import builderManager from '@/services/builder'
import { Direction, resolveDirection } from '@/services/transfer'
import { getPlaceholderAddress } from '@/utils/address'
import { getNativeToken, isChainSupportingToken } from '@/utils/paraspellTransfer'
import { resolveSdk } from '@/utils/routes'
import { getFeeEstimate } from '@/utils/snowbridge'
import { safeConvertAmount, toHuman } from '@/utils/transfer'

type BaseFeeParams = {
  sourceChain: Chain
  destinationChain: Chain
  token: Token
}

type OptionalFeeParams = {
  recipient?: string
  sender?: string
  amount?: number | null
  destToken?: Token | null
}

export const FeeContext = createContext<{
  sourceChainfee: AmountInfo | null
  bridgingFee: AmountInfo | null
  canPayFees: boolean
  canPayAdditionalFees: boolean
  setParams: (params: BaseFeeParams & OptionalFeeParams) => void
  refetch: () => void
  loading: boolean
}>({
  sourceChainfee: null,
  bridgingFee: null,
  canPayFees: true,
  canPayAdditionalFees: true,
  setParams: () => {},
  refetch: () => {},
  loading: false,
})

export const FeeProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [params, _setParams] = useState<BaseFeeParams & OptionalFeeParams>()
  const [sourceChainfee, setSourceChainFee] = useState<AmountInfo | null>(null)
  const [bridgingFee, setBridgingFee] = useState<AmountInfo | null>(null)
  const [canPayFees, setCanPayFees] = useState(false)
  const [canPayAdditionalFees, setCanPayAdditionalFees] = useState(false)

  // Prevent infinite re-renders when the params are the same
  const setParams = useCallback((newParams: BaseFeeParams & OptionalFeeParams) => {
    _setParams(prev => {
      const isSame =
        prev &&
        Object.keys(newParams).every(
          key => prev[key as keyof typeof prev] === newParams[key as keyof typeof newParams],
        )
      if (isSame) return prev
      return newParams
    })
  }, [])

  const { snowbridgeContext, isSnowbridgeContextLoading, snowbridgeContextError } =
    useSnowbridgeContext()

  const { balance: feeBalance } = useBalance({
    env: Environment.Mainnet,
    chain: params?.sourceChain,
    token: params?.sourceChain ? getNativeToken(params.sourceChain) : undefined,
    address: params?.sender,
  })

  const { balance: dotBalance } = useBalance({
    env: Environment.Mainnet,
    chain: params?.sourceChain,
    token:
      params?.sourceChain && isChainSupportingToken(params.sourceChain, PolkadotTokens.DOT)
        ? PolkadotTokens.DOT
        : undefined,
    address: params?.sender,
  })

  const calculateXcmFees = useCallback(async () => {
    if (!params) return

    setLoading(true)

    const feesPayload = await builderManager.getOriginAndDestinationXcmFee({
      from: params.sourceChain,
      to: params.destinationChain,
      token: params.token,
      address:
        params.recipient ?? getPlaceholderAddress(params.destinationChain.supportedAddressTypes[0]),
      senderAddress:
        params.sender ?? getPlaceholderAddress(params.sourceChain.supportedAddressTypes[0]),
      amount: params.amount && safeConvertAmount(params.amount, params.token),
    })

    if (!feesPayload) return
    const { origin: sourceFeePayload } = feesPayload

    // TODO: @Stefano, this should be the fee token, not necessarily the native token.
    const sourceFeeToken = getNativeToken(params.sourceChain)
    const sourcefee = sourceFeePayload.fee ?? 0n
    const feeTokenInDollars = (await getCachedTokenPrice(sourceFeeToken))?.usd

    setSourceChainFee({
      amount: sourcefee,
      token: sourceFeeToken,
      inDollars: feeTokenInDollars ? toHuman(sourcefee, sourceFeeToken) * feeTokenInDollars : 0,
    })

    const isSufficientFee = (xcmfee: TXcmFeeDetail, source: 'origin' | 'destination') => {
      // We consider DryRun as a sufficient.
      if (!params.sender || !params.amount || xcmfee.feeType !== 'paymentInfo') return true

      if ('sufficient' in xcmfee && xcmfee.sufficient === undefined && source === 'destination') {
        // TODO: Later when we implement the dest fees
        // Notify user to about a potential token change between destination native token to the sent token.
        // setNotifyFeesMayChange or setVerifyDestFeesBalance
      }
      // We consider PaymentInfo true and undefined as a sufficient.
      return xcmfee.sufficient !== false
    }

    setCanPayFees(isSufficientFee(sourceFeePayload, 'origin'))

    // The bridging fee when sending to Ethereum is paid in DOT
    if (params.destinationChain.network === 'Ethereum') {
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
        sourceChainfee?.token === bridgeFeeToken
          ? BigInt(sourceChainfee.amount) + bridgeFee
          : bridgeFee

      // if the dotBalance is not available, we act as if it's ok. This prevents a delay
      // in the UI showing the error label for insufficient fee balance, which is particularly
      // noticable when switching chains.
      setCanPayAdditionalFees(dotBalance == undefined || toPay < (dotBalance?.value ?? 0))
    }
  }, [params])

  const calculateSnowbridgeFees = useCallback(async () => {
    if (!params || !params.sender || !params.amount || !params.recipient) {
      setLoading(false)
      setSourceChainFee(null)
      setBridgingFee(null)
      return
    }

    setLoading(true)

    const direction = resolveDirection(params.sourceChain, params.destinationChain)
    if (
      (direction === Direction.ToEthereum || direction === Direction.ToPolkadot) &&
      isSnowbridgeContextLoading
    ) {
      setSourceChainFee(null)
      setBridgingFee(null)
      return
    }

    if (!snowbridgeContext || snowbridgeContextError)
      throw snowbridgeContextError ?? new Error('Snowbridge context undefined')

    const fee = await getFeeEstimate(
      params.token,
      params.sourceChain,
      params.destinationChain,
      direction,
      snowbridgeContext,
      params.sender,
      params.recipient,
      params.amount,
    )
    if (!fee) {
      setSourceChainFee(null)
      setBridgingFee(null)
      return
    }

    switch (fee.origin) {
      case 'Ethereum': {
        setSourceChainFee(fee.execution)
        setBridgingFee(fee.bridging)

        const totalCost = BigInt(fee.execution?.amount ?? 0n) + BigInt(fee.bridging.amount)
        setCanPayAdditionalFees(totalCost < BigInt(feeBalance?.value ?? 0n))
        break
      }
      case 'Polkadot': {
        setSourceChainFee(fee.fee)
        break
      }
    }
  }, [params])

  const fetchFees = useCallback(async () => {
    try {
      if (!params?.sourceChain || !params?.destinationChain || !params?.token) {
        setSourceChainFee(null)
        setBridgingFee(null)
        return
      }

      if (params?.sourceChain && params?.destinationChain && params?.token) {
        const sdk = resolveSdk(params.sourceChain, params.destinationChain)
        if (!sdk) throw new Error('Route not supported')
        if (sdk === 'ParaSpellApi') await calculateXcmFees() // verify isSwap false
        if (sdk === 'SnowbridgeApi') await calculateSnowbridgeFees()
        // if (sdk === 'ParaSpellApi') calculateXcmSWAPFees() // isSwap true
      }
    } catch (error) {
      setSourceChainFee(null)
      setBridgingFee(null)
      captureException(error)
      console.error('Fee context error', error)
    } finally {
      setLoading(false)
    }
  }, [params, calculateXcmFees, calculateSnowbridgeFees])

  useEffect(() => {
    fetchFees()
  }, [fetchFees])

  return (
    <FeeContext.Provider
      value={{
        loading,
        sourceChainfee,
        bridgingFee,
        canPayFees,
        canPayAdditionalFees,
        refetch: () => fetchFees(),
        setParams,
      }}
    >
      {children}
    </FeeContext.Provider>
  )
}

export default FeeProvider
