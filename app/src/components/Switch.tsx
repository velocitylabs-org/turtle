import React from 'react'
import { cn } from '@/utils/cn'

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
    <div className={cn('flex items-center gap-1', className)}>
      <button
        type="button"
        className={cn(
          'relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out',
          checked ? 'bg-green-500' : 'bg-gray-300',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        )}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-md bg-white transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
      {label && <span className="mr-2 text-sm">{label}</span>}
    </div>
  )
}

export default Switch
