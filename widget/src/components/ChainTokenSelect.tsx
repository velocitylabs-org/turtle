import { useOutsideClick } from '@/hooks/useOutsideClick'
import useTokenPrice from '@/hooks/useTokenPrice'
import { Chain } from '@/models/chain'
import { ManualAddressInput } from '@/models/select'
import { Token } from '@/models/token'
import { cn } from '@/utils/helper'
import { reorderOptionsBySelectedItem } from '@/utils/sort'
import NumberFlow from '@number-flow/react'
import { ChangeEvent, ReactNode, RefObject, useMemo, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { colors } from '../../tailwind.config'
import Button from './Button'
import ChainTrigger from './ChainTrigger'
import Dropdown from './Dropdown'
import ChevronDown from '@/assets/svg/ChevronDown'
import { Cross } from '@/assets/svg/Cross'
import SearchIcon from '@/assets/svg/SearchIcon'
import TokenIcon from '@/assets/svg/TokenIcon'
import { TokenLogo } from './TokenLogo'
import { Tooltip } from './Tooltip'
import VerticalDivider from './VerticalDivider'

const maxDollars = 100000000000 // 100B

const numberFlowFormat = {
  notation: 'compact' as const,
  maximumFractionDigits: 3,
}

interface ChainTokenSelectProps {
  chain: {
    value: Chain | null
    onChange: (chain: Chain | null) => void
    options: Chain[]
    error?: string
    clearable?: boolean
    orderBySelected?: boolean
  }
  token: {
    value: Token | null
    onChange: (token: Token | null) => void
    options: Token[]
    sourceChainToDetermineOriginBanner: Chain | null
    error?: string
    clearable?: boolean
    orderBySelected?: boolean
    /** The token displayed at the top or below the selected token in the dropdown. Can be used to make it easier to select the source token again. */
    priorityToken?: Token | null
  }
  amount?: {
    value: number | null
    onChange: (amount: number | null) => void
    error?: string
    trailingAction?: ReactNode
    /** The placeholder to display when no amount is entered. Could be the max balance available. */
    placeholder?: string
    disabled?: boolean
  }
  wallet?: {
    address?: string
    walletButton?: ReactNode
    manualAddressInput?: ManualAddressInput
    error?: string
  }
  /** The label to display above the whole component when dropdown is not open */
  floatingLabel?: string
  disabled?: boolean
  className?: string
}

export default function ChainTokenSelect({
  chain,
  token,
  amount,
  wallet,
  floatingLabel = 'From',
  disabled,
  className,
}: ChainTokenSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  useOutsideClick(triggerRef, dropdownRef, () => setIsOpen(false))

  // Token hooks
  const { price } = useTokenPrice(token.value)
  const inDollars = !!amount?.value && price ? price * amount.value : undefined

  // Search state
  const [chainSearch, setChainSearch] = useState<string>('')
  const [tokenSearch, setTokenSearch] = useState<string>('')

  // Filter the options based on search
  const filteredChainOptions = useMemo(() => {
    return chain.options.filter(option =>
      option.name.toLowerCase().includes(chainSearch.toLowerCase()),
    )
  }, [chain.options, chainSearch])

  const sortedAndFilteredChainOptions = useMemo(() => {
    return chain.orderBySelected
      ? reorderOptionsBySelectedItem(filteredChainOptions, 'uid', chain.value?.uid)
      : filteredChainOptions
  }, [filteredChainOptions, chain.orderBySelected, chain.value?.uid])

  const filteredTokenOptions = useMemo(() => {
    return token.options.filter(option =>
      option.symbol.toLowerCase().includes(tokenSearch.toLowerCase()),
    )
  }, [token.options, tokenSearch])
  // Sort the options by priority token and then by selected token
  const sortedAndFilteredTokenOptions = useMemo(() => {
    let sorted = filteredTokenOptions
    // move priority token to the top if it exists
    if (token.priorityToken)
      sorted = reorderOptionsBySelectedItem(filteredTokenOptions, 'id', token.priorityToken.id)

    // move selected token to the top if it exists
    if (token.orderBySelected) sorted = reorderOptionsBySelectedItem(sorted, 'id', token.value?.id)

    return sorted
  }, [filteredTokenOptions, token.orderBySelected, token.value?.id, token.priorityToken])

  const handleChainSelect = (selectedChain: Chain) => {
    chain.onChange(selectedChain)
    token.onChange(null)
  }

  const handleTokenSelect = (selectedToken: Token) => {
    token.onChange(selectedToken)
    setIsOpen(false)
  }

  const handleChainClear = () => {
    chain.onChange(null)
    token.onChange(null)
  }
  const handleTokenClear = () => token.onChange(null)

  const handleDropdownTriggerClick = () => {
    if (!disabled) setIsOpen(!isOpen)
  }

  return (
    <div className={twMerge('relative w-full', className)}>
      <div className="flex">
        <div className="relative flex-1">
          {/* 1. Floating Label */}
          <label className="absolute -top-2 left-3 z-30 origin-top-left bg-background px-1 text-xs text-turtle-level5">
            {isOpen ? 'Chain' : floatingLabel}
          </label>

          <ChainTrigger
            value={chain.value}
            disabled={disabled}
            onClick={handleDropdownTriggerClick}
            error={wallet?.error}
            className={cn(
              'rounded-md rounded-bl-none rounded-br-none',
              amount?.error && 'border-b-0',
            )}
            triggerRef={triggerRef}
            walletAddress={wallet?.address}
            manualAddressInput={wallet?.manualAddressInput}
            trailingAction={wallet?.walletButton}
          />
        </div>

        {/* 2. Floating Label */}
        {isOpen && (
          <div className="relative flex-1">
            <label className="absolute -top-2 left-3 z-30 origin-top-left bg-background px-1 text-xs text-turtle-level5">
              Token
            </label>
          </div>
        )}
      </div>

      <TokenAmountInput
        token={token}
        amount={amount}
        disabled={disabled}
        onTriggerClick={handleDropdownTriggerClick}
        triggerRef={triggerRef}
        inDollars={inDollars}
      />

      {/* Dropdown */}
      <Dropdown isOpen={isOpen} dropdownRef={dropdownRef}>
        <div className="flex">
          {/* Chain options (left side) */}
          <div className="flex flex-1 flex-col border-r-1 border-turtle-level3">
            <ChainList
              searchString={chainSearch}
              setSearchString={setChainSearch}
              options={sortedAndFilteredChainOptions}
              selectedChain={chain.value}
              clearable={chain.clearable}
              onSelect={handleChainSelect}
              onClear={handleChainClear}
            />
          </div>

          {/* Token options (right side) */}
          <div className="flex flex-1 flex-col">
            <TokenList
              searchString={tokenSearch}
              setSearchString={setTokenSearch}
              options={sortedAndFilteredTokenOptions}
              selectedToken={token.value}
              clearable={token.clearable}
              sourceChainToDetermineOriginBanner={token.sourceChainToDetermineOriginBanner}
              onSelect={handleTokenSelect}
              onClear={handleTokenClear}
            />
          </div>
        </div>
      </Dropdown>
    </div>
  )
}

interface TokenAmountInputProps {
  token: {
    value: Token | null
    sourceChainToDetermineOriginBanner: Chain | null
  }
  amount?: {
    value: number | null
    onChange: (amount: number | null) => void
    error?: string
    trailingAction?: ReactNode
    placeholder?: string
    disabled?: boolean
  }
  onTriggerClick: () => void
  triggerRef: RefObject<HTMLDivElement | null>
  disabled?: boolean
  inDollars?: number
}

const TokenAmountInput = ({
  token,
  amount,
  disabled,
  onTriggerClick,
  triggerRef,
  inDollars,
}: TokenAmountInputProps) => {
  const showVerticalDivider = !!amount?.value || !!amount?.placeholder
  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value === '' ? null : parseFloat(e.target.value)
    amount?.onChange?.(newVal)
  }

  return (
    <Tooltip content={amount?.error}>
      <div
        ref={triggerRef}
        className={cn(
          'flex items-center justify-between rounded-md rounded-t-none border-1 border-t-0 border-turtle-level3 bg-background px-3 text-sm',
          disabled && 'opacity-30',
          amount?.error && 'border-1 border-turtle-error',
        )}
      >
        <div className="flex h-[3.5rem] flex-grow items-center gap-1">
          <div
            className={cn('flex items-center gap-1', !disabled && 'cursor-pointer')}
            data-cy="token-select-trigger"
            onClick={disabled ? undefined : onTriggerClick}
          >
            {token.value ? (
              <>
                <TokenLogo
                  token={token.value}
                  sourceChain={token.sourceChainToDetermineOriginBanner}
                />
                <span className="ml-1 text-nowrap" data-cy="token-select-symbol">
                  {token.value.symbol}
                </span>
              </>
            ) : (
              <>
                <TokenIcon />
                Token
              </>
            )}
            <ChevronDown strokeWidth={0.2} className="ml-1" />
            {showVerticalDivider && <VerticalDivider />}
          </div>
          <div className="align-center ml-1 flex flex-col">
            <input
              data-cy="amount-input"
              disabled={disabled || amount?.disabled}
              type="number"
              className={cn(
                'bg-transparent text-sm focus:border-0 focus:outline-none min-[350px]:text-base sm:text-xl',
                inDollars && 'animate-slide-up-slight',
                amount?.error && 'text-turtle-error',
              )}
              placeholder={amount?.placeholder ?? 'Amount'}
              value={amount?.value ?? ''}
              onChange={handleAmountChange}
              onClick={e => e.stopPropagation()}
              onWheel={e => e.target instanceof HTMLElement && e.target.blur()}
              autoFocus
            />
            {inDollars && (
              <div className={'animate-slide-up mt-[-3px] text-sm text-turtle-level4'}>
                <NumberFlow
                  value={Math.min(inDollars, maxDollars)}
                  prefix="$"
                  format={numberFlowFormat}
                />
              </div>
            )}
          </div>
        </div>

        {amount?.trailingAction && (
          <div className="absolute right-0 ml-2 mr-3 bg-white">{amount.trailingAction}</div>
        )}
      </div>
    </Tooltip>
  )
}

interface ChainListProps {
  searchString: string
  setSearchString: (value: string) => void
  options: Chain[]
  selectedChain: Chain | null
  clearable?: boolean
  onSelect: (chain: Chain) => void
  onClear: () => void
}

const ChainList = ({
  searchString,
  setSearchString,
  options,
  selectedChain,
  clearable,
  onSelect,
  onClear,
}: ChainListProps) => {
  return (
    <>
      <SearchBar placeholder="Search" value={searchString} onChange={setSearchString} />
      <div className="max-h-[15rem] overflow-y-auto">
        <ul className="flex flex-col">
          {options.map(option => (
            <li
              key={option.uid}
              className={cn(
                'flex cursor-pointer items-center justify-between px-3 py-3 hover:bg-turtle-level1',
                selectedChain?.uid === option.uid &&
                  'bg-turtle-secondary-light hover:bg-turtle-secondary-light',
              )}
              onClick={() => onSelect(option)}
            >
              <div className="flex items-center gap-2">
                <img
                  src={option.logoURI}
                  alt={option.name}
                  width={24}
                  height={24}
                  className="h-[2rem] w-[2rem] rounded-full border-1 border-turtle-foreground bg-background"
                />
                <span className="text-sm">{option.name}</span>
              </div>

              {selectedChain?.uid === option.uid && clearable && <ClearButton onClick={onClear} />}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

interface TokenListProps {
  searchString: string
  setSearchString: (value: string) => void
  options: Token[]
  selectedToken: Token | null
  clearable?: boolean
  sourceChainToDetermineOriginBanner: Chain | null
  onSelect: (token: Token) => void
  onClear: () => void
}

const TokenList = ({
  searchString,
  setSearchString,
  options,
  selectedToken,
  clearable,
  sourceChainToDetermineOriginBanner,
  onSelect,
  onClear,
}: TokenListProps) => {
  return (
    <>
      <SearchBar placeholder="Search" value={searchString} onChange={setSearchString} />
      <div className="max-h-[15rem] overflow-y-auto">
        <ul className="flex flex-col">
          {options.map(option => (
            <li
              key={option.id}
              className={cn(
                'flex cursor-pointer items-center justify-between px-3 py-3 hover:bg-turtle-level1',
                selectedToken?.id === option.id &&
                  'bg-turtle-secondary-light hover:bg-turtle-secondary-light',
              )}
              onClick={() => onSelect(option)}
            >
              <div className="flex items-center gap-2">
                <TokenLogo token={option} sourceChain={sourceChainToDetermineOriginBanner} />
                <span className="text-sm">{option.symbol}</span>
              </div>

              {selectedToken?.id === option.id && clearable && <ClearButton onClick={onClear} />}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

const ClearButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      label="Clear"
      size="sm"
      variant="outline"
      className="z-10 h-[28px] w-[28px] min-w-5 border-turtle-secondary text-sm hover:border-turtle-secondary"
      onClick={onClick}
    >
      <div className="flex items-center gap-1 text-turtle-foreground">
        <Cross stroke={colors['turtle-secondary']} />
      </div>
    </Button>
  )
}

const SearchBar = ({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string
  value: string
  onChange: (value: string) => void
}) => {
  return (
    <div className="sticky top-0 z-20 flex items-center gap-2 border-b-1 border-turtle-level3 bg-turtle-background px-3 py-3">
      <div className="flex h-[2rem] w-[2rem] shrink-0 items-center justify-center">
        <SearchIcon fill={colors['turtle-level5']} width={17} height={17} />
      </div>

      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border-0 bg-transparent text-sm placeholder:text-turtle-level5 focus:border-0 focus:outline-none"
      />
    </div>
  )
}
