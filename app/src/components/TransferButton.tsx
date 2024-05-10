import { FC } from 'react'
import { twMerge } from 'tailwind-merge'

interface TransferButtonProps {
  label?: string
  onClick?: () => void
  className?: string
}

const TransferButton: FC<TransferButtonProps> = ({ label = '', onClick = () => {}, className }) => {
  return (
    <button onClick={onClick} className={twMerge('btn btn-outline btn-primary', className)}>
      {label}
    </button>
  )
}

export default TransferButton
