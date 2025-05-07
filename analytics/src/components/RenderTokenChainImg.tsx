'use client'
import cn from '@/utils/cn'

interface RenderTokenChainImgProps {
  logoURI: string
  className?: string
  imgClassName?: string
  size?: number
}

export default function RenderTokenChainImg({
  logoURI,
  className,
  size,
  imgClassName,
}: RenderTokenChainImgProps) {

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
