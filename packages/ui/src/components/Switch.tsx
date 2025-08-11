import { cn } from '@velocitylabs-org/turtle-ui'
import { forwardRef } from 'react'

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

const Switch = forwardRef<HTMLDivElement, SwitchProps>(({ checked, onChange, label, disabled, className }, ref) => {
  return (
    <div ref={ref} className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        className={cn(
          'relative inline-flex h-6 w-10 cursor-pointer items-center rounded-[8px] border border-turtle-level3 transition-colors duration-200 ease-in-out',
          checked ? 'bg-turtle-primary-light' : 'bg-turtle-level1',
          disabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer',
        )}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-[4px] border border-black bg-white transition duration-200 ease-in-out',
            checked ? 'translate-x-5 bg-turtle-primary' : 'translate-x-1',
          )}
        />
      </button>
      {label && <span className={cn('self-center text-sm', disabled && 'text-turtle-level4')}>{label}</span>}
    </div>
  )
})

Switch.displayName = 'Switch'

export { Switch }
