'use client'
import { Button as NextButton } from "@heroui/react"
import { FC, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import LoadingIcon from './svg/LoadingIcon'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'update'
type ButtonSize = 'sm' | 'md' | 'lg'

const styles = {
  primary:
    'bg-turtle-primary border border-black hover:border-black focus:border-black active:border-black disabled:border-black disabled:opacity-30',
  secondary:
    'bg-turtle-secondary border border-black hover:border-black focus:border-black active:border-black disabled:border-black disabled:opacity-30',
  outline:
    'border-1 border-turtle-level3 bg-transparent hover:border-turtle-level3 disabled:border-turtle-level3 disabled:opacity-30',
  ghost: 'bg-transparent disabled:opacity-30',
  update:
    'border-1 bg-turtle-secondary border border-turtle-secondary-dark text-turtle-secondary-dark disabled:opacity-100 disabled:bg-opacity-50 disabled:border-opacity-40',
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

export const spinnerSize: Record<ButtonSize, number> = {
  sm: 24,
  md: 24,
  lg: 40,
}

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
  size?: ButtonSize
  /** A custom icon to be displayed instead of the spinner */
  icon?: ReactNode
  /** Content to be rendered inside the button. It will replace the label. */
  children?: ReactNode
  /** The type of the button. */
  type?: 'button' | 'submit' | 'reset'
  /** Cypress ID for testing. */
  cypressID?: string
}

const Button: FC<ButtonProps> = ({
  label = '',
  onClick = () => {},
  className,
  disabled,
  loading,
  variant = 'primary',
  size = 'lg',
  children,
  icon = (
    <LoadingIcon
      className="mr-3 animate-spin"
      width={spinnerSize[size]}
      height={spinnerSize[size]}
    />
  ),
  type = 'button',
  cypressID,
}) => {
  return (
    <NextButton
      isDisabled={disabled}
      disableRipple
      onPress={onClick}
      size={size}
      radius="sm"
      disableAnimation={true}
      className={twMerge('w-full', styles[variant], sizeHeights[size], paddingX[size], className)}
      type={type}
      style={{
        outline: 'none',
      }}
      data-cy={cypressID}
    >
      {/** Loading state */}
      {loading && (
        <div className="flex items-center">
          {/* Icon */}
          {icon && <span className="mr-3">{icon}</span>}
          {/* Label */}
          <span className="mr-3">{label}</span>
        </div>
      )}

      {/** Default state - children or label */}
      {!loading && (children || label)}
    </NextButton>
  )
}

export default Button
