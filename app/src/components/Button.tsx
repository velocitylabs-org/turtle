'use client'
import { Button as NextButton } from '@nextui-org/react'
import { FC, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

const styles = {
  primary:
    'bg-turtle-primary border border-black hover:border-black focus:border-black active:border-black disabled:border-black disabled:opacity-30',
  secondary: 'bg-turtle-level3 disabled:opacity-30',
  outline:
    'border-1 border-turtle-level3 bg-transparent hover:border-turtle-level3 disabled:border-turtle-level3 disabled:opacity-30',
  ghost: 'bg-transparent disabled:opacity-30',
}

const sizeHeights: Record<ButtonSize, string> = {
  sm: 'h-[1.625rem]',
  md: 'h-[2.5rem]',
  lg: 'h-[3.5rem]',
}

const paddingX: Record<ButtonSize, string> = {
  sm: 'px-2',
  md: 'px-3',
  lg: 'px-5',
}

interface ButtonProps {
  /** Text shown inside the button. */
  label?: string
  /** Function to call when the button is clicked. */
  onClick?: () => void
  /** Additional classes to apply to the button. */
  className?: string
  /** Whether the button is disabled (non-interactive). */
  disabled?: boolean
  /** The variant determines the preset color and style of the button. */
  variant?: ButtonVariant
  /** The size of the button. */
  size?: ButtonSize
  /** Content to be rendered inside the button. It will replace the label. */
  children?: ReactNode
}

const Button: FC<ButtonProps> = ({
  label = '',
  onClick = () => {},
  className,
  disabled,
  variant = 'primary',
  size = 'lg',
  children,
}) => {
  return (
    <NextButton
      isDisabled={disabled}
      disableRipple
      onClick={onClick}
      size={size}
      radius="sm"
      className={twMerge(styles[variant], sizeHeights[size], paddingX[size], className)}
    >
      {children || label}
    </NextButton>
  )
}

export default Button
