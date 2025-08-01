import { SwapSDK, SwapSDKOptions } from '@chainflip/sdk/swap'
import { create } from 'zustand'

interface ChainflipSdk {
  sdk: SwapSDK | null
  initSdk: () => SwapSDK
}

export const useChainflipSdk = create<ChainflipSdk>()((set, get) => ({
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
}))
