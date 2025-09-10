import type { Chain, ManualRecipientInput } from '@velocitylabs-org/turtle-registry'
import { cn, Tooltip } from '@velocitylabs-org/turtle-ui'
import { type ChangeEvent, type ReactNode, type RefObject, useCallback } from 'react'
import type { GetEnsAvatarReturnType } from 'viem'
import { normalize } from 'viem/ens'
import { useEnsAvatar } from 'wagmi'
import ChainIcon from '@/assets/svg/ChainIcon'
import ChevronDown from '@/assets/svg/ChevronDown'
import useLookupName from '@/hooks/useLookupName'
import { getChainSpecificAddress, truncateAddress } from '@/utils/address'
import CopyAddress from './ClipboardCopy'
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
  triggerRef?: RefObject<HTMLDivElement | null>
  /** The avatar of the connected account. */
  ensAvatar?: GetEnsAvatarReturnType
  /** The input for manually entering an address. Used for specifying a recipient address. */
  manualRecipientInput?: ManualRecipientInput
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
  manualRecipientInput,
  walletAddress,
}: ChainTriggerProps) {
  // wallet and ens
  const addressLookup = useLookupName(value?.network, walletAddress?.toLowerCase())
  const convertedAddress = walletAddress && value ? getChainSpecificAddress(walletAddress, value) : ''
  const displayableAddress = truncateAddress(convertedAddress)
  const accountName = addressLookup ?? displayableAddress

  const { data: ensAvatar } = useEnsAvatar({
    name: normalize(addressLookup || '') || undefined,
  })

  const shouldShowChainName =
    (!walletAddress && (!manualRecipientInput?.enabled || !manualRecipientInput?.address)) ||
    (manualRecipientInput?.enabled && !manualRecipientInput.address)

  const shouldShowConnectedAccount = !manualRecipientInput?.enabled && value

  const handleManualRecipientChange = (e: ChangeEvent<HTMLInputElement>) =>
    manualRecipientInput?.onChange?.({
      enabled: manualRecipientInput.enabled,
      address: e.target.value,
    })

  const handleClick = useCallback(() => {
    if (!disabled && onClick) onClick()
  }, [disabled, onClick])

  return (
    <Tooltip content={error}>
      <div
        ref={triggerRef}
        onClick={disabled ? undefined : onClick}
        className={cn(
          'flex items-center justify-between border border-turtle-level3 bg-turtle-background px-3 text-sm',
          disabled && 'opacity-30',
          error && 'border-turtle-error',
          className,
        )}
        data-cy="chain-select-trigger"
      >
        <div className="flex h-[3.5rem] flex-grow items-center gap-1">
          <div className={cn('flex shrink-0 items-center gap-1', !disabled && 'cursor-pointer')} onClick={handleClick}>
            {value ? (
              <>
                <img
                  src={value.logoURI as string}
                  alt={value.name}
                  width={24}
                  height={24}
                  className="h-[2rem] w-[2rem] rounded-full border border-turtle-foreground bg-turtle-background"
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
            {(!manualRecipientInput?.enabled || manualRecipientInput?.address) && (
              <ChevronDown strokeWidth={0.2} height={6} width={14} className="ml-1.5 mr-1 shrink-0" />
            )}
          </div>
          {ensAvatar && (
            <img
              src={ensAvatar}
              alt="ENS Avatar"
              width={24}
              height={24}
              className="h-[1.5rem] w-[1.5rem] rounded-full border border-turtle-foreground bg-turtle-background"
            />
          )}

          {shouldShowConnectedAccount && (
            <CopyAddress content={accountName} address={convertedAddress} showIcon={false} />
          )}

          {/* Manual Address Input */}
          {manualRecipientInput?.enabled && (
            <>
              {!manualRecipientInput.address && <VerticalDivider className="ml-1.5 mr-1" />}
              <input
                type="text"
                className={cn(
                  'ml-0 h-[70%] w-full bg-transparent focus:border-0 focus:outline-none',
                  error && 'text-turtle-error',
                )}
                placeholder="Address"
                value={manualRecipientInput.address}
                onChange={handleManualRecipientChange}
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
