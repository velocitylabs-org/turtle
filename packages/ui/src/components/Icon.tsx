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
  if (!src) {
    return null
  }

  const isInlineSvg = src.startsWith('data:image/svg+xml')
  const backgroundImage = isInlineSvg ? `url("${src}")` : `url("${src}")`

  return (
    <div
      className={cn('rounded-full border bg-cover bg-center', className)}
      style={{ backgroundImage, width: `${width}px`, height: `${height}px` }}
    />
  )
}
