import { Chain } from '@/models/chain'
import { chainsToSelectOptions, chainToSelectOption, SelectOption } from '@/models/selectOption'
import { FC } from 'react'
import CustomSelect from './CustomSelect'

interface ChainSelectProps {
  /** Currently selected chain, or null if no value is selected. */
  value: Chain | null
  /** Callback function that is invoked when the selected chain changes. */
  onChange: (newValue: Chain | null) => void
  /** Array of chains that the user can select from. */
  options: Chain[]
  /** Title of the select input, displayed when no item is selected. */
  title?: string
  /** Whether the select input is disabled (non-interactive). */
  disabled?: boolean
  /** Additional classes to apply to the select input. */
  className?: string
}

const ChainSelect: FC<ChainSelectProps> = ({
  value,
  onChange,
  options,
  title = 'Select Chain',
  disabled = false,
  className = '',
}) => {
  const selectOption = value ? chainToSelectOption(value) : null
  const handleChange = (selectedOption: SelectOption<Chain> | null) =>
    onChange(selectedOption?.value ?? null)
  const selectOptions = chainsToSelectOptions(options)

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

export default ChainSelect
