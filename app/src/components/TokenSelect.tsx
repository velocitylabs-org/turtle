import { SelectOption, tokensToSelectOptions, tokenToSelectOption } from '@/models/selectOption'
import { Token } from '@/models/token'
import { FC } from 'react'
import CustomSelect from './CustomSelect'

interface TokenSelectProps {
  /** Currently selected token, or null if no value is selected. */
  value: Token | null
  /** Callback function that is invoked when the selected token changes. */
  onChange: (newValue: Token | null) => void
  /** Array of tokens that the user can select from. */
  options: Token[]
  /** Title of the select input, displayed when no item is selected. */
  title?: string
  /** Whether the select input is disabled (non-interactive). */
  disabled?: boolean
  /** Additional classes to apply to the select input. */
  className?: string
}

const TokenSelect: FC<TokenSelectProps> = ({
  value,
  onChange,
  options,
  title = 'Select Token',
  disabled = false,
  className = '',
}) => {
  const selectOption = value ? tokenToSelectOption(value) : null
  const handleChange = (selectedOption: SelectOption<Token> | null) =>
    onChange(selectedOption?.value ?? null)
  const selectOptions = tokensToSelectOptions(options)

  return (
    <CustomSelect
      value={selectOption}
      onChange={handleChange}
      options={selectOptions}
      title={title}
      disabled={disabled}
      className={className}
    />
  )
}

export default TokenSelect
