import { cn } from '@/utils/cn'
import React, { FC } from 'react'

export interface BetterImageProps {
  width: number
  height: number
  src: string
  className?: string
}

/**
 * Alternative to the default `Image` component that renders the image at the given `url` as a background image of a div,
 * making it a lot easier to handle images with different ratios while forcing a fixed width and height.
 *
 */
export const BetterImage: FC<BetterImageProps> = ({ width, height, src, className }) => {
  return (
    <div
      className={cn('bg-cover bg-center', className)}
      style={{ backgroundImage: `url(${src})`, width: `${width}px`, height: `${height}px` }}
    />
  )
}
