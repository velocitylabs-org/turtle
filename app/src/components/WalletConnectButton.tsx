import { FC } from 'react'
import { twMerge } from 'tailwind-merge'

interface WalletConnectButtonProps {
  label?: string
  onClick?: () => void
  className?: string
}

const WalletConnectButton: FC<WalletConnectButtonProps> = ({
  label = '',
  onClick = () => {},
  className,
}) => {
  return <button className={twMerge('btn btn-outline btn-xs', className)}>{label}</button>
}

export default WalletConnectButton
