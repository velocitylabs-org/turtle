'use client'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { SelectProps, TokenAmount } from '@/models/select'
import { Token } from '@/models/token'
import { cn } from '@/utils/cn'
import Image from 'next/image'
import { forwardRef, useRef, useState } from 'react'
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
      secondPlaceholder,
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
    const inputRef = useRef<HTMLInputElement>(null)

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
      <div ref={ref} className={cn('relative w-full', className)} data-cy="token-select">
        {floatingLabel && (
          <label className="top absolute -top-2 left-3 z-30 origin-top-left bg-background px-1 text-xs text-turtle-level5">
            {floatingLabel}
          </label>
        )}
        <Tooltip content={error}>
          {/* Trigger */}
          <div
            ref={triggerRef}
            onClick={handleTriggerClick}
            className={cn(
              'flex items-center justify-between rounded-md border-1 border-turtle-level3 bg-background px-3 text-sm',
              !disabled && 'cursor-pointer',
              disabled && 'opacity-30',
              error && 'border-turtle-error',
            )}
          >
            {/* Trigger Content */}
            <div className="flex h-[3.5rem] flex-grow items-center gap-1">
              <div className="flex items-center gap-1" data-cy="token-select-trigger">
                {value?.token ? (
                  <>
                    <div className="group/list-item peer/list-item gap-squid-xs rounded-squid-s px-squid-xs py-squid-xxs bg-material-light-thin hover:bg-material-light-thin relative flex w-full max-w-full items-center justify-start">
                      <Image
                        src={value.token.logoURI}
                        alt={value.token.name}
                        width={24}
                        height={24}
                        className="token-logo h-[2rem] w-[2rem] rounded-full border-1 border-turtle-foreground bg-background"
                      />
                      <div className="translate-x-2/5 absolute bottom-[0px] right-0 h-fit w-fit">
                        <div className="relative">
                          <Image
                            alt=""
                            width={12}
                            height={12}
                            src="https://raw.githubusercontent.com/0xsquid/assets/main/images/webp128/chains/ethereum.webp"
                            className="w-squid-m rounded-squid-xxs outline-grey-900 relative block aspect-square max-w-full rounded-full border-1 border-white object-cover outline outline-2 transition-[width,height] duration-300"
                          />
                        </div>
                      </div>
                    </div>
                    <span className="ml-2 text-nowrap" data-cy="token-select-symbol">
                      {value.token.symbol}
                    </span>
                  </>
                ) : (
                  <>
                    {placeholderIcon}
                    {placeholder}
                  </>
                )}
              </div>
              <ChevronDown strokeWidth={0.2} className="ml-1" />
              <VerticalDivider />
              <input
                ref={inputRef}
                data-cy="amount-input"
                disabled={disabled}
                type="number"
                className="h-[70%] bg-transparent focus:border-0 focus:outline-none"
                placeholder={secondPlaceholder ?? 'Amount'}
                value={value?.amount ?? ''}
                onChange={handleAmountChange}
                onClick={e => e.stopPropagation()}
                onWheel={e => e.target instanceof HTMLElement && e.target.blur()}
                autoFocus
              />
            </div>

            {/* Trailing component. E.g. Max Button */}
            {trailing && <div className="absolute right-0 ml-2 mr-3 bg-white">{trailing}</div>}
          </div>
        </Tooltip>

        {/* Dropdown */}
        <Dropdown isOpen={isOpen} dropdownRef={dropdownRef}>
          {options.map(option => {
            if (option.token === null) return null
            return (
              <li
                key={option.token.id}
                className={cn(
                  'flex cursor-pointer items-center gap-1 p-2',
                  !option.allowed && 'cursor-not-allowed opacity-50',
                )}
                onClick={() => option.allowed && handleSelectionChange(option.token)}
              >
                <Image
                  src={option.token.logoURI}
                  alt={option.token.name}
                  width={32}
                  height={32}
                  priority
                  className="token-logo h-[2rem] w-[2rem] rounded-full border-1 border-turtle-foreground bg-background"
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
