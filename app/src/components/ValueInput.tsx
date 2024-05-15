'use client'
import { FC, useEffect } from 'react'
import { twMerge } from 'tailwind-merge'

const classNameToRemoveInputArrows =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'

interface ValueInputProps {
  /** Current value of the input, which can be a number or null if the input is empty or not set. */
  value: number | null
  /** Handler for changes to the input value. */
  onChange: (newValue: number | null) => void
  /** Text to display when the input field is empty. */
  placeholder?: string
  /** Unit of measurement that might be displayed alongside the input. */
  unit?: string
  /** Determines if the input is interactable or disabled. */
  disabled?: boolean
  /** Additional classes to apply to the input. */
  className?: string
}

const ValueInput: FC<ValueInputProps> = ({
  value,
  onChange,
  placeholder,
  unit = '',
  disabled,
  className,
}) => {
  const disabledClass = disabled ? 'input-disabled' : ''

  /** Reset value on unit change */
  useEffect(() => {
    onChange(0)
  }, [unit, onChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value

    if (newVal === '') onChange(null)
    else if (!isNaN(Number(newVal))) onChange(Math.max(0, Number(newVal))) // check that it's a number and positive
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
