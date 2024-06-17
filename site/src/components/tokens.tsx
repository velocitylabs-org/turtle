'use client'
import { cn } from '@/utils/cn'
import { ArrowRight } from './assets/arrow-right'
import { TokenIcon, TokenIconName } from './assets/tokens-icons'

type BridgeTx = {
  fromChain: TokenIconName
  fromToken: TokenIconName
  toChain: TokenIconName
  toToken: TokenIconName
}
const bridgeTx: BridgeTx[] = [
  {
    fromChain: 'optimism',
    fromToken: 'eth',
    toChain: 'base',
    toToken: 'eth',
  },
  {
    fromChain: 'arbitrum',
    fromToken: 'magic',
    toChain: 'bnb',
    toToken: 'usdc',
  },
]

export const TokenExchange = () => {
  return (
    <div className="flex flex-col items-center gap-y-2 sm:gap-y-4">
      {bridgeTx.map(({ fromChain, fromToken, toChain, toToken }, idx) => {
        return (
          <div
            key={idx}
            className={cn(
              idx === 0 ? 'w-[230px] sm:w-[334px]' : 'w-[280px] opacity-50 sm:w-[395px]',
              'flex h-8 items-center justify-between overflow-hidden rounded-full border border-black bg-turtle-primary sm:h-12',
            )}
          >
            <TokenIcon
              name={fromChain}
              //   icons dimentions downloaded from figma do not fit. This need to be addressed once we will get the final design and tokens.
              className={cn(
                idx === 0 ? 'mt-[0.5px]' : '-mt-[9px] sm:-mt-[14px]',
                '-ms-[1px] h-8 w-8 sm:h-12 sm:w-12',
              )}
            />
            <div className="flex items-center space-x-2">
              <TokenIcon
                name={fromToken}
                //   icons dimentions downloaded from figma do not fit. This need to be addressed once we will get the final design and tokens.
                className={cn(idx !== 0 && '-mt-[5px]', 'hidden h-8 w-8 sm:inline')}
              />
              <p className="font-sans text-lg font-extrabold uppercase sm:text-2xl">{fromToken}</p>
            </div>
            <ArrowRight className="h-3" />
            <div className="flex items-center space-x-2">
              <TokenIcon
                name={toToken}
                //   icons dimentions downloaded from figma do not fit. This need to be addressed once we will get the final design and tokens.
                className={cn(idx !== 0 && '-mt-[5px]', 'hidden h-8 w-8 sm:inline')}
              />
              <p className="font-sans text-lg font-extrabold uppercase sm:text-2xl">{toToken}</p>
            </div>

            <TokenIcon
              name={toChain}
              //   icons dimentions downloaded from figma do not fit. This need to be addressed once we will get the final design and tokens.
              className={cn(
                idx === 0 ? 'mt-[0.5px]' : ' -mt-[9px] sm:-mt-[14px]',
                '-mr-[1px] h-8 w-8 sm:h-12 sm:w-12',
              )}
            />
          </div>
        )
      })}
    </div>
  )
}
