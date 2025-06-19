import { useQuery } from '@tanstack/react-query'
import { Chain, Token } from '@velocitylabs-org/turtle-registry'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { getCachedTokenPrice } from '@/services/balance'
import builderManager from '@/services/builder'
import { useFeesStore } from '@/store/fees'
import { useFormStore } from '@/store/form'
import { getPlaceholderAddress, getRecipientAddress } from '@/utils/address'
import { getNativeToken } from '@/utils/paraspellTransfer'
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

  const { setSourceChainFee, setIsLoading, setFees, setCanPayFees } = useFeesStore(
    useShallow(state => ({
      setSourceChainFee: state.setSourceChainFee,
      setCanPayFees: state.setCanPayFees,
      setIsLoading: state.setIsLoading,
      setFees: state.setFees,
    })),
  )

  const unsubscribe = useFeesStore.subscribe(
    state => state.fees,
    async fees => {
      if (!fees || !sourceChain) {
        return
      }

      const sourceFeeToken = getNativeToken(sourceChain as Chain)
      const sourcefee = fees.fee ?? 0n

      // this shouldn't be happen here
      const feeTokenInDollars = (await getCachedTokenPrice(sourceFeeToken))?.usd

      setSourceChainFee({
        // this could easily be retrived from the store itself, without having to pass it here
        amount: sourcefee,
        // we already have the token in the store, I don't see the point of passing it here again
        // it's just more confusing
        // token: sourceFeeToken,

        // this we can calculate in place where we need it, in TxSummary
        inDollars: feeTokenInDollars ? toHuman(sourcefee, sourceFeeToken) * feeTokenInDollars : 0,
      })

      let isSufficientFee = !!fees.sufficient

      if (fees.feeType === 'paymentInfo' && sourceWallet?.sender?.address && sourceToken?.amount) {
        isSufficientFee = true
      }

      setCanPayFees(isSufficientFee)
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

      if (!sourceChain || !destinationChain || !sourceToken) {
        return null
      }
      const recipient = getRecipientAddress(manualRecipient, destinationWallet)

      const fees = await builderManager.getOriginAndDestinationXcmFee({
        from: sourceChain,
        to: destinationChain,
        token: sourceToken.token as Token,
        address: recipient ?? getPlaceholderAddress(destinationChain.supportedAddressTypes[0]),
        senderAddress:
          sourceWallet?.sender?.address ??
          getPlaceholderAddress(sourceChain.supportedAddressTypes[0]),
        amount: sourceToken && safeConvertAmount(sourceToken.amount, sourceToken.token),
      })

      if (!fees) return null
      const { origin: sourceFeePayload } = fees

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
    }
  }, [unsubscribe])

  return null
}

export default XcmFees
