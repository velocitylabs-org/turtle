import { dotAh } from '@polkadot-api/descriptors'
import { captureException } from '@sentry/nextjs'
import { createClient, TypedApi } from 'polkadot-api'
import { chainSpec as chainSpecRelay } from 'polkadot-api/chains/polkadot'
import { chainSpec } from 'polkadot-api/chains/polkadot_asset_hub'
import { getSmProvider } from 'polkadot-api/sm-provider'
import { start } from 'polkadot-api/smoldot'
import { useEffect, useState } from 'react'

/**
 * A hook to expose a Polkadot API connection.
 * It handles the connection setup to the Polkadot Asset Hub and the relay chain.
 */
const usePapi = () => {
  // TODO: support multiple chains
  const [api, setApi] = useState<TypedApi<typeof dotAh> | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const startClient = async () => {
      try {
        setLoading(true)
        const smoldot = start()

        const relayChain = await smoldot.addChain({ chainSpec: chainSpecRelay })
        const assetHubChain = await smoldot.addChain({
          chainSpec: chainSpec,
          potentialRelayChains: [relayChain],
        })

        const client = createClient(getSmProvider(assetHubChain))

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
  }, [])

  return { api, loading }
}

export default usePapi
