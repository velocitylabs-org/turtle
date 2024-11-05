import { Token } from '@/models/token'
import Image from 'next/image'
import React, { FC } from 'react'

interface TokenLogoProps {
  token: Token
  size: { logo: number, label: number}
}

export const TokenLogo: FC<TokenLogoProps> = ({token, size}) => {
  return <div className="group/list-item peer/list-item gap-squid-xs rounded-squid-s px-squid-xs py-squid-xxs bg-material-light-thin hover:bg-material-light-thin relative flex w-full max-w-full items-center justify-start">
    <Image
      src={token.logoURI}
      alt={token.name}
      width={size.logo}
      height={size.logo}
      className="token-logo h-[2rem] w-[2rem] rounded-full border-1 border-turtle-foreground bg-background" />
    {/* The origin label - either the origin chain or the bridge that has wrapped this token */}
    <div className="absolute bottom-[-2px] right-[-1px] h-fit w-fit">
      <div className="relative">
        <Image
          alt=""
          width={size.label}
          height={size.label}
          src="https://raw.githubusercontent.com/0xsquid/assets/main/images/webp128/chains/ethereum.webp"
          className="rounded-full border-1 border-white" />
      </div>
    </div>
  </div>
}
