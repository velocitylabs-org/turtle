import { TXcmFeeDetail } from '@paraspell/sdk'
import { create } from 'zustand'
import { AmountInfo } from '@/models/transfer'

export const useFeesStore = create<{
  fees: TXcmFeeDetail | null
  canPayFees: boolean
  canPayAdditionalFees: boolean
  sourceChainFee: AmountInfo | null
  bridgingFee: AmountInfo | null
  loading: boolean
  setFees: (fees: TXcmFeeDetail) => void
  setCanPayFees: (canPayFees: boolean) => void
  setCanPayAdditionalFees: (canPayAdditionalFees: boolean) => void
  setSourceChainFee: (sourceChainfee: AmountInfo) => void
  setBridgingFee: (bridgingFee: AmountInfo) => void
}>(set => ({
  fees: null,
  canPayFees: false,
  canPayAdditionalFees: false,
  sourceChainFee: null,
  bridgingFee: null,
  loading: false,
  setFees: (fees: TXcmFeeDetail) => set({ fees }),
  setCanPayFees: (canPayFees: boolean) => set({ canPayFees }),
  setCanPayAdditionalFees: (canPayAdditionalFees: boolean) => set({ canPayAdditionalFees }),
  setSourceChainFee: (sourceChainFee: AmountInfo) => set({ sourceChainFee }),
  setBridgingFee: (bridgingFee: AmountInfo) => set({ bridgingFee }),
}))
