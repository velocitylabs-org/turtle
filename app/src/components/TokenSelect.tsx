'use client'
import { Token } from '@/models/token'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { FC, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import Button from './Button'
import TokenIcon from './svg/TokenIcon'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface TokenSelectProps {
  /** Currently selected token, or null if no value is selected. */
  value: Token | null
  /** Callback function that is invoked when the selected token changes. */
  onChange: (newValue: Token | null) => void
  /** Array of tokens that the user can select from. */
  options: Token[]
  /** Label floating above the select input */
  floatingLabel?: string
  /** Placeholder text to display when no value is selected. */
  placeholder?: string
  /** Icon to display in the placeholder. */
  placeholderIcon?: ReactNode
  /** Whether the select input is disabled (non-interactive). */
  disabled?: boolean
  /** Additional classes to apply to the select input. */
  className?: string
}

const TokenSelect: FC<TokenSelectProps> = ({
  value,
  onChange,
  options,
  floatingLabel,
  placeholder,
  placeholderIcon = <TokenIcon />,
  disabled,
  className,
}) => {
  const handleSelectionChange = (newValue: string) => {
    const selectedToken = options.find(opt => JSON.stringify(opt.id) === newValue) || null
    onChange(selectedToken)
  }

  return (
    <div className={twMerge(`flex items-center justify-center border-turtle-level3`, className)}>
      <Select onValueChange={handleSelectionChange} disabled={disabled}>
        <SelectTrigger
          floatingLabel={floatingLabel}
          trailing={<Button variant="outline" size="sm" label="Max" className="min-w-[40px]" />}
        >
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
                  alt={value.name}
                  width={24}
                  height={24}
                  className="h-[1.5rem] w-[1.5rem] rounded-full"
                />
                <p>{value.symbol}</p>
                <ChevronDown strokeWidth={1} />
                <div className="ml-2 h-[1.625rem] border-1 border-turtle-level3" />
                {/* Textfield */}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <div className="flex flex-col gap-2">
            {options.map((option, index) => (
              <SelectItem
                key={index + option.name + option.logoURI}
                value={JSON.stringify(option.id)}
              >
                <div className="flex items-center gap-1">
                  <Image
                    src={option.logoURI}
                    alt={option.name}
                    width={24}
                    height={24}
                    className="h-[1.5rem] w-[1.5rem] rounded-full"
                  />
                  {option.symbol}
                </div>
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>
    </div>
  )
}

export default TokenSelect
