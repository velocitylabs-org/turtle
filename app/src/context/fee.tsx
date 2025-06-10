'use client'

import { getFeeAssets, TNodeDotKsmWithRelayChains } from '@paraspell/sdk'
import { Chain, Token } from '@velocitylabs-org/turtle-registry'
import { createContext, useCallback, useEffect, useState } from 'react'
import builderManager from '@/services/builder'
import { getPlaceholderAddress } from '@/utils/address'
import { getParaSpellNode } from '@/utils/paraspellTransfer'

export const FeeContext = createContext<{
  canPayFees: boolean
  setCanPayFeesGlobally: (canPayFees: boolean) => void
  canPayAdditionalFees: boolean
  setCanPayAdditionalFeesGlobally: (canPayAdditionalFees: boolean) => void
  setParams: (params: { sourceChain: Chain; destinationChain: Chain; token: Token }) => void
}>({
  canPayFees: false,
  setCanPayFeesGlobally: () => {},
  canPayAdditionalFees: false,
  setCanPayAdditionalFeesGlobally: () => {},
  setParams: () => {},
})

export const FeeProvider = ({ children }: { children: React.ReactNode }) => {
  const [canPayFees, setCanPayFees] = useState(false)
  const [canPayAdditionalFees, setCanPayAdditionalFees] = useState(false)

  // chains[0] => sourceChain
  // chains[1] => destinationChain
  const [params, setParams] = useState<{
    sourceChain: Chain
    destinationChain: Chain
    token: Token
  }>()

  const checkIfFeeIsPayableWithNativeToken = useCallback(async () => {
    if (!params) {
      return
    }

    const fee = await builderManager.getOriginXcmFee({
      from: params.sourceChain,
      to: params.destinationChain,
      token: params.token,
      address: getPlaceholderAddress(params.sourceChain.supportedAddressTypes[0]),
      senderAddress: getPlaceholderAddress(params.sourceChain.supportedAddressTypes[0]),
    })

    console.log('getting xcm fee', fee)
  }, [params])

  useEffect(() => {
    if (params?.sourceChain && params?.destinationChain && params?.token) {
      const node = getParaSpellNode(params.sourceChain)
      const feeAssets = getFeeAssets(node as TNodeDotKsmWithRelayChains)
      console.log(feeAssets)

      checkIfFeeIsPayableWithNativeToken()
    }
  }, [checkIfFeeIsPayableWithNativeToken, params])

  return (
    <FeeContext.Provider
      value={{
        canPayFees,
        setCanPayFeesGlobally: setCanPayFees,
        canPayAdditionalFees,
        setCanPayAdditionalFeesGlobally: setCanPayAdditionalFees,
        setParams,
      }}
    >
      {children}
    </FeeContext.Provider>
  )
}

export default FeeProvider
