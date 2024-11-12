'use client'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import Image from 'next/image'
import React, { FC } from 'react'
import { Tooltip } from './Tooltip'

interface TokenLogoProps {
  token: Token
  sourceChain: Chain | null
}

export const TokenLogo: FC<TokenLogoProps> = ({ token, sourceChain }) => {
  const originBadge = getOriginBadge(token, sourceChain)

  return (
    <div className="relative flex min-w-[32px] items-center">
      {/* The token logo */}
      <Image
        src={token.logoURI}
        alt={token.name}
        width={32}
        height={32}
        className="token-logo h-[2rem] w-[2rem] rounded-full border-1 border-turtle-foreground bg-background"
      />
      {/* The origin label - either the origin chain or the bridge that has wrapped this token */}
      {originBadge && (
        <div className="absolute bottom-[-2px] right-[-1px] h-fit w-fit">
          <div className="relative">
            <Tooltip content={originBadge.text} showIcon={false}>
              <Image
                alt={originBadge.text}
                width={16}
                height={16}
                src={originBadge.logoURI}
                className="rounded-full border-1 border-white"
              />
            </Tooltip>
          </div>
        </div>
      )}
    </div>
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
  if (!sourceChain) return
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
