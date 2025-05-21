import { tokensById } from '@/constants'
import { ethereumChain, relayChain } from '@/constants'
import { getSrcFromLogo } from './get-src-from-logo'

// This helper function returns the type badge for a given token (e.g., Ethereum or Polkadot)
export default function getTypeBadge(tokenId: string) {
  const token = tokensById[tokenId]
  let type
  if (token.origin.type === 'Ethereum') type = ethereumChain
  if (token.origin.type === 'Polkadot') type = relayChain

  return {
    logoURI: getSrcFromLogo(token),
    typeURI: getSrcFromLogo(type),
  }
}
