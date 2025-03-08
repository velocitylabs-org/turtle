'use client'
import useLookupName from '@/hooks/useLookupName'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import useTokenPrice from '@/hooks/useTokenPrice'
import { Chain } from '@/models/chain'
import { ManualAddressInput } from '@/models/select'
import { Token } from '@/models/token'
import { WithAllowedTag } from '@/registry/helpers'
import { truncateAddress } from '@/utils/address'
import { cn } from '@/utils/cn'
import { reorderOptionsBySelectedItem } from '@/utils/sort'
import NumberFlow from '@number-flow/react'
import Image from 'next/image'
import { ReactNode, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { normalize } from 'viem/ens'
import { useEnsAvatar } from 'wagmi'
import { colors } from '../../tailwind.config'
import Button from './Button'
import ChainTrigger from './ChainTrigger'
import Dropdown from './Dropdown'
import ChevronDown from './svg/ChevronDown'
import { Cross } from './svg/Cross'
import { SearchIcon } from './svg/SearchIcon'
import TokenIcon from './svg/TokenIcon'
import { TokenLogo } from './TokenLogo'
import { Tooltip } from './Tooltip'
import VerticalDivider from './VerticalDivider'

const maxDollars = 100000000000 // 100B

interface ChainTokenSelectProps {
  chain: {
    value: Chain | null
    onChange: (chain: Chain | null) => void
    options: WithAllowedTag<Chain>[]
    error?: string
    clearable?: boolean
    orderBySelected?: boolean
  }
  token: {
    value: Token | null
    onChange: (token: Token | null) => void
    options: WithAllowedTag<Token>[]
    sourceChainToDetermineOriginBanner: Chain | null
    error?: string
    clearable?: boolean
    orderBySelected?: boolean
  }
  amount?: {
    value: number | null
    onChange: (amount: number | null) => void
    error?: string
    trailingAction?: ReactNode
  }
  wallet?: {
    address?: string
    walletButton?: ReactNode
    manualAddressInput?: ManualAddressInput
  }
  /** The label to display above the whole component when dropdown is not open */
  floatingLabel?: string
  disabled?: boolean
  className?: string
}

const ChainTokenSelect = ({
  chain,
  token,
  amount,
  wallet,
  floatingLabel = 'From',
  disabled,
  className,
}: ChainTokenSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  useOutsideClick(triggerRef, dropdownRef, () => setIsOpen(false))

  // Chain and wallet hooks
  const addressLookup = useLookupName(chain.value?.network, wallet?.address?.toLowerCase())
  const walletAddressShortened = wallet?.address ? truncateAddress(wallet.address, 4, 4) : ''
  const accountName = addressLookup ? addressLookup : walletAddressShortened
  const { data: ensAvatarUrl } = useEnsAvatar({
    name: normalize(addressLookup || '') || undefined,
  })

  // Token hooks
  const { price } = useTokenPrice(token.value)
  const inDollars = !!amount?.value && price ? price * amount.value : undefined

  // Search state
  const [chainSearch, setChainSearch] = useState('')
  const [tokenSearch, setTokenSearch] = useState('')

  // Filter the options based on search
  const filteredChainOptions = chain.options.filter(
    option => option.allowed && option.name.toLowerCase().includes(chainSearch.toLowerCase()),
  )

  const sortedAndFilteredChainOptions = chain.orderBySelected
    ? reorderOptionsBySelectedItem(filteredChainOptions, 'uid', chain.value?.uid)
    : filteredChainOptions

  const filteredTokenOptions = token.options.filter(
    option => option.allowed && option.symbol.toLowerCase().includes(tokenSearch.toLowerCase()),
  )

  const sortedAndFilteredTokenOptions = token.orderBySelected
    ? reorderOptionsBySelectedItem(filteredTokenOptions, 'id', token.value?.id)
    : filteredTokenOptions

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

  return (
    <div className={twMerge('relative w-full', className)}>
      {/* Triggers */}
      <div className="flex">
        {/* Chain Selection */}
        <div className="relative flex-1">
          <label className="absolute -top-2 left-3 z-30 origin-top-left bg-background px-1 text-xs text-turtle-level5">
            {isOpen ? 'Chain' : floatingLabel}
          </label>

          <ChainTrigger
            value={chain.value}
            error={chain.error}
            disabled={disabled}
            onClick={() => setIsOpen(true)}
            className="rounded-md rounded-bl-none rounded-br-none"
            triggerRef={triggerRef}
            accountName={accountName}
            ensAvatar={ensAvatarUrl}
            manualAddressInput={wallet?.manualAddressInput}
            trailingAction={wallet?.walletButton}
          />
        </div>

        {/* Token Selection */}
        {/*  <div className="relative flex-1">
          <label className="absolute -top-2 left-3 z-30 origin-top-left bg-background px-1 text-xs text-turtle-level5">
            {isOpen ? 'Token' : ''}
          </label>

          <SelectTrigger
            value={{ type: 'token', token: token.value, sourceChain: chain.value }}
            error={token.error}
            disabled={disabled}
            onClick={() => setIsOpen(true)}
            className="rounded-l-none rounded-r-md rounded-br-none border-l-0"
            triggerRef={triggerRef}
          />
        </div> */}
      </div>

      {/* Amount Input */}
      {/* TODO: contains 2 Token fields for now as we don't know which one we need to show yet */}
      <Tooltip content={amount?.error}>
        {/* Token Trigger */}
        <div
          ref={triggerRef}
          onClick={() => setIsOpen(true)}
          className={cn(
            'flex items-center justify-between rounded-md rounded-t-none border-1 border-t-0 border-turtle-level3 bg-background px-3 text-sm',
            !disabled && 'cursor-pointer',
            disabled && 'opacity-30',
            amount?.error && 'border-turtle-error',
          )}
        >
          {/* Trigger Content */}
          <div className="flex h-[3.5rem] flex-grow items-center gap-1">
            <div className="flex items-center gap-1" data-cy="token-select-trigger">
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
            </div>
            <ChevronDown strokeWidth={0.2} className="ml-1" />
            <VerticalDivider />
            <div className="align-center ml-1 flex flex-col">
              <input
                data-cy="amount-input"
                disabled={disabled}
                type="number"
                className={cn(
                  'bg-transparent text-sm focus:border-0 focus:outline-none min-[350px]:text-base sm:text-xl',
                  inDollars && 'animate-slide-up-slight',
                  amount?.error && 'text-turtle-error',
                )}
                placeholder={'Amount'}
                value={amount?.value ?? ''}
                onChange={e => amount?.onChange?.(Number(e.target.value) || null)}
                onClick={e => e.stopPropagation()}
                onWheel={e => e.target instanceof HTMLElement && e.target.blur()}
                autoFocus
              />
              {inDollars && (
                <div className={'animate-slide-up mt-[-3px] text-sm text-turtle-level4'}>
                  <NumberFlow
                    value={Math.min(inDollars, maxDollars)} // Ensure the value doesn't exceed the max
                    prefix="$"
                    format={{
                      notation: 'compact',
                      maximumFractionDigits: 3,
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Trailing component. E.g. Max Button */}
          {amount?.trailingAction && (
            <div className="absolute right-0 ml-2 mr-3 bg-white">{amount.trailingAction}</div>
          )}
        </div>
      </Tooltip>

      {/* Dropdown */}
      <Dropdown isOpen={isOpen} dropdownRef={dropdownRef}>
        <div className="flex">
          {/* Chain options (left side) */}
          <div className="flex flex-1 flex-col border-r-1 border-turtle-level3">
            <SearchBar placeholder="Search" value={chainSearch} onChange={setChainSearch} />

            <div className="max-h-[15rem] overflow-y-auto">
              <ul className="flex flex-col">
                {sortedAndFilteredChainOptions.map(option => {
                  if (!option.allowed) return null
                  const isSelected = chain.value?.uid === option.uid
                  return (
                    <li
                      key={option.uid}
                      className={cn(
                        'flex cursor-pointer items-center justify-between px-3 py-3 hover:bg-turtle-level1',
                        isSelected && 'bg-turtle-secondary-light hover:bg-turtle-secondary-light',
                      )}
                      onClick={() => handleChainSelect(option)}
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={option.logoURI}
                          alt={option.name}
                          width={24}
                          height={24}
                          priority
                          className="h-[2rem] w-[2rem] rounded-full border-1 border-turtle-foreground bg-background"
                        />
                        <span className="text-sm">{option.name}</span>
                      </div>

                      {isSelected && chain.clearable && <ClearButton onClick={handleChainClear} />}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* Token options (right side) */}
          <div className="flex flex-1 flex-col">
            <SearchBar placeholder="Search" value={tokenSearch} onChange={setTokenSearch} />

            <div className="max-h-[15rem] overflow-y-auto">
              <ul className="flex flex-col">
                {sortedAndFilteredTokenOptions.map(option => {
                  if (!option.allowed) return null
                  const isSelected = token.value?.id === option.id

                  return (
                    <li
                      key={option.id}
                      className={cn(
                        'flex cursor-pointer items-center justify-between px-3 py-3 hover:bg-turtle-level1',
                        isSelected && 'bg-turtle-secondary-light hover:bg-turtle-secondary-light',
                      )}
                      onClick={() => handleTokenSelect(option)}
                    >
                      <div className="flex items-center gap-2">
                        <TokenLogo token={option} sourceChain={chain.value} />
                        <span className="text-sm">{option.symbol}</span>
                      </div>

                      {isSelected && token.clearable && <ClearButton onClick={handleTokenClear} />}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </Dropdown>
    </div>
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
    <div className="sticky top-0 z-20 flex items-center gap-3 border-b-1 border-turtle-level3 bg-turtle-background px-3 pb-3 pt-2">
      <div className="flex h-[2rem] w-[2rem] items-center justify-center">
        <SearchIcon className="" fill={colors['turtle-level5']} width={17} height={17} />
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

export default ChainTokenSelect
