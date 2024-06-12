'use client'
import { cn } from '@/utils/cn'
import { FC } from 'react'

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
}

const Button: FC<ButtonProps> = ({
  label = '',
  onClick = () => {},
  className,
  disabled,
  variant = 'primary',
}) => {
  return (
    <button
      disabled={false}
      onClick={onClick}
      className={cn(
        'btn bg-turtle-level3 hover:bg-turtle-level4 disabled:bg-turtle-level3 disabled:bg-opacity-30',
        className,
      )}
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
