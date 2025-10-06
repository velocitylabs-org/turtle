import { SwapSDK, type SwapSDKOptions } from '@chainflip/sdk/swap'
import type { QueryClient } from '@tanstack/react-query'
import { create } from 'zustand'
import { type ChainflipQuoteParams, canFetchQuote, getQuote, quoteQueryKey } from '@/hooks/useChainflipQuote'
import type { TransferParams } from '@/hooks/useTransfer'
import type { ChainflipQuote } from '@/utils/chainflip'

interface ChainflipSdk {
  sdk: SwapSDK | null
  initSdk: () => SwapSDK
  getChainflipStoredQuote: (qc: QueryClient, params: TransferParams) => Promise<ChainflipQuote>
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

  getChainflipStoredQuote: async (qc, params): Promise<ChainflipQuote> => {
    const qp: ChainflipQuoteParams = {
      sourceChain: params.sourceChain,
      destinationChain: params.destinationChain,
      sourceToken: params.sourceToken,
      destinationToken: params.destinationToken,
      amount: params.sourceAmount.toString(),
    }
    if (!canFetchQuote(qp)) throw new Error('No Chainflip quote available')

    return await qc.ensureQueryData({
      queryKey: quoteQueryKey(qp),
      queryFn: async () => {
        const quote = await getQuote(qp)
        if (!quote) throw new Error('No Chainflip quote available')
        return quote
      },
      staleTime: 60_000,
      retry: 2,
    })
  },
}))
