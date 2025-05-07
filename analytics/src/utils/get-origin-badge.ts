import { Token } from '@/models/Token'
import { Chain } from '@/models/Chain'

interface OriginBadge {
  logoURI: string
  text: string
}

export default function getOriginBadge(
  token: Token,
  sourceChain: Chain | null,
): OriginBadge | undefined {
  if (!sourceChain || !token.origin) return

  if (sourceChain.network === 'Ethereum' && token.origin.type === 'Ethereum')
    return {
      logoURI: '/logos/ethereum.svg',
      text: `Ethereum ${token.symbol}`,
    }
  if (sourceChain.network === 'Polkadot' && token.origin.type === 'Polkadot')
    return {
      logoURI: '/logos/polkadot.svg',
      text: `Polkadot ${token.symbol}`,
    }
  if (sourceChain.network === 'Polkadot' && token.origin.type === 'Ethereum') {
    switch (token.origin.bridge) {
      case 'Snowbridge':
        return { logoURI: '/logos/snowbridge-badge.svg', text: `Snowbridge ${token.symbol}` }
      default:
        return
    }
  }

  // Just specific for analytics
  if (sourceChain.network === 'Ethereum' && token.origin.type === 'Polkadot') {
    return {
      logoURI: '/logos/polkadot.svg',
      text: `Polkadot ${token.symbol}`,
    }
  }

  return
}
