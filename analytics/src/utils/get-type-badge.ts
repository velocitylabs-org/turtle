import { tokensById } from '@/registry/tokens'
import { Ethereum, RelayChain } from '@/registry/chains'

// This helper function returns the type badge for a given token (e.g. Ethereum or Polkadot)
export default function getTypeBadge(tokenId: string) {
  const token = tokensById[tokenId]
  const typeURI = (token.origin.type === 'Ethereum' && Ethereum.logoURI) || (token.origin.type === 'Polkadot' && RelayChain.logoURI)

  return {
    logoURI: token.logoURI,
    typeURI: typeURI || '',
  }
}