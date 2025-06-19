import { TXcmFeeDetail } from '@paraspell/sdk'
import { create } from 'zustand'
import { AmountInfo } from '@/models/transfer'
import { subscribeWithSelector } from 'zustand/middleware'

interface FeesStore {
  fees: TXcmFeeDetail
  feesInDollars: number
  canPayFees: boolean
  canPayAdditionalFees: boolean
  sourceChainFee: Pick<AmountInfo, 'amount' | 'inDollars'> | null
  bridgingFee: AmountInfo | null
  loading: boolean
  setIsLoading: (loading: boolean) => void
  setFees: (fees: TXcmFeeDetail) => void
  setFeesInDollars: (feesInDollars: number) => void
  setCanPayFees: (canPayFees: boolean) => void
  setCanPayAdditionalFees: (canPayAdditionalFees: boolean) => void
  setBridgingFee: (bridgingFee: AmountInfo) => void
}

export const useFeesStore = create(
  subscribeWithSelector<FeesStore>(set => ({
    fees: {} as TXcmFeeDetail,
    feesInDollars: 0,
    canPayFees: false,
    canPayAdditionalFees: false,
    sourceChainFee: null,
    bridgingFee: null,
    loading: false,
    setIsLoading: (loading: boolean) => set({ loading }),
    setFees: (fees: TXcmFeeDetail) => set({ fees }),
    setFeesInDollars: (feesInDollars: number) => set({ feesInDollars }),
    setCanPayFees: (canPayFees: boolean) => set({ canPayFees }),
    setCanPayAdditionalFees: (canPayAdditionalFees: boolean) => set({ canPayAdditionalFees }),
    setBridgingFee: (bridgingFee: AmountInfo) => set({ bridgingFee }),
  })),
)
