'use client'
import { Button as NextButton } from '@nextui-org/react'
import { FC, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import LoadingIcon from './svg/LoadingIcon'

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

export const spinnerSize: Record<ButtonSize, number> = {
  sm: 24,
  md: 24,
  lg: 40,
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
  /** Whether the button is in a loading state. */
  loading?: boolean
  /** The variant determines the preset color and style of the button. */
  variant?: ButtonVariant
  /** The size of the button. */
  size?: ButtonSize
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
  type = 'button', // Default type is 'button',
  cypressID,
}) => {
  return (
    <NextButton
      isDisabled={disabled}
      disableRipple
      onClick={onClick}
      size={size}
      radius="sm"
      className={twMerge(styles[variant], sizeHeights[size], paddingX[size], className)}
      type={type}
      style={{
        outline: 'none',
      }}
      data-cy={cypressID}
    >
      {/** loading state */}
      {loading && (
        <LoadingIcon
          className="animate-spin"
          width={spinnerSize[size]}
          height={spinnerSize[size]}
        />
      )}

      {/** children or label */}
      {!loading && (children || label)}
    </NextButton>
  )
}

export default Button
