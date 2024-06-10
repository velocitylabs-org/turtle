'use client'
import { FC } from 'react'
import { twMerge } from 'tailwind-merge'

interface TransferButtonProps {
  /** Text shown inside the button. */
  label?: string
  /** Function to call when the button is clicked. */
  onClick?: () => void
  /** Additional classes to apply to the button. */
  className?: string
  /** Whether the button is disabled (non-interactive). */
  disabled?: boolean
}

const TransferButton: FC<TransferButtonProps> = ({
  label = '',
  onClick = () => {},
  className,
  disabled,
}) => {
  return (
    <button disabled={true} onClick={onClick} className={twMerge('btn btn-primary ', className)}>
      {label}
    </button>
  )
}

export default TransferButton
