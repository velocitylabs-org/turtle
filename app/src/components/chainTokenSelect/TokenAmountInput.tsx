import { Token } from '@/models/token'
import { Chain } from '@/models/chain'
import { ChangeEvent, ReactNode, RefObject } from 'react'
import { cn } from '@/utils/cn'
import Tooltip from '@/components/Tooltip'
import TokenLogo from '@/components/TokenLogo'
import TokenIcon from '@/components/svg/TokenIcon'
import ChevronDown from '@/components/svg/ChevronDown'
import VerticalDivider from '@/components/VerticalDivider'
import NumberFlow from '@number-flow/react'

const maxDollars = 100000000000 // 100B

const numberFlowFormat = {
  notation: 'compact' as const,
  maximumFractionDigits: 3,
}

interface TokenAmountInputProps {
  token: {
    value: Token | null
    sourceChainToDetermineOriginBanner: Chain | null
  }
  amount?: {
    value: number | null
    onChange: (amount: number | null) => void
    error?: string
    trailingAction?: ReactNode
    placeholder?: string
    disabled?: boolean
  }
  onTriggerClick: () => void
  triggerRef: RefObject<HTMLDivElement | null>
  disabled?: boolean
  inDollars?: number
  context: 'source' | 'destination'
}

const TokenAmountInput = ({
  token,
  amount,
  disabled,
  onTriggerClick,
  triggerRef,
  inDollars,
  context,
}: TokenAmountInputProps) => {
  const showVerticalDivider = !!amount?.value || !!amount?.placeholder
  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value === '' ? null : parseFloat(e.target.value)
    amount?.onChange?.(newVal)
  }

  return (
    <Tooltip content={amount?.error}>
      <div
        ref={triggerRef}
        className={cn(
          'flex items-center justify-between rounded-md rounded-t-none border-1 border-t-0 border-turtle-level3 bg-background px-3 text-sm',
          !disabled && 'cursor-pointer',
          disabled && 'opacity-30',
          amount?.error && 'border-1 border-turtle-error',
        )}
        data-cy={`amount-input-${context}`}
      >
        <div className="flex h-[3.5rem] flex-grow items-center gap-1">
          <div
            className="flex items-center gap-1"
            data-cy="token-select-trigger"
            onClick={disabled ? undefined : onTriggerClick}
          >
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
            <ChevronDown strokeWidth={0.2} className="ml-1" />
            {showVerticalDivider && <VerticalDivider />}
          </div>

          <div className="align-center ml-1 flex flex-col">
            <input
              data-cy="amount-input"
              disabled={disabled || amount?.disabled}
              type="number"
              className={cn(
                'bg-transparent text-sm focus:border-0 focus:outline-none min-[350px]:text-base sm:text-xl',
                inDollars && 'animate-slide-up-slight',
                amount?.error && 'text-turtle-error',
              )}
              placeholder={amount?.placeholder ?? 'Amount'}
              value={amount?.value ?? ''}
              onChange={handleAmountChange}
              onClick={e => e.stopPropagation()}
              onWheel={e => e.target instanceof HTMLElement && e.target.blur()}
              autoFocus
            />
            {inDollars && (
              <div className={'animate-slide-up mt-[-3px] text-sm text-turtle-level4'}>
                <NumberFlow
                  value={Math.min(inDollars, maxDollars)}
                  prefix="$"
                  format={numberFlowFormat}
                />
              </div>
            )}
          </div>
        </div>

        {amount?.trailingAction && (
          <div className="absolute right-0 ml-2 mr-3 bg-white">{amount.trailingAction}</div>
        )}
      </div>
    </Tooltip>
  )
}
export default TokenAmountInput
