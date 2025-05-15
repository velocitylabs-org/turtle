import { cn } from '@/helpers'

interface IconProps {
  width: number
  height: number
  src: string
  className?: string
}

/**
 * Alternative to the default `Image` component that renders the image at the given `url` as a background image of a div,
 * making it a lot easier to handle images with different ratios while forcing a fixed width and height.
 */
export const Icon = ({ width, height, src, className }: IconProps) => {
  return (
    <div
      className={cn('rounded-full border-1 bg-cover bg-center', className)}
      style={{ backgroundImage: `url(${src})`, width: `${width}px`, height: `${height}px` }}
    />
  )
}
