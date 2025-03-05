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

  const handleChainSelect = (selectedChain: Chain) => {
    chain.onChange(selectedChain)
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
            Chain
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
        {chainOptions.map(option => {
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

              {isSelected && chain.clearable && (
                <Button
                  label="Clear"
                  size="sm"
                  variant="outline"
                  className="max-w-[77px] text-sm"
                  onClick={() => {
                    chain.onChange(null)
                    setIsOpen(false)
                  }}
                >
                  <div className="mr-1 flex items-center gap-1 text-turtle-foreground">
                    <Cross stroke={colors['turtle-foreground']} />
                    <span>Clear</span>
                  </div>
                </Button>
              )}
            </li>
          )
        })}
      </Dropdown>
    </div>
  )
}

export default ChainTokenSelect
