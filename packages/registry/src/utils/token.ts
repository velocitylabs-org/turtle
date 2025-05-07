import { deepEqual, TMultiLocation } from '@paraspell/sdk'
import { Token } from '../types'
import { REGISTRY } from '../mainnet'

export function getCoingekoId(token: Token): string {
  return token.coingeckoId ?? token.name.toLocaleLowerCase().replaceAll(' ', '-')
}

export function getTokenByMultilocation(multilocation: TMultiLocation): Token | undefined {
  // If turtle doesn't support the token it won't be found
  return REGISTRY.tokens.find(token => deepEqual(token.multilocation, multilocation))
}

export function isSameToken(token1: Token, token2: Token): boolean {
  return token1.id === token2.id
}
