import { FC } from 'react'
import { cn } from '@/utils/helper'

export interface IconProps {
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
export const Icon: FC<IconProps> = ({ width, height, src, className }) => {
  return (
    <img
      src={src}
      width={width}
      height={height}
      className={cn('rounded-full border bg-cover bg-center', className)}
    />
  )
}
