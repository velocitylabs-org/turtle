import { Chain } from '@/models/chain'
import { getApiDescriptorForChain, SupportedChains } from '@/utils/papi'
import { captureException } from '@sentry/nextjs'
import { createClient, TypedApi } from 'polkadot-api'
import { getWsProvider } from 'polkadot-api/ws-provider/web'
import { useEffect, useState } from 'react'

/** A hook to expose a Polkadot API connection. */
const usePapi = <T extends SupportedChains>(chain?: Chain | null) => {
  const [api, setApi] = useState<TypedApi<T>>()
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const startClient = async () => {
      try {
        if (!chain || !chain.rpcConnection) return

        setLoading(true)
        const jsonRpcProvider = getWsProvider(chain.rpcConnection)
        const client = createClient(jsonRpcProvider)

        const descriptor = getApiDescriptorForChain(chain)
        const dotAssetHubApi = client.getTypedApi(descriptor)
        setApi(dotAssetHubApi as TypedApi<T>)
      } catch (error) {
        console.error('Failed to start Polkadot API client', error)
        captureException(error)
      } finally {
        setLoading(false)
      }
    }

    startClient()
  }, [chain])

  return { api, loading }
}

export default usePapi
