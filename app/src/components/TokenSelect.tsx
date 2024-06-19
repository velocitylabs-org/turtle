'use client'

import { Token } from '@/models/token'
import Image from 'next/image'
import { FC, useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import ChevronDown from './svg/ChevronDown'
import TokenIcon from './svg/TokenIcon'

export interface TokenAmount {
  token: Token | null
  amount: number | null
}

interface TokenSelectProps {
  /** Currently selected token and amount, or null if no value is selected. */
  value: TokenAmount
  /** Callback function that is invoked when the selected token changes. */
  onChange: (newValue: TokenAmount) => void
  /** Array of tokens that the user can select from. */
  options: Token[]
  /** Label floating above the select input */
  floatingLabel?: string
  /** Placeholder text to display when no value is selected. */
  placeholder?: string
  /** Icon to display in the placeholder. */
  placeholderIcon?: React.ReactNode
  /** Component to attach at the end */
  trailing?: React.ReactNode
  /** Whether the select input is disabled (non-interactive). */
  disabled?: boolean
  /** Additional classes to apply to the select input. */
  className?: string
}

const VerticalDivider: FC = () => (
  <div className="ml-2 h-[1.625rem] border-1 border-turtle-level3" />
)

const TokenSelect: FC<TokenSelectProps> = ({
  value,
  onChange,
  options,
  floatingLabel,
  placeholder = 'Token',
  placeholderIcon = <TokenIcon />,
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

  const handleSelectionChange = (selectedToken: Token) => {
    onChange({ token: selectedToken, amount: value.amount })
    setIsOpen(false)
  }

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className={twMerge('relative w-full', className)}>
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
          {value.token ? (
            <>
              <Image
                src={value.token.logoURI}
                alt={value.token.name}
                width={24}
                height={24}
                className="h-[1.5rem] w-[1.5rem] rounded-full"
              />
              <span>{value.token.symbol}</span>
            </>
          ) : (
            <>
              {placeholderIcon}
              {placeholder}
            </>
          )}
          <ChevronDown strokeWidth={0.2} />
          <VerticalDivider />
          <input
            type="number"
            className="h-[70%] bg-transparent focus:border-0 focus:outline-none"
            placeholder="Amount"
            onChange={e => onChange({ token: value.token, amount: +e.target.value })}
            onClick={e => e.stopPropagation()}
          />
        </div>

        {trailing && <div className="ml-2">{trailing}</div>}
      </div>

      {/* Dialog */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 z-10 max-h-60 min-h-[6rem] translate-y-[-3.58rem] overflow-auto rounded-md border-1 border-turtle-level3 bg-white"
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
                <span className="text-sm">{option.symbol}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default TokenSelect
