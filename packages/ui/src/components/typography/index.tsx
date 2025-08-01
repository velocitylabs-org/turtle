import { cn } from '@/helpers'
import { PolymorphicComponentProps } from '@/types/global'

// Temp name as Raissa defines typography properly
export const LargeHeading = <T extends React.ElementType = 'h1'>({
  children,
  as,
  className,
  ...rest
}: PolymorphicComponentProps<T>) => {
  const Component = as || 'h1'
  return (
    <Component className={cn('text-large-heading font-bold', className)} {...rest}>
      {children}
    </Component>
  )
}

export const Large = <T extends React.ElementType = 'h4'>({
  children,
  as,
  className,
  ...rest
}: PolymorphicComponentProps<T>) => {
  const Component = as || 'h4'
  return (
    <Component className={cn('text-xl font-bold leading-none', className)} {...rest}>
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
    <Component className="text-base leading-[1.5]" {...rest}>
      {children}
    </Component>
  )
}
