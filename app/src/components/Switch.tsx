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
    <div className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        className={cn(
          'relative inline-flex h-6 w-10 cursor-pointer items-center rounded-lg border-1 border-turtle-level3 transition-colors duration-200 ease-in-out',
          checked ? 'bg-turtle-primary-light' : 'bg-turtle-level1',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        )}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-[4px] border-1 border-black bg-white transition duration-200 ease-in-out',
            checked ? 'translate-x-5 bg-turtle-primary' : 'translate-x-1',
          )}
        />
      </button>
      {label && <span className="self-center text-sm">{label}</span>}
    </div>
  )
}

export default Switch
