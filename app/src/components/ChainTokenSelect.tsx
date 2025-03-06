'use client'
import useLookupName from '@/hooks/useLookupName'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { WithAllowedTag } from '@/registry/helpers'
import { truncateAddress } from '@/utils/address'
import { cn } from '@/utils/cn'
import { reorderOptionsBySelectedItem } from '@/utils/sort'
import Image from 'next/image'
import { ReactNode, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { normalize } from 'viem/ens'
import { useEnsAvatar } from 'wagmi'
import { colors } from '../../tailwind.config'
import Button from './Button'
import Dropdown from './Dropdown'
import SelectTrigger from './SelectTrigger'
import ChainIcon from './svg/ChainIcon'
import { Cross } from './svg/Cross'

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
    manualInput?: {
      enabled: boolean
      address: string
      onChange: (address: string) => void
    }
  }
  /** The label to display above the whole component when dropdown is not open */
  floatingLabel?: string
  disabled?: boolean
  className?: string
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
    <div className="sticky top-0 z-10 flex items-center border-b-1 border-turtle-level3 bg-turtle-background px-3 pb-3 pt-1">
      <div>
        <ChainIcon className="h-[2rem] w-[2rem] text-turtle-level5" />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border-0 bg-transparent text-sm focus:border-0 focus:outline-none"
      />
    </div>
  )
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

  // Chain and wallet related hooks
  const addressLookup = useLookupName(chain.value?.network, wallet?.address?.toLowerCase())
  const walletAddressShortened = wallet?.address ? truncateAddress(wallet.address, 4, 4) : ''
  const accountName = addressLookup ? addressLookup : walletAddressShortened
  const { data: ensAvatarUrl } = useEnsAvatar({
    name: normalize(addressLookup || '') || undefined,
  })

  // Add state for search values
  const [chainSearch, setChainSearch] = useState('')
  const [tokenSearch, setTokenSearch] = useState('')

  // Filter options based on search
  const filteredChainOptions = chain.options.filter(
    option => option.allowed && option.name.toLowerCase().includes(chainSearch.toLowerCase()),
  )

  const filteredTokenOptions = token.options.filter(
    option => option.allowed && option.name.toLowerCase().includes(tokenSearch.toLowerCase()),
  )

  const handleChainSelect = (selectedChain: Chain) => {
    chain.onChange(selectedChain)
    token.onChange(null)
  }

  const handleTokenSelect = (selectedToken: Token) => {
    token.onChange(selectedToken)
    setIsOpen(false)
  }

  const handleChainClick = () => {
    if (!disabled) {
      setIsOpen(true)
    }
  }

  const handleManualRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (wallet?.manualInput?.onChange) {
      wallet.manualInput.onChange(e.target.value)
    }
  }

  const shouldShowChainName =
    (!wallet?.address && (!wallet?.manualInput?.enabled || !wallet?.manualInput?.address)) ||
    (wallet?.manualInput?.enabled && !wallet.manualInput.address)

  // Order the options if needed
  const chainOptions = chain.orderBySelected
    ? reorderOptionsBySelectedItem(chain.options, 'uid', chain.value?.uid)
    : chain.options

  return (
    <div className={twMerge('relative w-full', className)}>
      {/* Triggers */}
      <div className="flex">
        {/* Chain Selection */}
        <div className="relative flex-1">
          <label className="absolute -top-2 left-3 z-30 origin-top-left bg-background px-1 text-xs text-turtle-level5">
            {isOpen ? 'Chain' : floatingLabel}
          </label>

          <SelectTrigger
            value={chain.value}
            error={chain.error}
            disabled={disabled}
            onClick={() => setIsOpen(true)}
            type="chain"
            className="rounded-l-md rounded-r-none"
            triggerRef={triggerRef}
          />
        </div>

        {/* Token Selection */}
        <div className="relative flex-1">
          <label className="absolute -top-2 left-3 z-30 origin-top-left bg-background px-1 text-xs text-turtle-level5">
            {isOpen ? 'Token' : ''}
          </label>

          <SelectTrigger
            value={token.value}
            error={token.error}
            disabled={disabled}
            onClick={() => setIsOpen(true)}
            type="token"
            className="rounded-l-none rounded-r-md border-l-0"
            triggerRef={triggerRef}
          />
        </div>
      </div>

      {/* Dropdown */}
      <Dropdown isOpen={isOpen} dropdownRef={dropdownRef}>
        <div className="flex">
          {/* Chain options (left side) */}
          <div className="flex flex-1 flex-col border-r-1 border-turtle-level3">
            <SearchBar placeholder="Search" value={chainSearch} onChange={setChainSearch} />

            <div className="max-h-[300px] overflow-y-auto">
              {filteredChainOptions.map(option => {
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

                    {isSelected && chain.clearable && (
                      <ClearButton
                        onClick={() => {
                          chain.onChange(null)
                          setIsOpen(false)
                        }}
                      />
                    )}
                  </li>
                )
              })}
            </div>
          </div>

          {/* Token options (right side) */}
          <div className="flex flex-1 flex-col">
            <SearchBar placeholder="Search" value={tokenSearch} onChange={setTokenSearch} />

            <div className="max-h-[300px] overflow-y-auto">
              {filteredTokenOptions.map(option => {
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

                    {isSelected && token.clearable && (
                      <ClearButton
                        onClick={() => {
                          token.onChange(null)
                          setIsOpen(false)
                        }}
                      />
                    )}
                  </li>
                )
              })}
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

export default ChainTokenSelect
