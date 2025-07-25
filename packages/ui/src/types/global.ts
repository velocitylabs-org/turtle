export type Sizes = 'sm' | 'md' | 'lg'

type AsProp<T extends React.ElementType> = {
  as?: T
}

type PropsToOmit<T extends React.ElementType, P> = keyof (AsProp<T> & P)

export type PolymorphicComponentProps<
  T extends React.ElementType,
  Props = object,
> = React.PropsWithChildren<Props & AsProp<T>> &
  Omit<React.ComponentPropsWithoutRef<T>, PropsToOmit<T, Props>>
