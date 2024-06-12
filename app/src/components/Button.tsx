'use client'
import { FC } from 'react'
import { twMerge } from 'tailwind-merge'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'

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
  size?: 'sm' | 'md' | 'lg'
}

const Button: FC<ButtonProps> = ({
  label = '',
  onClick = () => {},
  className,
  disabled,
  variant = 'primary',
  size = 'md',
}) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={twMerge('btn', buttonStyle(variant), className)}
    >
      {label}
    </button>
  )
}

const buttonStyle = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return 'btn-primary border border-black hover:border-black focus:border-black active:border-black disabled:border-black disabled:bg-turtle-primary disabled:bg-opacity-30'

    case 'secondary':
      return 'btn-secondary'

    case 'outline':
      return 'btn-outline'

    case 'ghost':
      return 'btn-ghost'

    default:
      return ''
  }
}

export default Button
