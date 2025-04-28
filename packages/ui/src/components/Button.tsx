import React from 'react'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'update'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonType = 'button' | 'submit' | 'reset'

interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  className?: string
  disabled?: boolean
  loading?: boolean
  size?: ButtonSize
  variant?: ButtonVariant
  type?: ButtonType
}

const styles = {
  primary: 'bg-turtle-primary border border-black disabled:opacity-30',
  secondary: 'bg-turtle-secondary border border-black disabled:opacity-30',
  outline:
    'border-1 border-turtle-level3 bg-transparent disabled:border-turtle-level3 disabled:opacity-30',
  ghost: 'bg-transparent disabled:opacity-30',
  update:
    'border-1 bg-turtle-secondary border border-turtle-secondary-dark text-turtle-secondary-dark disabled:opacity-100 disabled:bg-turtle-secondary-50 disabled:border-turtle-secondary-dark-40',
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

export const Button = ({
  children,
  className,
  type = 'button',
  variant = 'primary',
  disabled,
  onClick,
  size,
  ...rest
}: ButtonProps) => {
  const classNames = twMerge(
    clsx(
      'w-full flex items-center justify-center rounded-lg outline-none hover:opacity-80 subpixel-antialiased z-0 cursor-pointer',
      sizeHeights[size],
      paddingX[size],
      styles[variant],
      className,
    ),
  )

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()

    onClick()
  }

  return (
    <button
      type={type === 'submit' ? 'submit' : type === 'reset' ? 'reset' : 'button'}
      tabIndex={0}
      className={classNames}
      onClick={handleClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}
