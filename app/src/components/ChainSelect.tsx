'use client'

import { Chain } from '@/models/chain'
import Image from 'next/image'
import { FC, ReactNode, useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import ChevronDown from './svg/ChevronDown'
import ChainIcon from './svg/ChainIcon'

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
  /** Icon to display in the placeholder. */
  placeholderIcon?: React.ReactNode
  /** The connected address is displayed to the right of the Chain  */
  walletAddress?: string
  /** Component to attach at the end */
  trailing?: React.ReactNode
  /** Whether the select input is disabled (non-interactive). */
  disabled?: boolean
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
  walletAddress,
  trailing,
  disabled,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelectionChange = (selectedChain: Chain) => {
    onChange(selectedChain)
    setIsOpen(false)
  }

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className={twMerge('relative w-full', className)}>
      {floatingLabel && (
        <label className="absolute -top-2 left-3 z-30 origin-top-left bg-background px-1 text-xs text-turtle-level5">
          {floatingLabel}
        </label>
      )}
      <div
        ref={triggerRef}
        className={twMerge(
          'flex items-center justify-between rounded-md border-1 border-turtle-level3 bg-background px-3 text-sm',
          disabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer',
        )}
        onClick={handleTriggerClick}
      >
        <div className="flex h-[3.5rem] flex-grow items-center gap-2">
          {/* Trigger Content or Placeholder Content */}
          {value ? (
            <>
              <Image
                src={value.logoURI}
                alt={value.name}
                width={24}
                height={24}
                className="h-[1.5rem] w-[1.5rem] rounded-full"
              />
              {!walletAddress && <span>{value.name}</span>}
            </>
          ) : (
            <>
              {placeholderIcon}
              {placeholder}
            </>
          )}
          <ChevronDown strokeWidth={0.2} />
          {walletAddress}
        </div>

        {trailing && <div className="ml-2">{trailing}</div>}
      </div>

      {/* Dialog */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 z-20 max-h-60 min-h-[6rem] translate-y-[-3.58rem] overflow-auto rounded-md border-1 border-turtle-level3 bg-white"
        >
          <ul className="flex flex-col gap-2 px-1 py-2">
            {options.map(option => (
              <li
                key={option.id}
                className="flex cursor-pointer items-center gap-2 p-2"
                onClick={() => handleSelectionChange(option)}
              >
                <Image
                  src={option.logoURI}
                  alt={option.name}
                  width={24}
                  height={24}
                  className="h-[1.5rem] w-[1.5rem] rounded-full"
                />
                <span className="text-sm">{option.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ChainSelect
