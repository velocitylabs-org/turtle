'use client'
import useLookupName from '@/hooks/useLookupName'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { WithAllowedTag } from '@/registry/helpers'
import { truncateAddress } from '@/utils/address'
import { cn } from '@/utils/cn'
import Image from 'next/image'
import { ReactNode, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { normalize } from 'viem/ens'
import { useEnsAvatar } from 'wagmi'
import { colors } from '../../tailwind.config'
import Button from './Button'
import Dropdown from './Dropdown'
import ChevronDown from './svg/ChevronDown'
import { Cross } from './svg/Cross'
import { Tooltip } from './Tooltip'
import VerticalDivider from './VerticalDivider'

interface ChainTokenSelectProps {
  chain: {
    value: Chain | null
    onChange: (chain: Chain | null) => void
    options: WithAllowedTag<Chain>[]
    error?: string
    clearable?: boolean
  }
  token: {
    value: Token | null
    onChange: (token: Token | null) => void
    options: WithAllowedTag<Token>[]
    error?: string
    clearable?: boolean
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
  disabled?: boolean
  className?: string
}

const ChainTokenSelect = ({
  chain,
  token,
  amount,
  wallet,
  disabled,
  className,
}: ChainTokenSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useOutsideClick(triggerRef, dropdownRef, () => setIsOpen(false))

  // Chain and wallet related hooks
  const addressLookup = useLookupName(chain.value?.network, wallet?.address?.toLowerCase())
  const addressPlaceholder = wallet?.address ? truncateAddress(wallet.address, 4, 4) : ''
  const accountName = addressLookup ? addressLookup : addressPlaceholder
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

  return (
    <div className={twMerge('relative w-full', className)} data-cy="chain-select">
      {
        <label className="absolute -top-2 left-3 z-30 origin-top-left bg-background px-1 text-xs text-turtle-level5">
          From
        </label>
      }
      <Tooltip content={chain.error}>
        <div
          // ref={triggerRef}
          onClick={handleChainClick}
          className={cn(
            'flex items-center justify-between rounded-md border-1 border-turtle-level3 bg-background px-3 text-sm',
            !disabled && 'cursor-pointer',
            disabled && 'opacity-30',
            chain.error && 'border-turtle-error',
          )}
          data-cy="chain-select-trigger"
        >
          <div className="flex h-[3.5rem] flex-grow items-center gap-1">
            {chain.value ? (
              <>
                <Image
                  src={chain.value.logoURI}
                  alt={chain.value.name}
                  width={24}
                  height={24}
                  className="h-[2rem] w-[2rem] rounded-full border-1 border-turtle-foreground bg-background"
                />
                {shouldShowChainName && (
                  <span className="text-nowrap" data-cy="chain-select-value">
                    {chain.value.name}
                  </span>
                )}
              </>
            ) : (
              <>
                {/* TODO: Add placeholder icon */}
                {'Chain'}
              </>
            )}
            <ChevronDown strokeWidth={0.2} height={6} width={14} className="ml-1 mr-1" />
            {ensAvatarUrl && (
              <Image
                src={ensAvatarUrl}
                alt="ENS Avatar"
                width={24}
                height={24}
                className="h-[1.5rem] w-[1.5rem] rounded-full border-1 border-turtle-foreground bg-background"
              />
            )}
            {!wallet?.manualInput?.enabled && !!chain.value && accountName}

            {/* Manual Recipient Address */}
            {wallet?.manualInput?.enabled && (
              <>
                <VerticalDivider className={wallet.manualInput.address ? 'invisible' : 'visible'} />
                <input
                  type="text"
                  className={cn(
                    'ml-1 h-[70%] w-full bg-transparent focus:border-0 focus:outline-none',
                    chain.error && 'text-turtle-error',
                  )}
                  placeholder="Address"
                  autoFocus
                  value={wallet.manualInput.address}
                  onChange={handleManualRecipientChange}
                  onClick={e => e.stopPropagation()}
                  data-cy="manual-recipient-input"
                />
              </>
            )}
          </div>
          {wallet?.walletButton && (
            <div className="absolute right-0 ml-2 mr-3">{wallet.walletButton}</div>
          )}
        </div>
      </Tooltip>

      <Dropdown isOpen={isOpen} dropdownRef={dropdownRef}>
        {chain.options.map(option => {
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
