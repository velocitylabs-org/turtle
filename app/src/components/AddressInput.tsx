'use client'
import { FC } from 'react'
import { twMerge } from 'tailwind-merge'

interface AddressInputProps {
  /** The current input value, which should reflect the address. */
  value: string
  /** Callback invoked with the new address text each time it changes via user input. */
  onChange: (value: string) => void
  /** Placeholder text for the input field when it is empty. */
  placeholder?: string
  /** Flag indicating whether the input is interactable. */
  disabled?: boolean
  /** Additional classes to apply. */
  className?: string
}

const AddressInput: FC<AddressInputProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
}) => {
  const disabledClass = disabled ? 'input-disabled' : ''

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)

  return (
    <div className={`input input-sm flex items-center gap-2 ${disabledClass}`}>
      <input
        type="text"
        aria-label={`Input for receiver address`}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={handleChange}
        disabled={disabled}
        className={twMerge('w-full', disabledClass, className)}
      />
      {/* This is a placeholder for a validation status icon of an address. Or to show if address belongs to user or not. */}
      <p className="label-text">Valid</p>
    </div>
  )
}

export default AddressInput
