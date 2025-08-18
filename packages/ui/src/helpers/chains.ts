import ethereumLogo from '@velocitylabs-org/turtle-assets/logos/ethereum.svg'
import kusamaLogo from '@velocitylabs-org/turtle-assets/logos/kusama.svg'
import wormholeLogo from '@velocitylabs-org/turtle-assets/logos/moonbeam.svg'
import polkadotLogo from '@velocitylabs-org/turtle-assets/logos/polkadot.svg'
import snowbridgeLogo from '@velocitylabs-org/turtle-assets/logos/snowbridge.svg'
import type { Chain, Token } from '@velocitylabs-org/turtle-registry'

interface OriginBadge {
  logoURI: string | Record<string, string>
  text: string
}

/**
 *  Get the origin badge info for `token` given the context that it's being sent from `sourceChain`.
 *  We don't display a badge if the token is native to the soureChain or it's network.
 *  E.g:
 *    - When sourceChain is Ethereum and the token is wETH, we do *NOT* show an origin badge
 *   - When sourceChain is Hydration and the token is Polkadot-native USDC, we do *NOT* show an origin badge
 *    - When sourceChain is AsssetHub and the token is (snowbridge-wrapped) wETH, we *DO* show an origin badge
 */
export function getOriginBadge(token: Token, sourceChain: Chain | null): OriginBadge | undefined {
  // Older versions of Turtle did not include a `token.origin` so we need to play safe
  if (!sourceChain || !token.origin) return

  if (sourceChain.network === 'Ethereum' && token.origin.type === 'Ethereum') {
    return {
      logoURI: ethereumLogo,
      text: `Ethereum ${token.symbol}`,
    }
  }

  if (sourceChain.network === 'Polkadot' && token.origin.type === 'Polkadot') {
    return {
      logoURI: polkadotLogo,
      text: `Polkadot ${token.symbol}`,
    }
  }

  if (sourceChain.network === 'Polkadot' && token.origin.type === 'Ethereum') {
    if (token.origin.bridge === 'Snowbridge') {
      return {
        logoURI: snowbridgeLogo,
        text: `Snowbridge ${token.symbol}`,
      }
    }
  }

  if (sourceChain.network === 'Kusama' && token.origin.type === 'Polkadot') {
    return {
      logoURI: kusamaLogo,
      text: `Kusama ${token.symbol}`,
    }
  }

  if (sourceChain.network === 'Polkadot' && token.origin.type === 'Solana') {
    if (token.origin.bridge === 'Wormhole') {
      return {
        logoURI: wormholeLogo,
        text: `Wormhole ${token.symbol}`,
      }
    }
  }

  return
}
