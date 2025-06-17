'use client'

import { TGetXcmFeeResult } from '@paraspell/sdk'
import { Chain, Token } from '@velocitylabs-org/turtle-registry'
import { createContext, useCallback, useEffect, useState } from 'react'
import builderManager from '@/services/builder'
import { getPlaceholderAddress } from '@/utils/address'
import { resolveSdk } from '@/utils/routes'
import { safeConvertAmount } from '@/utils/transfer'

type BaseFeeParams = {
  sourceChain: Chain
  destinationChain: Chain
  token: Token
  destToken?: Token | null
}

type OptionalFeeParams = {
  recipient?: string
  sender?: string
  amount?: number | null
}

export const FeeContext = createContext<{
  canPayFees: boolean
  setCanPayFees: (canPayFees: boolean) => void
  canPayAdditionalFees: boolean
  setCanPayAdditionalFeesGlobally: (canPayAdditionalFees: boolean) => void
  setParams: (params: BaseFeeParams & OptionalFeeParams) => void
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
  const [params, setParams] = useState<BaseFeeParams & OptionalFeeParams>()

  const calculateXcmFees = useCallback(async () => {
    if (!params) {
      return
    }

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
    // if (!feesPayload) return
    // const { origin: sourceFeePayload, destination: destinationFeePayload } = feesPayload

    setXcmFees(feesPayload)
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
      const sdk = resolveSdk(params.sourceChain, params.destinationChain)
      if (!sdk) throw new Error('Route not supported')
      if (sdk === 'ParaSpellApi') calculateXcmFees()
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
