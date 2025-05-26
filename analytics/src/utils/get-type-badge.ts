import { tokensById } from '@velocitylabs-org/turtle-registry'
import { ethereumChain, relayChain } from '@/constants'
import { getSrcFromLogo } from './get-src-from-logo'

// This helper function returns the type badge for a given token (e.g., Ethereum or Polkadot)
export default function getTypeBadge(tokenId: string) {
  const token = tokensById[tokenId]
  const type = token.origin.type === 'Ethereum' ? ethereumChain : relayChain

  return {
    logoURI: getSrcFromLogo(token),
    typeURI: getSrcFromLogo(type),
  }
}
