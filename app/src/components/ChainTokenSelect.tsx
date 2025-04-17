'use client'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import useTokenPrice from '@/hooks/useTokenPrice'
import { Chain } from '@/models/chain'
import { ManualAddressInput } from '@/models/select'
import { Token } from '@/models/token'
import { cn } from '@/utils/cn'
import { reorderOptionsBySelectedItem } from '@/utils/sort'
import { ReactNode, RefObject, useMemo, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import ChainTrigger from './ChainTrigger'
import Dropdown from './Dropdown'
import TokenAmountInput from '@/components/chainTokenSelect/TokenAmountInput'
import TokenList from '@/components/chainTokenSelect/TokenList'
import ChainList from '@/components/chainTokenSelect/ChainList'

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
  const filteredChainOptions = chain.options.filter(option =>
    option.name.toLowerCase().includes(chainSearch.toLowerCase()),
  )

  const sortedAndFilteredChainOptions = chain.orderBySelected
    ? reorderOptionsBySelectedItem(filteredChainOptions, 'uid', chain.value?.uid)
    : filteredChainOptions

  const filteredTokenOptions = token.options.filter(option =>
    option.symbol.toLowerCase().includes(tokenSearch.toLowerCase()),
  )

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

  const context = floatingLabel === 'To' ? 'destination' : 'source'
  const dataCyContainer = `chain-container-${context}`

  const handleDropdownTriggerClick = () => {
    if (!disabled) setIsOpen(!isOpen)
  }

  return (
    <div className={twMerge('relative w-full', className)}>
      <div className="flex">
        <div className="relative flex-1" data-cy={dataCyContainer}>
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
        context={context}
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
          <div className="flex flex-1 flex-col" data-cy={`token-list-${context}`}>
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
