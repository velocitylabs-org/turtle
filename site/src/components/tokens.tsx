import Image from 'next/image'
import { cn } from '@/utils/cn'
import { ArrowRight } from './assets/arrow-right'

const bridgeTx = [
  {
    fromChain: {
      name: 'ethereum',
      logoURI:
        'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png',
    },
    fromToken: {
      name: 'usdc',
      logoURI: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    },
    toChain: {
      name: 'assethub',
      logoURI: 'https://cnews24.ru/uploads/d41/d419a4c7028eaf6864f972e554d761e7b10e5d06.png',
    },
    toToken: {
      name: 'usdc',
      logoURI: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    },
  },
  {
    fromChain: {
      name: 'assethub',
      logoURI: 'https://cnews24.ru/uploads/d41/d419a4c7028eaf6864f972e554d761e7b10e5d06.png',
    },
    fromToken: {
      name: 'weth',
      logoURI: 'https://ucarecdn.com/c01c9021-a497-41b5-8597-9ab4e71440c1/wrapped-eth.png',
    },
    toChain: {
      name: 'ethereum',
      logoURI:
        'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png',
    },
    toToken: {
      name: 'weth',
      logoURI: 'https://ucarecdn.com/c01c9021-a497-41b5-8597-9ab4e71440c1/wrapped-eth.png',
    },
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
            <div className="relative h-8 w-8 sm:h-12 sm:w-12">
              <Image
                src={fromChain.logoURI}
                alt={`Velocity Labs, Bridge tokens from ${fromChain.name}`}
                fill={true}
                className="rounded-full bg-white "
              />
            </div>
            <div className="flex items-center space-x-1">
              <Image
                src={fromToken.logoURI}
                alt={`Velocity Labs, Bridge ${fromToken.name} on Polkadot`}
                height={32}
                width={32}
                className="hidden rounded-full bg-white sm:inline"
              />
              <p className="font-sans text-lg font-extrabold uppercase sm:text-2xl">
                {fromToken.name}
              </p>
            </div>
            <ArrowRight className="h-3 w-3" />
            <div className="flex items-center space-x-1">
              <Image
                src={toToken.logoURI}
                alt={`Velocity Labs, Bridge ${toToken.name} from Polkadot`}
                height={32}
                width={32}
                className="hidden rounded-full bg-white sm:inline"
              />
              <p className="font-sans text-lg font-extrabold uppercase sm:text-2xl">
                {toToken.name}
              </p>
            </div>
            <div className="relative h-8 w-8 sm:h-12 sm:w-12">
              <Image
                src={toChain.logoURI}
                alt={`Velocity Labs, Bridge tokens to ${toChain.name}`}
                fill={true}
                className="rounded-full bg-white "
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
