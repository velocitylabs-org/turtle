'use client'
import NumberFlow from '@number-flow/react'
import { Chain, Token, ManualRecipientInput } from '@velocitylabs-org/turtle-registry'
import { Button, TokenLogo, Tooltip, cn } from '@velocitylabs-org/turtle-ui'

import Image from 'next/image'
import { ChangeEvent, ReactNode, RefObject, useMemo, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import useTokenPrice from '@/hooks/useTokenPrice'
import { reorderOptionsBySelectedItem } from '@/utils/sort'
import { colors } from '../../tailwind.config'
import ChainTrigger from './ChainTrigger'
import Dropdown from './Dropdown'
import SearchBar from './SearchBar'
import ChevronDown from './svg/ChevronDown'
import Cross from './svg/Cross'
import TokenIcon from './svg/TokenIcon'
import VerticalDivider from './VerticalDivider'

const maxDollars = 100000000000 // 100B

const numberFlowFormat = {
  notation: 'compact' as const,
  maximumFractionDigits: 3,
}

interface ChainTokenSelectProps {
  chainProps: {
    value: Chain | null
    onChange: (chain: Chain | null) => void
    options: Chain[]
    error?: string
    clearable?: boolean
    orderBySelected?: boolean
  }
  tokenProps: {
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
  amountProps?: {
    value: number | null
    onChange: (amount: number | null) => void
    error?: string
    trailingAction?: ReactNode
    /** The placeholder to display when no amount is entered. Could be the max balance available. */
    placeholder?: string
    disabled?: boolean
    tooltipContent?: string
  }
  walletProps?: {
    address?: string
    walletButton?: ReactNode
    manualRecipientInput?: ManualRecipientInput
    error?: string
  }
  /** The label to display above the whole component when dropdown is not open */
  floatingLabel?: string
  disabled?: boolean
  className?: string
}

export default function ChainTokenSelect({
  chainProps,
  tokenProps,
  amountProps,
  walletProps,
  floatingLabel = 'From',
  disabled,
  className,
}: ChainTokenSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  useOutsideClick(triggerRef, dropdownRef, () => setIsOpen(false))

  // Token hooks
  const { price } = useTokenPrice(tokenProps.value)
  const inDollars = !!amountProps?.value && price ? price * amountProps.value : undefined

  // Search state
  const [chainSearch, setChainSearch] = useState<string>('')
  const [tokenSearch, setTokenSearch] = useState<string>('')

  // Filter the options based on search
  const filteredChainOptions = useMemo(() => {
    return chainProps.options.filter(option =>
      option.name.toLowerCase().includes(chainSearch.toLowerCase()),
    )
  }, [chainProps.options, chainSearch])

  const sortedAndFilteredChainOptions = useMemo(() => {
    return chainProps.orderBySelected
      ? reorderOptionsBySelectedItem(filteredChainOptions, 'uid', chainProps.value?.uid)
      : filteredChainOptions
  }, [filteredChainOptions, chainProps.orderBySelected, chainProps.value?.uid])

  const filteredTokenOptions = useMemo(() => {
    return tokenProps.options.filter(option =>
      option.symbol.toLowerCase().includes(tokenSearch.toLowerCase()),
    )
  }, [tokenProps.options, tokenSearch])

  // Sort the options by priority token and then by selected token
  const sortedAndFilteredTokenOptions = useMemo(() => {
    let sorted = filteredTokenOptions
    // move priority token to the top if it exists
    if (tokenProps.priorityToken)
      sorted = reorderOptionsBySelectedItem(sorted, 'id', tokenProps.priorityToken.id)

    // move selected token to the top if it exists
    if (tokenProps.orderBySelected)
      sorted = reorderOptionsBySelectedItem(sorted, 'id', tokenProps.value?.id)

    return sorted
  }, [
    filteredTokenOptions,
    tokenProps.orderBySelected,
    tokenProps.value?.id,
    tokenProps.priorityToken,
  ])

  const handleChainSelect = (selectedChain: Chain) => {
    chainProps.onChange(selectedChain)
    tokenProps.onChange(null)
  }

  const handleTokenSelect = (selectedToken: Token) => {
    tokenProps.onChange(selectedToken)
    setIsOpen(false)
  }

  const handleChainClear = () => {
    chainProps.onChange(null)
    tokenProps.onChange(null)
  }
  const handleTokenClear = () => tokenProps.onChange(null)

  const handleDropdownTriggerClick = () => {
    if (!disabled) setIsOpen(!isOpen)
  }

  return (
    <div className={twMerge('relative w-full', className)}>
      <div className="flex">
        <div className="relative flex-1">
          {/* 1. Floating Label */}
          <label className="absolute -top-2 left-3 z-30 origin-top-left bg-turtle-background px-1 text-xs text-turtle-level5">
            {isOpen ? 'Chain' : floatingLabel}
          </label>

          <ChainTrigger
            value={chainProps.value}
            disabled={disabled}
            onClick={handleDropdownTriggerClick}
            error={walletProps?.error}
            className={cn(
              'rounded-md rounded-bl-none rounded-br-none',
              amountProps?.error && 'border-b-0',
            )}
            triggerRef={triggerRef}
            walletAddress={walletProps?.address}
            manualRecipientInput={walletProps?.manualRecipientInput}
            trailingAction={walletProps?.walletButton}
          />
        </div>

        {/* 2. Floating Label */}
        {isOpen && (
          <div className="relative flex-1">
            <label className="absolute -top-2 left-3 z-30 origin-top-left bg-turtle-background px-1 text-xs text-turtle-level5">
              Token
            </label>
          </div>
        )}
      </div>

      <TokenAmountInput
        tokenProps={tokenProps}
        amountProps={amountProps}
        disabled={disabled}
        onTriggerClick={handleDropdownTriggerClick}
        triggerRef={triggerRef}
        inDollars={inDollars}
        chainProps={chainProps.value}
        tooltipContent={amountProps?.tooltipContent}
      />

      {/* Dropdown */}
      <Dropdown isOpen={isOpen} dropdownRef={dropdownRef}>
        <div className="flex">
          {/* Chain options (left side) */}
          <div className="flex flex-1 flex-col border-r border-turtle-level3">
            <ChainList
              searchString={chainSearch}
              setSearchString={setChainSearch}
              options={sortedAndFilteredChainOptions}
              selectedChain={chainProps.value}
              clearable={chainProps.clearable}
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
              selectedToken={tokenProps.value}
              clearable={tokenProps.clearable}
              sourceChainToDetermineOriginBanner={tokenProps.sourceChainToDetermineOriginBanner}
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
  tokenProps: {
    value: Token | null
    sourceChainToDetermineOriginBanner: Chain | null
  }
  amountProps?: {
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
  chainProps?: Chain | null
  tooltipContent?: string
}

const TokenAmountInput = ({
  tokenProps,
  amountProps,
  disabled,
  onTriggerClick,
  triggerRef,
  inDollars,
  chainProps,
  tooltipContent,
}: TokenAmountInputProps) => {
  const showVerticalDivider = !!amountProps?.value || !!amountProps?.placeholder
  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value === '' ? null : parseFloat(e.target.value)
    amountProps?.onChange?.(newVal)
  }

  return (
    <Tooltip content={amountProps?.error}>
      <div
        ref={triggerRef}
        className={cn(
          'flex items-center justify-between rounded-md rounded-t-none border border-t-0 border-turtle-level3 bg-turtle-background px-3 text-sm',
          disabled && 'opacity-30',
          amountProps?.error && 'border border-turtle-error',
        )}
      >
        <div className="flex h-[3.5rem] flex-grow items-center gap-1">
          <div
            className={cn('flex items-center gap-1', !disabled && 'cursor-pointer')}
            data-cy="token-select-trigger"
            onClick={disabled ? undefined : onTriggerClick}
          >
            {tokenProps.value ? (
              <>
                <TokenLogo
                  token={tokenProps.value}
                  sourceChain={tokenProps.sourceChainToDetermineOriginBanner}
                />
                <span className="ml-1 text-nowrap" data-cy="token-select-symbol">
                  {tokenProps.value.symbol}
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
              disabled={disabled || amountProps?.disabled}
              type="number"
              className={cn(
                'bg-transparent text-sm focus:border-0 focus:outline-none min-[350px]:text-base sm:text-xl',
                inDollars && 'animate-slide-up-slight',
                amountProps?.error && 'text-turtle-error',
              )}
              placeholder={amountProps?.placeholder ?? 'Amount'}
              value={amountProps?.value ?? ''}
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

        {amountProps?.trailingAction &&
          (chainProps?.network === 'Polkadot' || chainProps?.network === 'Kusama' ? (
            <Tooltip showIcon={false} content={tooltipContent ?? ''}>
              <div className="absolute right-0 ml-2 mr-3 bg-white">
                {amountProps.trailingAction}
              </div>
            </Tooltip>
          ) : (
            <div className="absolute right-0 ml-2 mr-3 bg-white">{amountProps.trailingAction}</div>
          ))}
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
                <Image
                  src={(option.logoURI as Record<string, string>).src}
                  alt={option.name}
                  width={24}
                  height={24}
                  priority
                  className="h-[2rem] w-[2rem] rounded-full border border-turtle-foreground bg-turtle-background"
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
