'use client'
import { Chain } from '@/models/chain'
import { truncateAddress } from '@/utils/address'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { FC, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import ChainIcon from './svg/ChainIcon'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface ChainSelectProps {
  /** Currently selected chain, or null if no value is selected. */
  value: Chain | null
  /** Callback function that is invoked when the selected chain changes. */
  onChange: (newValue: Chain | null) => void
  /** The connected address to display */
  address?: string
  /** Array of chains that the user can select from. */
  options: Chain[]
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
  /** Additional classes to apply to the select input. */
  className?: string
}

const ChainSelect: FC<ChainSelectProps> = ({
  value,
  onChange,
  options,
  floatingLabel,
  placeholder,
  placeholderIcon = <ChainIcon />,
  disabled,
  walletButton,
  address,
  className,
}) => {
  const handleSelectionChange = (newValue: string) => {
    const selectedChain = options.find(opt => JSON.stringify(opt.chainId) === newValue) || null
    onChange(selectedChain)
  }

  return (
    <div className={twMerge(`flex items-center justify-center border-turtle-level3`, className)}>
      <Select onValueChange={handleSelectionChange} disabled={disabled}>
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
                  alt={value.name}
                  width={24}
                  height={24}
                  className="h-[1.5rem] w-[1.5rem] rounded-full"
                />
                {!address && <p>{value.name}</p>}
                <ChevronDown strokeWidth={1} />
                {address && <p>{truncateAddress(address)}</p>}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <div className="flex flex-col gap-2">
            {options.map((option, index) => (
              <SelectItem
                key={index + option.name + option.logoURI}
                value={JSON.stringify(option.chainId)}
              >
                <div className="flex items-center gap-1">
                  <Image
                    src={option.logoURI}
                    alt={option.name}
                    width={24}
                    height={24}
                    className="h-[1.5rem] w-[1.5rem] rounded-full"
                  />
                  {option.name}
                </div>
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>
    </div>
  )
}

export default ChainSelect
