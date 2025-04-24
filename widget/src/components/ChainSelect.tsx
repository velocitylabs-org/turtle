import useLookupName from '@/hooks/useLookupName'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { Chain } from '@/models/chain'
import { ManualRecipient, SelectProps } from '@/models/select'
import { truncateAddress } from '@/utils/address'
import { Ref, useRef, useState } from 'react'
import { useEnsAvatar } from 'wagmi'
import { normalize } from 'viem/ens'
import { cn } from '@/utils/helper'
import ChainIcon from '@/assets/svg/ChainIcon'
import { Tooltip } from './Tooltip'
import ChevronDown from './ChevronDown'
import VerticalDivider from './VerticalDivider'
import Dropdown from './Dropdown'
import Button from './Button'
import { Cross } from '@/assets/svg/Cross'
import { colors } from '../../tailwind.config'

interface ChainSelectProps extends SelectProps<Chain> {
  walletAddress?: string
  manualRecipient?: ManualRecipient
  onChangeManualRecipient?: (newVal: ManualRecipient) => void
  ref?: Ref<HTMLDivElement>
}

const ChainSelect = ({
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
  ref,
}: ChainSelectProps) => {
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
    <div ref={ref} className={cn('relative w-full', className)} data-cy="chain-select">
      {floatingLabel && (
        <label className="absolute -top-2 left-3 z-30 origin-top-left bg-turtle-background px-1 text-xs text-turtle-level5">
          {floatingLabel}
        </label>
      )}

      <Tooltip content={error}>
        <div
          ref={triggerRef}
          className={cn(
            'flex items-center justify-between rounded-md border-1 border-turtle-level3 bg-turtle-background px-3 text-sm',
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
                <img
                  src={value.logoURI}
                  alt={value.name}
                  width={24}
                  height={24}
                  className="h-[2rem] w-[2rem] rounded-full border-1 border-turtle-foreground bg-turtle-background"
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
              <img
                src={ensAvatarUrl}
                alt="ENS Avatar"
                width={24}
                height={24}
                className="h-[1.5rem] w-[1.5rem] rounded-full border-1 border-turtle-foreground bg-turtle-background"
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
              className={cn(
                'flex cursor-pointer items-center justify-between px-3 py-3 hover:bg-turtle-level1',
                isSelected && 'bg-turtle-secondary-light hover:bg-turtle-secondary-light',
              )}
              onClick={() => handleSelectionChange(option)}
            >
              <div className="flex items-center gap-2">
                <img
                  src={option.logoURI}
                  alt={option.name}
                  width={24}
                  height={24}
                  className="h-[2rem] w-[2rem] rounded-full border-1 border-turtle-foreground bg-turtle-background"
                />
                <span className="text-sm">{option.name}</span>
              </div>

              {isSelected && clearable && (
                <Button
                  label="Clear"
                  size="sm"
                  variant="outline"
                  className="max-w-[77px] text-sm"
                  onClick={() => {
                    onChange(null)
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

export default ChainSelect
