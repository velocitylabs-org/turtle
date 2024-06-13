import { twMerge } from 'tailwind-merge'

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
    <div className={twMerge('form-control', className)}>
      <label className={`label gap-2 ${disabled ? '' : 'cursor-pointer'}`}>
        <input
          type="checkbox"
          className={`toggle toggle-sm rounded-md border-turtle-level3 [--tglbg:#D9FFDF] checked:bg-turtle-primary`}
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span className="label-text">{label}</span>
      </label>
    </div>
  )
}

export default Switch
