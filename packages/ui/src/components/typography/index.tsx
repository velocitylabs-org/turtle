import { cn } from '@/helpers'
import { PolymorphicComponentProps } from '@/types/global'

// Temp name as Raissa defines typography properly
export const XXXLarge = <T extends React.ElementType = 'h1'>({
  children,
  as,
  className,
  ...rest
}: PolymorphicComponentProps<T>) => {
  const Component = as || 'h1'
  return (
    <Component className={cn('text-xxxlarge font-bold', className)} {...rest}>
      {children}
    </Component>
  )
}

export const Body = <T extends React.ElementType = 'p'>({
  children,
  as,
  ...rest
}: PolymorphicComponentProps<T>) => {
  const Component = as || 'p'
  return (
    <Component className="text-base leading-[1.4]" {...rest}>
      {children}
    </Component>
  )
}
