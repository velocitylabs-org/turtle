'use client'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { SelectProps, TokenAmount } from '@/models/select'
import { Token } from '@/models/token'
import { cn } from '@/utils/cn'
import Image from 'next/image'
import { forwardRef, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import Dropdown from './Dropdown'
import ChevronDown from './svg/ChevronDown'
import TokenIcon from './svg/TokenIcon'
import { Tooltip } from './Tooltip'
import VerticalDivider from './VerticalDivider'

export interface TokenAmountSelectProps extends SelectProps<TokenAmount> {}

const TokenAmountSelect = forwardRef<HTMLDivElement, TokenAmountSelectProps>(
  (
    {
      value,
      onChange,
      options,
      floatingLabel,
      placeholder = 'Token',
      placeholderIcon = <TokenIcon />,
      trailing,
      disabled,
      error,
      className,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const triggerRef = useRef<HTMLDivElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useOutsideClick(triggerRef, dropdownRef, () => setIsOpen(false))

    const handleSelectionChange = (selectedToken: Token | null) => {
      onChange({ token: selectedToken, amount: value?.amount ?? null })
      setIsOpen(false)
    }

    const handleTriggerClick = () => {
      if (!disabled) setIsOpen(!isOpen)
    }

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = e.target.value === '' ? null : parseFloat(e.target.value)
      onChange({ token: value?.token ?? null, amount: newVal })
    }

    return (
      <div ref={ref} className={twMerge('relative w-full', className)}>
        {floatingLabel && (
          <label className="top absolute -top-2 left-3 z-30 origin-top-left bg-background px-1 text-xs text-turtle-level5">
            {floatingLabel}
          </label>
        )}
        <Tooltip content={error}>
          <div
            ref={triggerRef}
            className={cn(
              'flex cursor-pointer items-center justify-between rounded-md border-1 border-turtle-level3 bg-background px-3 text-sm',
              disabled && 'opacity-30',
              error && 'border-turtle-error',
            )}
            onClick={handleTriggerClick}
          >
            <div className="flex h-[3.5rem] flex-grow items-center gap-1">
              {value?.token ? (
                <>
                  <Image
                    src={value.token.logoURI}
                    alt={value.token.name}
                    width={24}
                    height={24}
                    className="h-[1.5rem] w-[1.5rem] rounded-full border-1 border-turtle-foreground"
                  />
                  <span className="text-nowrap">{value.token.symbol}</span>
                </>
              ) : (
                <>
                  {placeholderIcon}
                  {placeholder}
                </>
              )}
              <ChevronDown strokeWidth={0.2} className="ml-1" />
              <VerticalDivider />
              <input
                type="number"
                className="h-[70%] bg-transparent focus:border-0 focus:outline-none"
                placeholder="Amount"
                value={value?.amount ?? ''}
                onChange={handleAmountChange}
                onClick={e => e.stopPropagation()}
              />
            </div>
            {trailing && <div className="ml-2">{trailing}</div>}
          </div>
        </Tooltip>

        <Dropdown isOpen={isOpen} dropdownRef={dropdownRef}>
          {options.map(option => {
            if (option.token === null) return null
            return (
              <li
                key={option.token.id}
                className="flex cursor-pointer items-center gap-2 p-2"
                onClick={() => handleSelectionChange(option.token)}
              >
                <Image
                  src={option.token.logoURI}
                  alt={option.token.name}
                  width={24}
                  height={24}
                  className="h-[1.5rem] w-[1.5rem] rounded-full border-1 border-turtle-foreground"
                />
                <span className="text-sm">{option.token.symbol}</span>
              </li>
            )
          })}
        </Dropdown>
      </div>
    )
  },
)

TokenAmountSelect.displayName = 'TokenAmountSelect'

export default TokenAmountSelect
