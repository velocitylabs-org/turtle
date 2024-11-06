import { Token } from '@/models/token'
import { Tooltip } from '@nextui-org/react'
import Image from 'next/image'
import React, { FC } from 'react'

export interface Label {
  logoURI: string
  alt: string
}

interface TokenLogoProps {
  token: Token
  label: Label
}

export const TokenLogo: FC<TokenLogoProps> = ({ token, label }) => {
  return (
    <div className="relative flex items-center">
      {/* The token logo */}
      <Image
        src={token.logoURI}
        alt={token.name}
        width={32}
        height={32}
        className="token-logo h-[2rem] w-[2rem] rounded-full border-1 border-turtle-foreground bg-background"
      />
      {/* The origin label - either the origin chain or the bridge that has wrapped this token */}
      <div className="absolute bottom-[-2px] right-[-1px] h-fit w-fit">
        <div className="relative">
          <Tooltip content={'Snowbridge'}>
            <Image
              alt={label.alt}
              width={16}
              height={16}
              src={
                token.origin.type === 'Ethereum'
                  ? '/snowbridge.svg'
                  : 'https://cryptologos.cc/logos/polkadot-new-dot-logo.svg'
              }
              className="rounded-full border-1 border-white"
            />
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
