import clsx from 'clsx'
import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { Sizes } from '../types/global'
import { LoadingIcon } from './LoadingIcon'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'update'
export type ButtonType = 'button' | 'submit' | 'reset'

export interface ButtonProps {
  /** Text shown inside the button. */
  label?: string
  /** Function to call when the button is clicked. */
  onClick?: () => void
  /** Additional classes to apply to the button. */
  className?: string
  /** Whether the button is disabled (non-interactive). */
  disabled?: boolean
  /** Whether the button is in a loading state. */
  loading?: boolean
  /** The variant determines the preset color and style of the button. */
  variant?: ButtonVariant
  /** The size of the button. */
  size?: Sizes
  /** A custom icon to be displayed instead of the spinner */
  icon?: ReactNode
  /** Content to be rendered inside the button. It will replace the label. */
  children?: ReactNode
  /** The type of the button. */
  type?: ButtonType
  /** Cypress ID for testing. */
  cypressID?: string
}

const styles = {
  primary: 'bg-turtle-primary border border-black disabled:opacity-30',
  secondary: 'bg-turtle-secondary border border-black disabled:opacity-30',
  outline:
    'border border-turtle-level3 bg-transparent disabled:border-turtle-level3 disabled:opacity-30',
  ghost: 'bg-transparent disabled:opacity-30',
  update:
    'border bg-turtle-secondary border border-turtle-secondary-dark text-turtle-secondary-dark disabled:opacity-100 disabled:bg-turtle-secondary-50 disabled:border-turtle-secondary-dark-40',
}

const sizeHeights: Record<Sizes, string> = {
  sm: 'h-[1.625rem]',
  md: 'h-[2.5rem]',
  lg: 'h-[3.5rem]',
}

const paddingX: Record<Sizes, string> = {
  sm: 'px-2',
  md: 'px-3',
  lg: 'px-5',
}

export const Button = ({
  children,
  className,
  type = 'button',
  variant = 'primary',
  disabled,
  onClick,
  size,
  loading,
  label,
  icon = <LoadingIcon className="mr-3 animate-spin" size={size} />,
  ...rest
}: ButtonProps) => {
  const classNames = twMerge(
    clsx(
      'relative w-full flex items-center justify-center rounded-lg outline-none hover:opacity-80 subpixel-antialiased z-0 cursor-pointer',
      sizeHeights[size],
      paddingX[size],
      styles[variant],
      className,
    ),
  )

  return (
    <button
      type={type === 'submit' ? 'submit' : type === 'reset' ? 'reset' : 'button'}
      tabIndex={0}
      className={classNames}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {loading && (
        <div className="flex items-center">
          {icon && <span className="mr-3">{icon}</span>}
          <span className="mr-3">{label}</span>
        </div>
      )}

      {!loading && (children || label)}
    </button>
  )
}
