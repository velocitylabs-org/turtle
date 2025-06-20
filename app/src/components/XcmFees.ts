import { useQuery } from '@tanstack/react-query'
import {
  Chain,
  Environment,
  PolkadotTokens,
  Token,
  TokenAmount,
} from '@velocitylabs-org/turtle-registry'
import { isEmpty, isEqual } from 'lodash'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import useBalance from '@/hooks/useBalance'
import { getCachedBridgingFee, getCachedTokenPrice } from '@/services/balance'
import builderManager from '@/services/builder'
import { useFeesStore } from '@/store/fees'
import { useFormStore } from '@/store/form'
import { getPlaceholderAddress, getRecipientAddress } from '@/utils/address'
import { getNativeToken, isChainSupportingToken } from '@/utils/paraspellTransfer'
import { safeConvertAmount, toHuman } from '@/utils/transfer'

const XcmFees = () => {
  const {
    sourceChain,
    destinationChain,
    sourceToken,
    manualRecipient,
    destinationWallet,
    sourceWallet,
  } = useFormStore(
    useShallow(state => ({
      sourceChain: state.sourceChain,
      destinationChain: state.destinationChain,
      sourceToken: state.sourceToken,
      manualRecipient: state.manualRecipient,
      destinationWallet: state.destinationWallet,
      sourceWallet: state.sourceWallet,
    })),
  )

  const {
    setIsLoading,
    setFees,
    setCanPayFees,
    setFeesInDollars,
    setCanPayAdditionalFees,
    setBridgingFee,
  } = useFeesStore(
    useShallow(state => ({
      setCanPayFees: state.setCanPayFees,
      setIsLoading: state.setIsLoading,
      setFees: state.setFees,
      setFeesInDollars: state.setFeesInDollars,
      setCanPayAdditionalFees: state.setCanPayAdditionalFees,
      setBridgingFee: state.setBridgingFee,
    })),
  )

  const { balance: dotBalance } = useBalance({
    env: Environment.Mainnet,
    chain: sourceChain,
    token:
      sourceChain && isChainSupportingToken(sourceChain, PolkadotTokens.DOT)
        ? PolkadotTokens.DOT
        : undefined,
    address: sourceWallet?.sender?.address,
  })

  const unsubscribe = useFeesStore.subscribe(
    () => {
      const { fees } = useFeesStore.getState()
      const { sourceChain } = useFormStore.getState()

      return [fees, sourceChain] as const
    },
    async ([fees, sourceChain], [prevFees, prevSourceChain]) => {
      if (
        isEmpty(fees) ||
        isEmpty(sourceChain) ||
        (isEqual(prevFees, fees) && isEqual(sourceChain, prevSourceChain))
      ) {
        return
      }

      console.log(
        'recalculating can pay fees and fees in dollars',
        fees,
        sourceChain,
        prevFees,
        prevSourceChain,
      )

      const sourceFeeToken = getNativeToken(sourceChain as Chain)
      const sourcefee = fees.fee ?? 0n

      const feeTokenInDollars = (await getCachedTokenPrice(sourceFeeToken))?.usd
      const feesInDollars = feeTokenInDollars
        ? toHuman(sourcefee, sourceFeeToken) * feeTokenInDollars
        : 0

      setFeesInDollars(feesInDollars)
      setCanPayFees(!!fees.sufficient)
    },
  )

  const unsubscribeEth = useFeesStore.subscribe(
    state => state.fees,
    async fees => {
      if (fees && destinationChain?.network === 'Ethereum') {
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
          sourceToken?.token === bridgeFeeToken ? BigInt(fees.fee ?? 0n) + bridgeFee : bridgeFee

        // if the dotBalance is not available, we act as if it's ok. This prevents a delay
        // in the UI showing the error label for insufficient fee balance, which is particularly
        // noticable when switching chains.
        setCanPayAdditionalFees(dotBalance == undefined || toPay < (dotBalance?.value ?? 0))
      }
    },
  )

  const { isPending } = useQuery({
    queryKey: [
      'fees',
      sourceChain,
      destinationChain,
      sourceToken,
      manualRecipient,
      destinationChain,
    ],
    queryFn: async () => {
      console.log('queryFn, fetching xcm fees')

      if (isEmpty(sourceChain) || isEmpty(destinationChain) || isEmpty(sourceToken)) {
        return null
      }

      const recipient = getRecipientAddress(manualRecipient, destinationWallet)

      const fees = await builderManager.getOriginAndDestinationXcmFee({
        from: sourceChain as Chain,
        to: destinationChain as Chain,
        token: (sourceToken as TokenAmount).token as Token,
        address:
          recipient ?? getPlaceholderAddress((destinationChain as Chain).supportedAddressTypes[0]),
        senderAddress:
          sourceWallet?.sender?.address ??
          getPlaceholderAddress((sourceChain as Chain).supportedAddressTypes[0]),
        amount: sourceToken && safeConvertAmount(sourceToken.amount, sourceToken.token),
      })

      if (!fees) return null
      const { origin: sourceFeePayload } = fees

      console.log('setting fees', sourceFeePayload)

      setFees(sourceFeePayload)

      return fees
    },
  })

  useEffect(() => {
    setIsLoading(isPending)
  }, [isPending, setIsLoading])

  useEffect(() => {
    return () => {
      unsubscribe()
      unsubscribeEth()
    }
  }, [unsubscribe, unsubscribeEth])

  return null
}

export default XcmFees
