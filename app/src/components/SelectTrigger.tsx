import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { cn } from '@/utils/cn'
import Image from 'next/image'
import ChainIcon from './svg/ChainIcon'
import ChevronDown from './svg/ChevronDown'
import TokenIcon from './svg/TokenIcon'
import { Tooltip } from './Tooltip'

interface SelectTriggerProps {
  value: Chain | Token | null
  error?: string
  disabled?: boolean
  onClick: () => void
  type: 'chain' | 'token'
  className?: string
  /** The ref can be used to close the dropdown when the user clicks outside of it */
  triggerRef?: React.RefObject<HTMLDivElement | null>
}

const SelectTrigger = ({
  value,
  error,
  disabled,
  onClick,
  type,
  className,
  triggerRef,
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
          error && 'border-turtle-error',
          className,
        )}
        data-cy={`${type}-select-trigger`}
      >
        <div className="flex h-[3.0rem] flex-grow items-center gap-1">
          {value ? (
            <>
              <Image
                src={value.logoURI}
                alt={value.name}
                width={24}
                height={24}
                className="h-[2rem] w-[2rem] rounded-full border-1 border-turtle-foreground bg-background"
              />
              <span className="text-nowrap" data-cy={`${type}-select-value`}>
                {value.name}
              </span>
            </>
          ) : (
            <>
              {type === 'chain' ? <ChainIcon /> : <TokenIcon />}
              {type === 'chain' ? 'Chain' : 'Token'}
            </>
          )}
          <ChevronDown strokeWidth={0.2} height={6} width={14} className="ml-1" />
        </div>
      </div>
    </Tooltip>
  )
}

export default SelectTrigger
