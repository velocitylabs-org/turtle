import { Chain } from '@/models/chain'
import { SupportedChains } from '@/utils/papi'
import { dotAh } from '@polkadot-api/descriptors'
import { captureException } from '@sentry/nextjs'
import { createClient, TypedApi } from 'polkadot-api'
import { getWsProvider } from 'polkadot-api/ws-provider/web'
import { useEffect, useState } from 'react'

/** A hook to expose a Polkadot API connection. */
const usePapi = (chain?: Chain | null) => {
  const [api, setApi] = useState<TypedApi<SupportedChains>>()
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const startClient = async () => {
      try {
        if (!chain || !chain.rpcConnection) return
        setLoading(true)

        const jsonRpcProvider = getWsProvider(chain.rpcConnection)

        const client = createClient(jsonRpcProvider)

        // TODO: decide to remove these logs
        client.finalizedBlock$.subscribe(finalizedBlock =>
          console.log(finalizedBlock.number, finalizedBlock.hash),
        )

        const dotAssetHubApi = client.getTypedApi(dotAh)
        setApi(dotAssetHubApi)
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
