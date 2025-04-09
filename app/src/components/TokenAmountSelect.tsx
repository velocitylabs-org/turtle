'use client'
import NumberFlow from '@number-flow/react'
import { forwardRef, useRef, useState } from 'react'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import useTokenPrice from '@/hooks/useTokenPrice'
import { Chain } from '@/models/chain'
import { SelectProps, TokenAmount } from '@/models/select'
import { Token } from '@/models/token'
import { cn } from '@/utils/cn'
import Dropdown from './Dropdown'
import ChevronDown from './svg/ChevronDown'
import TokenIcon from './svg/TokenIcon'
import TokenLogo from './TokenLogo'
import Tooltip from './Tooltip'
import VerticalDivider from './VerticalDivider'

const maxDollars = 100000000000 // 100B

export interface TokenAmountSelectProps extends SelectProps<TokenAmount> {
  sourceChain: Chain | null
}

const numberFlowFormat = {
  notation: 'compact' as const,
  maximumFractionDigits: 3,
}

const TokenAmountSelect = forwardRef<HTMLDivElement, TokenAmountSelectProps>(
  (
    {
      sourceChain,
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

    const { price } = useTokenPrice(value?.token)
    const inDollars = !!value?.amount && price ? price * value.amount : undefined

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
          <label
            className={cn(
              'top absolute -top-2 left-3 z-30 origin-top-left bg-background px-1 text-xs text-turtle-level5',
              error && 'text-turtle-error',
            )}
          >
            {floatingLabel}
          </label>
        )}
        <Tooltip content={error}>
          {/* Trigger */}
          <div
            ref={triggerRef}
            className={cn(
              'flex items-center justify-between rounded-md border-1 border-turtle-level3 bg-background px-3 text-sm',
              !disabled && 'cursor-pointer',
              disabled && 'opacity-30',
              error && 'border-turtle-error',
            )}
          >
            {/* Trigger Content */}
            <div className="flex h-[3.5rem] min-w-0 flex-grow items-center">
              <div
                className="flex items-center gap-1"
                data-cy="token-select-trigger"
                onClick={handleTriggerClick}
              >
                {value?.token ? (
                  <>
                    <TokenLogo token={value.token} sourceChain={sourceChain} />
                    <span className="ml-1 text-nowrap" data-cy="token-select-symbol">
                      {value.token.symbol}
                    </span>
                  </>
                ) : (
                  <>
                    {placeholderIcon}
                    {placeholder}
                  </>
                )}
                <ChevronDown strokeWidth={0.2} className="mx-1.5" />
              </div>
              <VerticalDivider />
              <div className="align-center ml-2 flex min-w-0 flex-col">
                <input
                  ref={inputRef}
                  data-cy="amount-input"
                  disabled={disabled}
                  type="number"
                  className={cn(
                    'bg-transparent text-sm focus:border-0 focus:outline-none min-[350px]:text-base sm:text-xl',
                    inDollars && 'animate-slide-up-slight',
                    error && 'text-turtle-error',
                  )}
                  placeholder={secondPlaceholder ?? 'Amount'}
                  value={value?.amount ?? ''}
                  onChange={handleAmountChange}
                  onClick={e => e.stopPropagation()}
                  onWheel={e => e.target instanceof HTMLElement && e.target.blur()}
                  autoFocus
                />
                {inDollars && (
                  <div className={'animate-slide-up mt-[-3px] text-sm text-turtle-level4'}>
                    <NumberFlow
                      value={Math.min(inDollars, maxDollars)} // Ensure the value doesn't exceed the max
                      prefix="$"
                      format={numberFlowFormat}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Trailing component. E.g. Max Button */}
            {trailing && (
              <div className="absolute right-0 ml-2 mr-3 bg-white md:right-0">{trailing}</div>
            )}
          </div>
        </Tooltip>

        {/* Dropdown */}
        <Dropdown isOpen={isOpen} dropdownRef={dropdownRef}>
          {options.map(option => {
            if (option.token === null || !option.allowed) return null
            const isSelected = value?.token?.id === option.token.id

            return (
              <li
                key={option.token.id}
                className={cn(
                  'flex cursor-pointer items-center gap-1 px-3 py-3 hover:bg-turtle-level1',
                  isSelected && 'bg-turtle-secondary-light hover:bg-turtle-secondary-light',
                )}
                onClick={() => option.allowed && handleSelectionChange(option.token)}
              >
                <TokenLogo token={option.token} sourceChain={sourceChain} />
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
