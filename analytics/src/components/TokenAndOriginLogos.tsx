'use client'
import cn from '@/utils/cn'

interface TokenChainDisplayProps {
  tokenURI: string
  originURI?: string
  size?: number
}

export default function TokenAndOriginLogos({ tokenURI, originURI, size = 28 }: TokenChainDisplayProps) {
  return (
    <div className="flex items-center">
      <div className="relative">
        <LogoImg logoURI={tokenURI} size={size} className="border border-black" />
        {originURI && (
          <div className="absolute -bottom-1 -right-1">
            <LogoImg logoURI={originURI} size={size * 0.65} className="border border-white" />
          </div>
        )}
      </div>
    </div>
  )
}

interface LogoImgProps {
  logoURI: string;
  className?: string;
  size?: number;
  imgClassName?: string;
}

export function LogoImg({
 logoURI,
 className,
 size,
 imgClassName,
}: LogoImgProps) {

  if (!logoURI) return null
  const sizeStyle = size
    ? { height: `${size}px`, width: `${size}px` }
    : { height: '20px', width: '20px' }

  return (
    <div
      style={sizeStyle}
      className={cn('inline-block flex-shrink-0 overflow-hidden rounded-full', className)}
    >
      <img
        src={logoURI}
        alt={logoURI}
        className={cn('h-full w-full object-cover', imgClassName)}
        onError={e => {
          ;(e.target as HTMLImageElement).style.display = 'none'
        }}
      />
    </div>
  )
}
