'use client'
import { FC } from 'react'
import { twMerge } from 'tailwind-merge'

interface WalletConnectButtonProps {
  /** Text shown inside the button. */
  label?: string
  /** Function to call when the button is clicked. */
  onClick?: () => void
  /** Additional classes to apply to the button. */
  className?: string
}

const WalletConnectButton: FC<WalletConnectButtonProps> = ({
  label = '',
  onClick = () => {},
  className,
}) => {
  return (
    <div className={twMerge('', className)}>
      <w3m-button size="sm" balance="hide" />
    </div>
  )
}

export default WalletConnectButton
