import { FC } from 'react'
import { twMerge } from 'tailwind-merge'

interface AddressInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const AddressInput: FC<AddressInputProps> = ({
  value,
  onChange,
  placeholder = '',
  disabled = false,
  className,
}) => {
  const disabledClass = disabled ? 'input-disabled' : ''
  const isReceiverTheUser = true // TODO update once wallet can be connected

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

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
      <p className="label-text">{isReceiverTheUser ? 'You' : 'Not You'}</p>
    </div>
  )
}

export default AddressInput
