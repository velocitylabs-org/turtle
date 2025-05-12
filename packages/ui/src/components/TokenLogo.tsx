'use client'
import { Chain, Token } from '@velocitylabs-org/turtle-registry'
import * as React from 'react'

import { Tooltip } from '@/components/Tooltip'
import { cn } from '@/helpers'

import { getOriginBadge } from '../helpers/chains'
import Icon from './Icon'

interface TokenLogoProps {
  token: Token
  sourceChain: Chain | null
  size?: number
  className?: string
}

export default function TokenLogo({ token, sourceChain, size = 32, className }: TokenLogoProps) {
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
