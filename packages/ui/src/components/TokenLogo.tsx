'use client'
import { Chain, Token } from '@velocitylabs-org/turtle-registry'
import { Tooltip } from '@/components/Tooltip'
import { cn } from '@/helpers'
import { getOriginBadge } from '@/helpers/chains'
import { Icon } from './Icon'

interface TokenLogoProps {
  token: Token
  sourceChain: Chain | null
  size?: number
  className?: string
}

export const TokenLogo = ({ token, sourceChain, size = 32, className }: TokenLogoProps) => {
  const originBadge = getOriginBadge(token, sourceChain)

  const logoURI = typeof token.logoURI === 'string' ? token.logoURI : token.logoURI.src
  const originBadgeLogoURI =
    typeof originBadge?.logoURI === 'string' ? originBadge.logoURI : originBadge?.logoURI?.src

  return (
    <Tooltip content={originBadge?.text ?? token.symbol} showIcon={false}>
      <div className={cn('relative flex items-center', className)}>
        <Icon width={size} height={size} src={logoURI} className="border-turtle-foreground" />
        {originBadge && (
          <Icon
            width={size / 2}
            height={size / 2}
            src={originBadgeLogoURI}
            className="absolute bottom-[-5%] right-[-10%] border-white"
          />
        )}
      </div>
    </Tooltip>
  )
}
