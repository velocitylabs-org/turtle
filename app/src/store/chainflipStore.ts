import { SwapSDK, SwapSDKOptions } from '@chainflip/sdk/swap'
import { QueryClient } from '@tanstack/react-query'
import { create } from 'zustand'
import {
  canFetchQuote,
  ChainflipQuoteParams,
  getQuote,
  quoteQueryKey,
} from '@/hooks/useChainflipQuote'
import { ChainflipQuote } from '@/utils/chainflip'

interface ChainflipSdk {
  sdk: SwapSDK | null
  initSdk: () => SwapSDK
  getCachedQuote: (qc: QueryClient, params: ChainflipQuoteParams) => ChainflipQuote | null
  fetchNewQuote: (qc: QueryClient, params: ChainflipQuoteParams) => Promise<ChainflipQuote | null>
}

export const useChainflipStore = create<ChainflipSdk>()((set, get) => ({
  sdk: null,

  initSdk: () => {
    const chainflipSdk = get().sdk
    if (chainflipSdk) return chainflipSdk

    const options = {
      network: 'mainnet',
      enabledFeatures: { dca: true },
    } as SwapSDKOptions

    const swapSDK = new SwapSDK(options)

    set({ sdk: swapSDK })
    return swapSDK
  },

  getCachedQuote: (queryClient, params) => {
    if (!canFetchQuote(params)) return null
    return (queryClient.getQueryData(quoteQueryKey(params)) as ChainflipQuote) ?? null
  },

  fetchNewQuote: async (queryClient, params) => {
    if (!canFetchQuote(params)) return null
    return queryClient.fetchQuery({
      queryKey: quoteQueryKey(params),
      queryFn: async () => await getQuote(params),
      staleTime: 60_000,
      retry: 2,
    })
  },
}))
