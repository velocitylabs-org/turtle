import type { TokenAmount } from '@velocitylabs-org/turtle-registry'
import { colors } from '@velocitylabs-org/turtle-tailwind-config'
import { cn, spinnerSize } from '@velocitylabs-org/turtle-ui'
import { AnimatePresence, motion } from 'framer-motion'
import { AMOUNT_VS_FEE_RATIO } from '@/config'
import useTokenPrice from '@/hooks/useTokenPrice'
import type { FeeDetails } from '@/models/transfer'
import type { Direction } from '@/services/transfer'
import { formatAmount, toAmountInfo, toHuman } from '@/utils/transfer'
import Delayed from './Delayed'
import ExclamationMark from './svg/ExclamationMark'
import LoadingIcon from './svg/LoadingIcon'

interface TxSummaryProps {
  tokenAmount: TokenAmount
  loading?: boolean
  fees?: FeeDetails[] | null
  durationEstimate?: string
  direction?: Direction
  isBalanceSufficientForFees: boolean
  className?: string
  fixTransferableBalance: (fee: FeeDetails) => void
}

const animationConfig = {
  initial: { opacity: 0, height: 0 },
  animate: {
    opacity: 1,
    height: 'auto',
    transition: { type: 'spring', bounce: 0.6, duration: 0.5 },
  },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
}

export default function TxSummary({
  loading,
  tokenAmount,
  fees,
  durationEstimate,
  isBalanceSufficientForFees,
  className,
  fixTransferableBalance,
}: TxSummaryProps) {
  const { price } = useTokenPrice(tokenAmount.token)
  const transferAmount = toAmountInfo(tokenAmount, price)

  if (!loading && !fees) return null

  const renderContent = () => {
    if (loading) {
      return (
        <div className="mt-4 flex h-[10rem] w-full animate-pulse flex-col items-center justify-center rounded-[8px] bg-turtle-level1">
          <LoadingIcon
            className="animate-spin"
            width={spinnerSize.lg}
            height={spinnerSize.lg}
            color={colors['turtle-secondary']}
          />
          <div className="animate-slide-up-soft mt-2 text-sm font-bold text-turtle-secondary">Loading fees</div>
          <Delayed millis={7000}>
            <div className="animate-slide-up-soft mt-1 text-center text-xs text-turtle-secondary">
              Sorry that it&apos;s taking so long. Hang on or try again
            </div>
          </Delayed>
        </div>
      )
    }

    // Calculate total fees in dollars for isAmountTooLow check
    const totalFeesInDollars = fees?.reduce((sum, fee) => sum + fee.amount.inDollars, 0) ?? 0
    const isAmountTooLow = transferAmount && transferAmount.inDollars < totalFeesInDollars * AMOUNT_VS_FEE_RATIO

    // Track which tokens have already shown the transferable balance warning
    const shownTransferableWarnings = new Set<string>()

    return (
      <div className={cn('tx-summary p-0 pt-0', className)}>
        <div className="pt-3">
          <div className="mt-3 text-center text-lg font-bold text-turtle-foreground md:text-xl">Summary</div>
          <ul>
            {fees?.map((fee, index) => {
              const exceedsTransferableBalanceForThisFee =
                !isBalanceSufficientForFees &&
                transferAmount?.token?.id &&
                fee.amount.token?.id &&
                transferAmount.token.id === fee.amount.token.id

              // Check if we should show the warning for this token
              const shouldShowTransferableWarning =
                exceedsTransferableBalanceForThisFee &&
                fee.sufficient &&
                !shownTransferableWarnings.has(fee.amount.token.id)

              // Mark this token as having shown the warning
              if (shouldShowTransferableWarning && fee.amount.token?.id) {
                shownTransferableWarnings.add(fee.amount.token.id)
              }

              return (
                <li key={index} className="mt-4 flex items-start justify-between border-turtle-level2">
                  <div className="items-left flex flex-col">
                    <div className="pt-[3px] text-sm font-bold">{fee.title}</div>
                    {!fee.sufficient && (
                      <div className="ml-[-6px] mt-1 flex w-auto flex-row items-center rounded-[6px] border border-black bg-turtle-warning px-2 py-1 text-xs">
                        <ExclamationMark width={16} height={16} fill={colors['turtle-foreground']} className="mr-2" />
                        <span>You don&apos;t have enough {fee.amount.token.symbol}</span>
                      </div>
                    )}
                    {shouldShowTransferableWarning && (
                      <div className="ml-[-6px] mt-1 flex w-auto flex-row items-center rounded-[6px] border border-black bg-turtle-warning px-2 py-1 text-xs">
                        <ExclamationMark width={16} height={16} fill={colors['turtle-foreground']} className="mr-2" />
                        <span>
                          {fee.amount.token.symbol} needed for fees{' '}
                          <span
                            role="button"
                            onClick={() => fixTransferableBalance(fee)}
                            className="ml-1 cursor-pointer underline"
                          >
                            Ok
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="items-right flex">
                    <div>
                      <div className="flex items-center text-right text-lg text-turtle-foreground md:text-xl">
                        {formatAmount(toHuman(fee.amount.amount, fee.amount.token))} {fee.amount.token.symbol}
                      </div>

                      {fee.amount.inDollars > 0 && (
                        <div className="text-right text-sm text-turtle-level4">
                          ${formatAmount(fee.amount.inDollars)}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}

            <li className="mt-4 flex items-start justify-between border-turtle-level2">
              <div className="flex">
                <div className="pt-[3px] text-sm font-bold">Duration</div>
              </div>
              <div className="items-right flex items-center space-x-0.5">
                <div className="text-right text-lg text-turtle-foreground md:text-xl">{durationEstimate}</div>
              </div>
            </li>
          </ul>

          {isBalanceSufficientForFees && isAmountTooLow && (
            <div className="bg-turtle-secondary-transparent my-4 flex flex-row items-center justify-center rounded-[8px] p-2">
              <ExclamationMark width={20} height={20} fill={colors['turtle-foreground']} className="mr-3" />
              <div className="text-small">The amount is a bit too low to justify the fees</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div {...animationConfig}>{renderContent()}</motion.div>
    </AnimatePresence>
  )
}
