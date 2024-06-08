'use client'
import { FC } from 'react'

interface EvmWalletButtonProps {
  /** Text shown inside the button. */
  label?: string
  /** Function to call when the button is clicked. */
  onClick?: () => void
  /** Additional classes to apply to the button. */
  className?: string
}

const EvmWalletButton: FC<EvmWalletButtonProps> = ({ label, onClick = () => {}, className }) => {
  return (
    <div className={className} onClick={onClick}>
      <w3m-button size="sm" balance="hide" label={label} />
    </div>
  )
}

export default EvmWalletButton
