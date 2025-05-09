import { Chain } from '@/models/chain'
import { Tooltip } from '@velocitylabs-org/turtle-ui'
import { Token } from '@/models/token'
import { FC } from 'react'
import { cn } from '@/utils/helper'
import { Icon } from './Icon'

import EthereumLogo from '@/assets/logos/ethereum.svg'
import PolkadotLogo from '@/assets/logos/polkadot.svg'
import SnowbridgeLogo from '@/assets/logos/snowbridge-badge.svg'

interface TokenLogoProps {
  token: Token
  sourceChain: Chain | null
  size?: number
  className?: string
}

export const TokenLogo: FC<TokenLogoProps> = ({ token, sourceChain, size = 32, className }) => {
  const originBadge = getOriginBadge(token, sourceChain)

  return (
    <Tooltip content={originBadge?.text ?? token.symbol} showIcon={false}>
      <div className={cn('relative flex items-center', className)}>
        {/* The token logo */}
        <Icon width={size} height={size} src={token.logoURI} className="border-turtle-foreground" />

        {/* The origin badge */}
        {originBadge && (
          <Icon
            width={size / 2}
            height={size / 2}
            src={originBadge.logoURI}
            className="absolute bottom-[-5%] right-[-10%] border-white"
          />
        )}
      </div>
    </Tooltip>
  )
}

interface OriginBadge {
  logoURI: string
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
function getOriginBadge(token: Token, sourceChain: Chain | null): OriginBadge | undefined {
  // Older versions of Turtle did not include a `token.origin` so we need to play safe
  if (!sourceChain || !token.origin) return

  if (sourceChain.network == 'Ethereum' && token.origin.type === 'Ethereum')
    return {
      logoURI: EthereumLogo,
      text: `Ethereum ${token.symbol}`,
    }
  if (sourceChain.network === 'Polkadot' && token.origin.type === 'Polkadot')
    return {
      logoURI: PolkadotLogo,
      text: `Polkadot ${token.symbol}`,
    }
  if (sourceChain.network === 'Polkadot' && token.origin.type === 'Ethereum') {
    switch (token.origin.bridge) {
      case 'Snowbridge':
        return {
          logoURI: SnowbridgeLogo,
          text: `Snowbridge ${token.symbol}`,
        }
      default:
        return
    }
  }

  return
}
