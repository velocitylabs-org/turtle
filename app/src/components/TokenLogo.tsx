'use client'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import Image from 'next/image'
import React, { FC } from 'react'
import { Tooltip } from './Tooltip'
import { cn } from '@/utils/cn'

interface TokenLogoProps {
  token: Token
  sourceChain: Chain | null
  size?: number
  className?: string
}

export const TokenLogo: FC<TokenLogoProps> = ({ token, sourceChain, size = 32, className }) => {
  const originBadge = getOriginBadge(token, sourceChain)

  const heightClass = `h-[${size}px]`

  return (
    <Tooltip content={originBadge?.text ?? token.symbol} showIcon={false}>
      <div className={cn('relative flex items-center', heightClass, className)}>
        {/* The token logo */}
        <Image
          src={token.logoURI}
          alt={token.name}
          width={size}
          height={size}
          className={cn(
            'token-logo box-content overflow-hidden rounded-full border-1 border-turtle-foreground bg-background object-cover',
            heightClass,
          )}
        />
        {/* The origin label - either the origin chain or the bridge that has wrapped this token */}
        {originBadge && (
          <div className="absolute bottom-[-2px] right-[-1px] h-fit w-fit">
            <div className="relative">
              <Image
                alt={originBadge.text}
                width={size / 2}
                height={size / 2}
                src={originBadge.logoURI}
                className={cn('rounded-full border-1 border-white')}
              />
            </div>
          </div>
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
      logoURI: '/ethereum.svg',
      text: `Ethereum ${token.symbol}`,
    }
  if (sourceChain.network === 'Polkadot' && token.origin.type === 'Polkadot')
    return {
      logoURI: '/polkadot.svg',
      text: `Polkadot ${token.symbol}`,
    }
  if (sourceChain.network === 'Polkadot' && token.origin.type === 'Ethereum') {
    switch (token.origin.bridge) {
      case 'Snowbridge':
        return { logoURI: '/snowbridge-badge.svg', text: `Snowbridge ${token.symbol}` }
      default:
        return
    }
  }

  return
}
