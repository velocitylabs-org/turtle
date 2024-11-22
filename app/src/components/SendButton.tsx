import { FC } from 'react'
import { Status } from '@/hooks/useTransfer'
import Button, { ButtonProps } from './Button'

type SendButtonProps = ButtonProps & { status: Status }

const SendButton: FC<SendButtonProps> = ({ status, disabled, ...props }) => {
  {
    disabled || (status == 'Idle' && <Button disabled={disabled} {...props} />)
  }

  {
    status == 'Loading' && <Button disabled={disabled} {...props} className="opacity-100" />
  }
  {
    status == 'Signing' && (
      <Button disabled={disabled} {...props} className="opacity-100" label="Signing" />
    )
  }
  {
    status == 'Cancelled' && (
      <Button disabled={disabled} {...props} className="opacity-100" label="Cancelled" />
    )
  }

  return <Button {...props} disabled={disabled} className="mt-4 opacity-100" />
}

export default SendButton
