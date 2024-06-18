'use client'
import { SelectOption } from '@/models/selectOption'
import { truncateAddress } from '@/utils/address'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface CustomSelectProps<T> {
  /** Currently selected value, or null if no value is selected. */
  value: SelectOption<T> | null
  /** Callback function that is invoked when the selected value changes. */
  onChange: (newValue: SelectOption<T> | null) => void
  /** Array of options that the user can select from. */
  options: SelectOption<T>[]
  /** Label floating above the select input */
  floatingLabel?: string
  /** Placeholder text to display when no value is selected. */
  placeholder?: string
  /** Icon to display in the placeholder. */
  placeholderIcon?: ReactNode
  /** Whether the select input is disabled (non-interactive). */
  disabled?: boolean
  /** Button to display in the wallet section of the select input. */
  walletButton?: ReactNode
  /** Address to display in the wallet section of the select input. */
  address?: string
  /** Additional classes to apply to the select input. */
  className?: string
}

export const CustomSelect = <T,>({
  value,
  onChange,
  options,
  floatingLabel,
  placeholder,
  placeholderIcon,
  disabled,
  walletButton,
  address,
  className,
}: CustomSelectProps<T>) => {
  const handleSelectionChange = (newValue: string) => {
    const selectedOption = options.find(opt => JSON.stringify(opt.value) === newValue) || null
    onChange(selectedOption)
  }

  return (
    <div className={twMerge(`flex items-center justify-center border-turtle-level3`, className)}>
      <Select onValueChange={handleSelectionChange}>
        <SelectTrigger floatingLabel={floatingLabel} trailing={walletButton}>
          <SelectValue
            placeholder={
              <div className="flex items-center gap-1">
                {placeholderIcon}
                {placeholder}
                <ChevronDown strokeWidth={1} />
              </div>
            }
          >
            {value && (
              <div className="flex items-center gap-1">
                <Image
                  src={value.logoURI}
                  alt={value.label}
                  width={24}
                  height={24}
                  className="h-[1.5rem] w-[1.5rem] rounded-full"
                />
                {!address && <p>{value.label}</p>}
                <ChevronDown strokeWidth={1} />
                {address && <p>{truncateAddress(address)}</p>}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent className="bg-white">
          <div className="flex flex-col gap-2">
            {options.map((option, index) => (
              <SelectItem
                key={index + option.label + option.logoURI}
                value={JSON.stringify(option.value)}
              >
                <div className="flex items-center gap-1">
                  <Image
                    src={option.logoURI}
                    alt={option.label}
                    width={24}
                    height={24}
                    className="h-[1.5rem] w-[1.5rem] rounded-full"
                  />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>
    </div>
  )
}

export default CustomSelect
