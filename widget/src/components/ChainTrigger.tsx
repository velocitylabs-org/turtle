import useLookupName from '@/hooks/useLookupName'
import { Chain } from '@/models/chain'
import { ManualAddressInput } from '@/models/select'
import { truncateAddress } from '@/utils/address'
import { cn } from '@/utils/helper'
import { ReactNode } from 'react'
import { normalize } from 'viem/ens'
import { useEnsAvatar } from 'wagmi'
import CopyAddress from './ClipboardCopy'
import { GetEnsAvatarReturnType } from 'viem'
import ChainIcon from '@/assets/svg/ChainIcon'
import ChevronDown from '@/assets/svg/ChevronDown'
import { Tooltip } from './Tooltip'
import VerticalDivider from './VerticalDivider'

interface ChainTriggerProps {
  value: Chain | null
  onClick: () => void
  error?: string
  disabled?: boolean
  className?: string
  /** The action to display on the right side of the trigger. Like a wallet connect button. */
  trailingAction?: ReactNode
  /** The ref can be used to close the dropdown when the user clicks outside of it */
  triggerRef?: React.RefObject<HTMLDivElement | null>
  /** The avatar of the connected account. */
  ensAvatar?: GetEnsAvatarReturnType
  /** The input for manually entering an address. Used for specifying a recipient address. */
  manualAddressInput?: ManualAddressInput
  /** The connected account. */
  walletAddress?: string
}

export default function ChainTrigger({
  value,
  error,
  disabled,
  onClick,
  trailingAction,
  className,
  triggerRef,
  manualAddressInput,
  walletAddress,
}: ChainTriggerProps) {
  // wallet and ens
  const addressLookup = useLookupName(value?.network, walletAddress?.toLowerCase())
  const walletAddressShortened = walletAddress ? truncateAddress(walletAddress, 4, 4) : ''
  const accountName = addressLookup ? addressLookup : walletAddressShortened
  const { data: ensAvatar } = useEnsAvatar({
    name: normalize(addressLookup || '') || undefined,
  })

  const shouldShowChainName =
    (!walletAddress && (!manualAddressInput?.enabled || !manualAddressInput?.address)) ||
    (manualAddressInput?.enabled && !manualAddressInput.address)

  const shouldShowConnectedAccount = !manualAddressInput?.enabled && value

  const handleManualAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    manualAddressInput?.onChange?.({
      enabled: manualAddressInput.enabled,
      address: e.target.value,
    })

  const handleClick = () => {
    if (!disabled && onClick) onClick()
  }

  return (
    <Tooltip content={error}>
      <div
        ref={triggerRef}
        onClick={disabled ? undefined : onClick}
        className={cn(
          'flex items-center justify-between border-1 border-turtle-level3 bg-background px-3 text-sm',
          !disabled && 'cursor-pointer',
          disabled && 'opacity-30',
          error && 'border-turtle-error',
          className,
        )}
        data-cy="chain-select-trigger"
      >
        <div className="flex h-[3.5rem] flex-grow items-center gap-1">
          <div className="flex items-center gap-1" onClick={handleClick}>
            {value ? (
              <>
                <img
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
                <ChainIcon />
                <span>Chain</span>
              </>
            )}
            <ChevronDown strokeWidth={0.2} height={6} width={14} className="ml-1" />
          </div>
          {ensAvatar && (
            <img
              src={ensAvatar}
              alt="ENS Avatar"
              width={24}
              height={24}
              className="h-[1.5rem] w-[1.5rem] rounded-full border-1 border-turtle-foreground bg-background"
            />
          )}

          {shouldShowConnectedAccount && (
            <CopyAddress content={accountName} address={walletAddress ?? ''} showIcon={false} />
          )}

          {/* Manual Address Input */}
          {manualAddressInput?.enabled && (
            <>
              <VerticalDivider className={manualAddressInput.address ? 'invisible' : 'visible'} />
              <input
                type="text"
                className={cn(
                  'ml-1 h-[70%] w-full bg-transparent focus:border-0 focus:outline-none',
                  error && 'text-turtle-error',
                )}
                placeholder="Address"
                autoFocus
                value={manualAddressInput.address}
                onChange={handleManualAddressInputChange}
                onClick={e => e.stopPropagation()}
                data-cy="manual-address-input"
              />
            </>
          )}
        </div>
        {trailingAction && <div className="absolute right-0 ml-2 mr-3">{trailingAction}</div>}
      </div>
    </Tooltip>
  )
}
