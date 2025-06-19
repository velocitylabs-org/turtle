import { useQuery } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'
import useTransferForm from '@/hooks/useTransferForm'
import { getCachedTokenPrice } from '@/services/balance'
import builderManager from '@/services/builder'
import { useFeesStore } from '@/store/fees'
import { getPlaceholderAddress, getRecipientAddress } from '@/utils/address'
import { getNativeToken } from '@/utils/paraspellTransfer'
import { safeConvertAmount, toHuman } from '@/utils/transfer'

const useXcmFees = () => {
  const {
    sourceChain,
    destinationChain,
    sourceTokenAmount,
    manualRecipient,
    destinationWallet,
    sourceWallet,
  } = useTransferForm()

  const { setSourceChainFee } = useFeesStore(
    useShallow(state => ({
      setSourceChainFee: state.setSourceChainFee,
    })),
  )

  useFeesStore.subscribe(state => {
    console.log('state', state)
  })

  useQuery({
    queryKey: [
      'setSourceChainFee',
      sourceChain,
      destinationChain,
      sourceTokenAmount,
      manualRecipient,
    ],
    queryFn: async () => {
      const sourceToken = sourceTokenAmount?.token

      if (!sourceChain || !destinationChain || !sourceToken || !sourceTokenAmount) {
        return null
      }
      const recipient = getRecipientAddress(manualRecipient, destinationWallet)

      const fees = await builderManager.getOriginAndDestinationXcmFee({
        from: sourceChain,
        to: destinationChain,
        token: sourceToken,
        address: recipient ?? getPlaceholderAddress(destinationChain.supportedAddressTypes[0]),
        senderAddress:
          sourceWallet?.sender?.address ??
          getPlaceholderAddress(sourceChain.supportedAddressTypes[0]),
        amount: sourceTokenAmount && safeConvertAmount(sourceTokenAmount.amount, sourceToken),
      })

      if (!fees) return null
      const { origin: sourceFeePayload } = fees

      const sourceFeeToken = getNativeToken(sourceChain)
      const sourcefee = sourceFeePayload.fee ?? 0n
      const feeTokenInDollars = (await getCachedTokenPrice(sourceFeeToken))?.usd

      setSourceChainFee({
        amount: sourcefee,
        token: sourceFeeToken,
        inDollars: feeTokenInDollars ? toHuman(sourcefee, sourceFeeToken) * feeTokenInDollars : 0,
      })

      return fees
    },
  })
}

export default useXcmFees
