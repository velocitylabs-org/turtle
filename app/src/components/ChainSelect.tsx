import { Chain } from '@/models/chain'
import { chainsToSelectOptions, chainToSelectOption, SelectOption } from '@/models/selectOption'
import { FC, ReactNode } from 'react'
import CustomSelect from './CustomSelect'

interface ChainSelectProps {
  /** Currently selected chain, or null if no value is selected. */
  value: Chain | null
  /** Callback function that is invoked when the selected chain changes. */
  onChange: (newValue: Chain | null) => void
  /** Array of chains that the user can select from. */
  options: Chain[]
  /** Label floating above the select input */
  floatingLabel?: string
  /** Placeholder text to display when no value is selected. */
  placeholder?: string
  /** Whether the select input is disabled (non-interactive). */
  disabled?: boolean
  /** Button to display in the wallet section of the select input. */
  walletButton?: ReactNode
  /** Address to display in the wallet section of the select input. */
  address?: string
  /** Additional classes to apply to the select input. */
  className?: string
}

const ChainSelect: FC<ChainSelectProps> = ({
  value,
  onChange,
  options,
  floatingLabel,
  placeholder,
  disabled = false,
  walletButton,
  address,
  className = '',
}) => {
  const selectOption = value ? chainToSelectOption(value) : null // convert chain value to select option for custom select component
  const selectOptions = chainsToSelectOptions(options) // converts chains to select options for custom select component
  const handleChange = (selectedOption: SelectOption<Chain> | null) =>
    onChange(selectedOption?.value ?? null)

  return (
    <CustomSelect
      value={selectOption}
      onChange={handleChange}
      options={selectOptions}
      floatingLabel={floatingLabel}
      placeholder={placeholder}
      walletButton={walletButton}
      address={address}
      disabled={disabled}
      className={className}
    />
  )
}

export default ChainSelect
