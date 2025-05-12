import { ButtonVariant, LoadingIcon, ButtonProps, Button } from '@velocitylabs-org/turtle-ui'
import { FC, ReactNode, useEffect, useState } from 'react'
import { Status } from '@/hooks/useTransfer'
import { colors } from '../../tailwind.config'

type SendButtonProps = ButtonProps & { status: Status }

const SendButton: FC<SendButtonProps> = ({ status, disabled, ...props }) => {
  const [{ label, icon, variant }, setProps] = useState<OverwritenProps>(
    getOverwrittenProps(status, props.label),
  )

  useEffect(() => {
    setProps(getOverwrittenProps(status, props.label))
  }, [status, disabled, props.label])

  return <Button {...props} variant={variant} disabled={disabled} label={label} icon={icon} />
}

/**
 * Overwriten Props to customise the `SendButton` over the
 * default `Button` component at its different statuses
 */
interface OverwritenProps {
  label?: string
  icon?: ReactNode
  variant?: ButtonVariant
}

/**
 * Get the `OverwrittenProps` for a given tx `Status`. Each status may have a different
 * loading icon, a different label and/or a different style variant.
 */
function getOverwrittenProps(status: Status, defaultLabel?: string): OverwritenProps {
  switch (status) {
    case 'Idle':
      return {
        label: defaultLabel ?? 'Send',
        variant: 'primary',
      }
    case 'Loading':
      return {
        label: status,
        icon: (
          <LoadingIcon className="animate-spin" size="lg" color={colors['turtle-secondary-dark']} />
        ),
        variant: 'update',
      }
    case 'Validating':
      return {
        label: status,
        icon: <div className="motion-preset-pulse mr-3 text-3xl">🕵️</div>,
        variant: 'update',
      }
    case 'Signing':
      return {
        label: 'Waiting for approval',
        icon: <div className="motion-preset-wobble mr-3 text-3xl">✍️</div>,
        variant: 'update',
      }
    case 'Sending':
      return {
        label: status,
        icon: (
          <LoadingIcon
            className="animate-spin"
            width={40}
            height={40}
            color={colors['turtle-secondary-dark']}
          />
        ),
        variant: 'update',
      }
    default:
      return {
        icon: (
          <LoadingIcon
            className="animate-spin"
            width={40}
            height={40}
            color={colors['turtle-secondary-dark']}
          />
        ),
        variant: 'update',
      }
  }
}

export default SendButton
