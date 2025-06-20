'use client'

import { TGetXcmFeeResult } from '@paraspell/sdk'
import { Chain, Token } from '@velocitylabs-org/turtle-registry'
import { createContext, useCallback, useEffect, useState } from 'react'
import builderManager from '@/services/builder'
import { getPlaceholderAddress } from '@/utils/address'

export const FeeContext = createContext<{
  canPayFees: boolean
  setCanPayFees: (canPayFees: boolean) => void
  canPayAdditionalFees: boolean
  setCanPayAdditionalFeesGlobally: (canPayAdditionalFees: boolean) => void
  setParams: (params: { sourceChain: Chain; destinationChain: Chain; token: Token }) => void
  xcmFees: TGetXcmFeeResult | null
  isSufficientFee: (source: 'origin' | 'destination') => boolean
}>({
  canPayFees: false,
  setCanPayFees: () => {},
  canPayAdditionalFees: false,
  setCanPayAdditionalFeesGlobally: () => {},
  setParams: () => {},
  xcmFees: null,
  isSufficientFee: () => false,
})

export const FeeProvider = ({ children }: { children: React.ReactNode }) => {
  const [canPayFees, setCanPayFees] = useState(false)
  const [canPayAdditionalFees, setCanPayAdditionalFees] = useState(false)
  const [xcmFees, setXcmFees] = useState<TGetXcmFeeResult | null>(null)
  const [params, setParams] = useState<{
    sourceChain: Chain
    destinationChain: Chain
    token: Token
  }>()

  const calculateXcmFees = useCallback(async () => {
    if (!params) {
      return
    }

    const fees = await builderManager.getOriginAndDestinationXcmFee({
      from: params.sourceChain,
      to: params.destinationChain,
      token: params.token,
      address: getPlaceholderAddress(params.destinationChain.supportedAddressTypes[0]),
      senderAddress: getPlaceholderAddress(params.sourceChain.supportedAddressTypes[0]),
    })

    setXcmFees(fees)
  }, [params])

  const isSufficientFee = (source: 'origin' | 'destination') => {
    // We consider DryRun as a sufficient.
    if (xcmFees?.[source]?.feeType === 'dryRun' || xcmFees?.[source]?.feeType !== 'paymentInfo')
      return true

    if (
      xcmFees?.[source]?.feeType === 'paymentInfo' &&
      xcmFees?.[source]?.sufficient === undefined &&
      source === 'destination'
    ) {
      // Notify user to about a potential token change between destination native token to the sent token.
      // setNotifyFeesMayChange or setVerifyDestFeesBalance
      // ...maybe not directly here, but in the parent component
    }

    // We consider PaymentInfo true and undefined as a sufficient.
    return xcmFees?.[source]?.sufficient !== false
  }

  // TODO: on pause for a second, while we work on the provider itself
  useEffect(() => {
    if (params?.sourceChain && params?.destinationChain && params?.token) {
      // Leaving these here for now, useful for the next feature
      // const node = getParaSpellNode(params.sourceChain)
      // const feeAssets = getFeeAssets(node as TNodeDotKsmWithRelayChains)

      calculateXcmFees()
    }
  }, [calculateXcmFees, params])

  return (
    <FeeContext.Provider
      value={{
        canPayFees,
        setCanPayFees,
        canPayAdditionalFees,
        setCanPayAdditionalFeesGlobally: setCanPayAdditionalFees,
        setParams,
        xcmFees,
        isSufficientFee,
      }}
    >
      {children}
    </FeeContext.Provider>
  )
}

export default FeeProvider
