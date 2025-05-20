import { tokensById } from '@/constants'
import { ethereumChain, relayChain } from '@/constants'

// This helper function returns the type badge for a given token (e.g., Ethereum or Polkadot)
export default function getTypeBadge(tokenId: string) {
  const token = tokensById[tokenId]
  const typeURI =
    (token.origin.type === 'Ethereum' && ethereumChain.logoURI) ||
    (token.origin.type === 'Polkadot' && relayChain.logoURI)

  return {
    logoURI: token.logoURI,
    typeURI: typeURI.src || '',
  }
}
