import { Chain } from '@/models/chain'
import { ManualRecipient } from '@/models/select'
import { Token } from '@/models/token'
import { cn } from '@/utils/cn'
import Image from 'next/image'
import { ReactNode } from 'react'
import ChainIcon from './svg/ChainIcon'
import ChevronDown from './svg/ChevronDown'
import TokenIcon from './svg/TokenIcon'
import { TokenLogo } from './TokenLogo'
import { Tooltip } from './Tooltip'

interface SelectTriggerProps {
  value:
    | { type: 'chain'; chain: Chain | null }
    | { type: 'token'; token: Token | null; sourceChain: Chain | null }
  onClick: () => void
  trailingAction?: ReactNode
  error?: string
  disabled?: boolean
  className?: string
  /** The ref can be used to close the dropdown when the user clicks outside of it */
  triggerRef?: React.RefObject<HTMLDivElement | null>
  ensAvatarUrl?: string
  manualAddressInput?: ManualRecipient
  accountName?: string
}

// TODO: rename to ChainTrigger depending on which design version we stick to
// TODO: cleanup after final design is agreed
const SelectTrigger = ({
  value,
  error,
  disabled,
  onClick,
  className,
  triggerRef,
  ensAvatarUrl,
  manualAddressInput,
  accountName,
}: SelectTriggerProps) => {
  return (
    <Tooltip content={error}>
      <div
        ref={triggerRef}
        onClick={disabled ? undefined : onClick}
        className={cn(
          'flex items-center justify-between border-1 border-turtle-level3 bg-background px-3 text-sm',
          !disabled && 'cursor-pointer',
          disabled && 'opacity-30',
          className,
        )}
        data-cy={`${value.type}-select-trigger`}
      >
        <div className="flex h-[3.5rem] flex-grow items-center gap-2">
          {value.type === 'chain' ? (
            // Chain display
            value.chain ? (
              <>
                <Image
                  src={value.chain.logoURI}
                  alt={value.chain.name}
                  width={24}
                  height={24}
                  className="h-[2rem] w-[2rem] rounded-full border-1 border-turtle-foreground bg-background"
                />
                <span className="text-nowrap" data-cy="chain-select-value">
                  {value.chain.name}
                </span>
              </>
            ) : (
              <>
                <ChainIcon className="h-[2rem] w-[2rem]" />
                <span>Chain</span>
              </>
            )
          ) : // Token display
          value.token ? (
            <>
              <TokenLogo token={value.token} sourceChain={value.sourceChain} />
              <span className="text-nowrap" data-cy="token-select-value">
                {value.token.symbol}
              </span>
            </>
          ) : (
            <>
              <TokenIcon className="h-[2rem] w-[2rem]" />
              <span>Token</span>
            </>
          )}
          <ChevronDown strokeWidth={0.2} height={6} width={14} className="ml-1" />
          {ensAvatarUrl && (
            <Image
              src={ensAvatarUrl}
              alt="ENS Avatar"
              width={24}
              height={24}
              className="h-[1.5rem] w-[1.5rem] rounded-full border-1 border-turtle-foreground bg-background"
            />
          )}
          {!manualAddressInput?.enabled && !!value && accountName}
        </div>
      </div>
    </Tooltip>
  )
}

export default SelectTrigger
