import { FC } from 'react'
import { Status } from '@/hooks/useTransfer'
import Button, { ButtonProps } from './Button'
import LoadingIcon from './svg/LoadingIcon'
import { colors } from '../../tailwind.config'

type SendButtonProps = ButtonProps & { status: Status }

const SendButton: FC<SendButtonProps> = ({ status, disabled, ...props }) => {
  return (
    <div className="w-full">
      {/* Default - send */}
      {status === 'Idle' && <Button disabled={disabled} {...props} />}
      {(status === 'Loading' || status === 'Sending') && (
        <Button
          disabled={disabled}
          {...props}
          variant="update"
          label={status}
          icon={
            <LoadingIcon
              className="animate-spin"
              width={40}
              height={40}
              color={colors['turtle-secondary']}
            />
          }
        />
      )}
      {status === 'Validating' && (
        <Button
          disabled={disabled}
          {...props}
          variant="update"
          label="Validating"
          icon={<div className="motion-preset-pulse mr-3 text-2xl">🕵️</div>}
        />
      )}

      {status === 'Signing' && (
        <Button
          disabled={disabled}
          {...props}
          variant="update"
          label="Signing"
          icon={<div className="motion-preset-wobble mr-3 text-2xl">✍️</div>}
        />
      )}
    </div>
  )
}

export default SendButton
