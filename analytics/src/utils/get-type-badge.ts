import { type Chain, tokensById } from '@velocitylabs-org/turtle-registry'
import { ethereumChain, moonbeamChain, relayChain } from '@/constants'
import { getSrcFromLogo } from './get-src-from-logo'

// This helper function returns the type badge for a given token (e.g., Ethereum, Polkadot or Solana)
export default function getTypeBadge(tokenId: string) {
  const token = tokensById[tokenId]

  let type: Chain
  switch (token.origin.type) {
    case 'Ethereum':
      type = ethereumChain
      break
    case 'Solana':
      type = moonbeamChain
      break
    case 'Polkadot':
    default:
      type = relayChain
      break
  }

  return {
    logoURI: getSrcFromLogo(token),
    typeURI: getSrcFromLogo(type),
  }
}
