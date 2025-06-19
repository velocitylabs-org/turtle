import { TXcmFeeDetail } from '@paraspell/sdk'
import { create } from 'zustand'
import { AmountInfo } from '@/models/transfer'
import { subscribeWithSelector } from 'zustand/middleware'

interface FeesStore {
  fees: TXcmFeeDetail
  canPayFees: boolean
  canPayAdditionalFees: boolean
  sourceChainFee: Pick<AmountInfo, 'amount' | 'inDollars'> | null
  bridgingFee: AmountInfo | null
  loading: boolean
  setIsLoading: (loading: boolean) => void
  setFees: (fees: TXcmFeeDetail) => void
  setCanPayFees: (canPayFees: boolean) => void
  setCanPayAdditionalFees: (canPayAdditionalFees: boolean) => void
  setSourceChainFee: (sourceChainfee: Pick<AmountInfo, 'amount' | 'inDollars'>) => void
  setBridgingFee: (bridgingFee: AmountInfo) => void
}

export const useFeesStore = create(
  subscribeWithSelector<FeesStore>(set => ({
    fees: {} as TXcmFeeDetail,
    canPayFees: false,
    canPayAdditionalFees: false,
    sourceChainFee: null,
    bridgingFee: null,
    loading: false,
    setIsLoading: (loading: boolean) => set({ loading }),
    setFees: (fees: TXcmFeeDetail) => set({ fees }),
    setCanPayFees: (canPayFees: boolean) => set({ canPayFees }),
    setCanPayAdditionalFees: (canPayAdditionalFees: boolean) => set({ canPayAdditionalFees }),
    setSourceChainFee: (sourceChainFee: Pick<AmountInfo, 'amount' | 'inDollars'>) =>
      set({ sourceChainFee }),
    setBridgingFee: (bridgingFee: AmountInfo) => set({ bridgingFee }),
  })),
)
