import { tokensById } from '@/constants'
import { ethereumChain, relayChain } from '@/constants'

// This helper function returns the type badge for a given token (e.g., Ethereum or Polkadot)
export default function getTypeBadge(tokenId: string) {
  const token = tokensById[tokenId]
  let type
  if (token.origin.type === 'Ethereum') type = ethereumChain
  if (token.origin.type === 'Polkadot') type = relayChain

  return {
    logoURI: (token.logoURI as Record<string, string>).src,
    typeURI: (type?.logoURI as Record<string, string>).src || '',
  }
}
