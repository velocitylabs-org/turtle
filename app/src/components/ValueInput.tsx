import { FC, useEffect } from 'react'
import { twMerge } from 'tailwind-merge'

const classNameToRemoveInputArrows =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'

interface ValueInputProps {
  value: number | null
  onChange: (newValue: number | null) => void
  placeholder?: string
  unit?: string
  disabled?: boolean
  className?: string
}

const ValueInput: FC<ValueInputProps> = ({
  value,
  onChange,
  placeholder = '',
  unit = '',
  disabled,
  className,
}) => {
  const disabledClass = disabled ? 'input-disabled' : ''

  /** Reset value on token change */
  useEffect(() => {
    onChange(0)
  }, [unit])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value

    if (newVal === '') {
      onChange(null)
    } else if (!isNaN(Number(newVal))) {
      onChange(Math.max(0, Number(newVal)))
    }
  }

  return (
    <div className={`${disabledClass} input flex items-center gap-2`}>
      <input
        type="number"
        aria-label={`Input for ${unit}`}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={handleChange}
        min={0}
        disabled={disabled}
        className={twMerge(disabledClass, className, classNameToRemoveInputArrows)}
      />
      <p className="label-text">{unit}</p>
    </div>
  )
}

export default ValueInput
