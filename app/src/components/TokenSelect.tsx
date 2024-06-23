'use client'
import { FC, useRef, useState } from 'react'
import Image from 'next/image'
import { twMerge } from 'tailwind-merge'
import ChevronDown from './svg/ChevronDown'
import TokenIcon from './svg/TokenIcon'
import VerticalDivider from './VerticalDivider'
import Dropdown from './Dropdown'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { Token } from '@/models/token'

export interface TokenAmount {
  token: Token | null
  amount: number | null
}

interface TokenSelectProps {
  value: TokenAmount
  onChange: (newValue: TokenAmount) => void
  options: Token[]
  floatingLabel?: string
  placeholder?: string
  placeholderIcon?: React.ReactNode
  trailing?: React.ReactNode
  disabled?: boolean
  className?: string
}

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

  useOutsideClick(triggerRef, dropdownRef, () => setIsOpen(false))

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
      {floatingLabel && (
        <label className="top absolute -top-2 left-3 z-30 origin-top-left bg-background px-1 text-xs text-turtle-level5">
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

      <Dropdown isOpen={isOpen} dropdownRef={dropdownRef}>
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
      </Dropdown>
    </div>
  )
}

export default TokenSelect
