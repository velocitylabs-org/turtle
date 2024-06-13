import { cn } from '@/utils/cn'
import { Switch as NextSwitch } from '@nextui-org/react'

interface SwitchProps {
  /** The current state of the switch, true for on and false for off. */
  checked: boolean
  /** Callback invoked with the new state each time the switch is toggled. */
  onChange: (newVal: boolean) => void
  /** Optional label for the switch. */
  label?: string
  /** Flag indicating whether the switch is interactable. */
  disabled?: boolean
  /** Additional classes to apply. */
  className?: string
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, disabled, className }) => {
  return (
    <NextSwitch
      isSelected={checked}
      isDisabled={disabled}
      onValueChange={onChange}
      size="sm"
      className={cn('', className)}
    >
      {label}
    </NextSwitch>
  )
}

export default Switch
