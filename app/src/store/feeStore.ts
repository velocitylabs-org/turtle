'use client'

import { TGetXcmFeeResult } from '@paraspell/sdk'
import { Chain, Token } from '@velocitylabs-org/turtle-registry'
import { create } from 'zustand'
import builderManager from '@/services/builder'
import { getPlaceholderAddress } from '@/utils/address'

interface FeeState {
  canPayFees: boolean
  setCanPayFees: (canPayFees: boolean) => void
  canPayAdditionalFees: boolean
  setCanPayAdditionalFeesGlobally: (canPayAdditionalFees: boolean) => void
  xcmFees: TGetXcmFeeResult | null
  params?: {
    sourceChain: Chain
    destinationChain: Chain
    token: Token
  }
  setParams: (params: { sourceChain: Chain; destinationChain: Chain; token: Token }) => void
  isSufficientFee: (source: 'origin' | 'destination') => boolean
  calculateXcmFees: () => Promise<void>
}

export const useFeeStore = create<FeeState>((set, get) => ({
  canPayFees: false,
  setCanPayFees: (canPayFees) => set({ canPayFees }),
  canPayAdditionalFees: false,
  setCanPayAdditionalFeesGlobally: (canPayAdditionalFees) => set({ canPayAdditionalFees }),
  xcmFees: null,
  params: undefined,
  setParams: (params) => {
    set({ params });
    // Call calculateXcmFees after setting params
    const { calculateXcmFees } = get();
    if (params.sourceChain && params.destinationChain && params.token) {
      // Leaving these here for now, useful for the next feature
      // const node = getParaSpellNode(params.sourceChain)
      // const feeAssets = getFeeAssets(node as TNodeDotKsmWithRelayChains)

      calculateXcmFees();
    }
  },
  isSufficientFee: (source) => {
    const { xcmFees } = get();
    // We consider DryRun as a sufficient.
    if (xcmFees?.[source]?.feeType === 'dryRun' || xcmFees?.[source]?.feeType !== 'paymentInfo')
      return true;

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
    return xcmFees?.[source]?.sufficient !== false;
  },
  calculateXcmFees: async () => {
    const { params } = get();
    if (!params) {
      return;
    }

    const fees = await builderManager.getOriginAndDestinationXcmFee({
      from: params.sourceChain,
      to: params.destinationChain,
      token: params.token,
      address: getPlaceholderAddress(params.destinationChain.supportedAddressTypes[0]),
      senderAddress: getPlaceholderAddress(params.sourceChain.supportedAddressTypes[0]),
    });

    set({ xcmFees: fees });
  },
}));