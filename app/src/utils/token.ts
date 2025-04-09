import { deepEqual, TMultiLocation } from '@paraspell/sdk'
import { captureException } from '@sentry/nextjs'
import { Token } from '@/models/token'
import { REGISTRY } from '@/registry/mainnet/mainnet'

export function getCoingekoId(token: Token): string {
  return token.coingeckoId ?? token.name.toLocaleLowerCase().replaceAll(' ', '-')
}

export function getTokenByMultilocation(multilocation: TMultiLocation): Token | undefined {
  const token = REGISTRY.tokens.find(token => deepEqual(token.multilocation, multilocation))

  // Usually a token should be found, so log a warning if not
  if (!token)
    captureException(new Error('Token not found by multilocation'), {
      level: 'warning',
      extra: { multilocation },
    })

  return token
}
