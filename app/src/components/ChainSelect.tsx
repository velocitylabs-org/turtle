'use client'
import useLookupName from '@/hooks/useLookupName'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { Chain } from '@/models/chain'
import { ManualRecipient, SelectProps } from '@/models/select'
import { truncateAddress } from '@/utils/address'
import { cn } from '@/utils/cn'
import Image from 'next/image'
import { forwardRef, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { normalize } from 'viem/ens'
import { useEnsAvatar } from 'wagmi'
import Button from './Button'
import Dropdown from './Dropdown'
import ChainIcon from './svg/ChainIcon'
import ChevronDown from './svg/ChevronDown'
import { Cross } from './svg/Cross'
import { Tooltip } from './Tooltip'
import VerticalDivider from './VerticalDivider'

interface ChainSelectProps extends SelectProps<Chain> {
  walletAddress?: string
  manualRecipient?: ManualRecipient
  onChangeManualRecipient?: (newVal: ManualRecipient) => void
}

const ChainSelect = forwardRef<HTMLDivElement, ChainSelectProps>(
  (
    {
      value,
      onChange,
      options,
      floatingLabel,
      placeholder,
      placeholderIcon = <ChainIcon />,
      walletAddress,
      manualRecipient,
      onChangeManualRecipient,
      trailing,
      error,
      disabled,
      clearable,
      className,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const triggerRef = useRef<HTMLDivElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    useOutsideClick(triggerRef, dropdownRef, () => setIsOpen(false))
    const addressLookup = useLookupName(value?.network, walletAddress?.toLowerCase())

    const addressPlaceholder = walletAddress ? truncateAddress(walletAddress, 4, 4) : ''
    const accountName = addressLookup ? addressLookup : addressPlaceholder
    const { data: ensAvatarUrl } = useEnsAvatar({
      name: normalize(addressLookup || '') || undefined,
    })

    const handleSelectionChange = (selectedChain: Chain) => {
      onChange(selectedChain)
      setIsOpen(false)
    }

    const handleTriggerClick = () => {
      if (!disabled) setIsOpen(!isOpen)
    }

    const handleManualRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChangeManualRecipient && manualRecipient)
        onChangeManualRecipient({ ...manualRecipient, address: e.target.value })
    }

    const shouldShowChainName =
      (!walletAddress && (!manualRecipient?.enabled || !manualRecipient?.address)) ||
      (manualRecipient?.enabled && !manualRecipient.address)

    return (
      <div ref={ref} className={twMerge('relative w-full', className)} data-cy="chain-select">
        {floatingLabel && (
          <label className="absolute -top-2 left-3 z-30 origin-top-left bg-background px-1 text-xs text-turtle-level5">
            {floatingLabel}
          </label>
        )}
        <Tooltip content={error}>
          <div
            ref={triggerRef}
            className={twMerge(
              'flex items-center justify-between rounded-md border-1 border-turtle-level3 bg-background px-3 text-sm',
              !disabled && 'cursor-pointer',
              disabled && 'opacity-30',
              error && 'border-turtle-error',
            )}
            data-cy="chain-select-trigger"
            onClick={handleTriggerClick}
          >
            <div className="flex h-[3.5rem] flex-grow items-center gap-1">
              {value ? (
                <>
                  <Image
                    src={value.logoURI}
                    alt={value.name}
                    width={24}
                    height={24}
                    className="h-[2rem] w-[2rem] rounded-full border-1 border-turtle-foreground bg-background"
                  />
                  {shouldShowChainName && (
                    <span className="text-nowrap" data-cy="chain-select-value">
                      {value.name}
                    </span>
                  )}
                </>
              ) : (
                <>
                  {placeholderIcon}
                  {placeholder}
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
              {!manualRecipient?.enabled && !!value && accountName}

              {/* Manual Recipient Address */}
              {manualRecipient && manualRecipient.enabled && (
                <>
                  <VerticalDivider className={manualRecipient.address ? 'invisible' : 'visible'} />
                  <input
                    type="text"
                    className={cn(
                      'ml-1 h-[70%] w-full bg-transparent focus:border-0 focus:outline-none',
                      error && 'text-turtle-error',
                    )}
                    placeholder="Address"
                    autoFocus
                    value={manualRecipient.address}
                    onChange={handleManualRecipientChange}
                    onClick={e => e.stopPropagation()}
                    data-cy="manual-recipient-input"
                  />
                </>
              )}
            </div>
            {trailing && <div className="absolute right-0 ml-2 mr-3">{trailing}</div>}
          </div>
        </Tooltip>

        <Dropdown isOpen={isOpen} dropdownRef={dropdownRef}>
          {options.map(option => {
            if (!option.allowed) return null
            const isSelected = value?.uid === option.uid
            return (
              <li
                key={option.uid}
                className="flex cursor-pointer items-center justify-between px-3 py-3 hover:bg-turtle-level1"
                onClick={() => handleSelectionChange(option)}
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

                {isSelected && clearable && (
                  <Button
                    label="Clear"
                    size="sm"
                    variant="outline"
                    className="max-w-[77px]"
                    onClick={() => {
                      onChange(null)
                      setIsOpen(false)
                    }}
                  >
                    <div className="mr-1 flex items-center">
                      <Cross stroke="black" />
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
  },
)

ChainSelect.displayName = 'ChainSelect'

export default ChainSelect
