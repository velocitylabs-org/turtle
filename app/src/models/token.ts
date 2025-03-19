import { REGISTRY } from '@/registry/mainnet/mainnet'
import { TMultiLocation } from '@paraspell/sdk'
import { deepEqual } from '@paraspell/sdk-common'
import { captureException } from '@sentry/nextjs'

export interface Token {
  id: string
  name: string
  logoURI: string
  symbol: string
  decimals: number
  address: string
  // The xcm multilocation of an asset serves as a contextual identifier of said asset.
  // Learn more at https://guide.kusama.network/docs/learn/xcm/fundamentals/multilocation-summary
  multilocation: TMultiLocation
  // The coingeko token id, used to fetch the token price. It's not always the token symbol.
  // Examples:
  //   - https://www.coingecko.com/en/coins/bifrost-native-coin
  //   - https://www.coingecko.com/en/coins/weth
  //   - https://www.coingecko.com/en/coins/ethereum
  coingeckoId?: string
  // The origin of this token
  origin: Origin
}

// The supported bridges. Each bridge will have it's own wrapped version of a token
export type Bridge = 'Snowbridge' | 'Other'

// The origin of a token
export type Origin = { type: 'Ethereum'; bridge: Bridge } | { type: 'Polkadot'; paraId: number }

export function getCoingekoId(token: Token): string {
  return token.coingeckoId ?? token.name.toLocaleLowerCase().replaceAll(' ', '-')
}

export function getTokenByMultilocation(multilocation: TMultiLocation): Token | undefined {
  const token = REGISTRY.tokens.find(token => deepEqual(token.multilocation, multilocation))

  // Usually a token should be found, so log a warning if not
  if (!token)
    captureException(new Error('Token multilocation not found'), {
      level: 'warning',
      extra: { multilocation },
    })

  return token
}
