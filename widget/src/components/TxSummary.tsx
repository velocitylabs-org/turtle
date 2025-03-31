import { AMOUNT_VS_FEE_RATIO } from '@/utils/consts'
import useTokenPrice from '@/hooks/useTokenPrice'
import { TokenAmount } from '@/models/select'
import { AmountInfo } from '@/models/transfer'
import { cn } from '@/utils/helper'
import { toAmountInfo, Direction, formatAmount, toHuman } from '@/utils/transfer'
import { AnimatePresence, motion } from 'framer-motion'
import { FC } from 'react'
import { colors } from '../../tailwind.config'
import { spinnerSize } from './Button'
import Delayed from './Delayed'
import { ExclamationMark } from '@/assets/svg/ExclamationMark'
import LoadingIcon from '@/assets/svg/LoadingIcon'
import { ArrowRightLeft, Clock, Zap } from 'lucide-react'

interface TxSummaryProps {
  tokenAmount: TokenAmount
  loading?: boolean
  fees?: AmountInfo | null
  bridgingFees?: AmountInfo | null
  durationEstimate?: string
  direction?: Direction
  canPayFees: boolean
  canPayAdditionalFees: boolean
  className?: string
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

const TxSummary: FC<TxSummaryProps> = ({
  loading,
  tokenAmount,
  fees,
  bridgingFees,
  durationEstimate,
  direction,
  canPayFees,
  canPayAdditionalFees,
  className,
}) => {
  const { price } = useTokenPrice(tokenAmount.token)
  const transferAmount = toAmountInfo(tokenAmount, price)

  if (!loading && !fees && !bridgingFees) return null

  const renderContent = () => {
    if (loading) {
      return (
        <div className="mt-4 flex h-[10rem] w-full animate-pulse flex-col items-center justify-center rounded-[8px] bg-turtle-level1">
          <LoadingIcon
            className="animate-spin"
            width={spinnerSize['lg']}
            height={spinnerSize['lg']}
            color={colors['turtle-secondary']}
          />
          <div className="animate-slide-up-soft mt-2 text-sm font-bold text-turtle-secondary">
            Loading fees
          </div>
          <Delayed millis={7000}>
            <div className="animate-slide-up-soft mt-1 text-center text-xs text-turtle-secondary">
              Sorry that it&apos;s taking so long. Hang on or try again
            </div>
          </Delayed>
        </div>
      )
    }

    const isAmountTooLow =
      transferAmount && transferAmount.inDollars < (fees?.inDollars ?? 0) * AMOUNT_VS_FEE_RATIO

    const isBridgeTransfer =
      direction === Direction.ToEthereum || direction === Direction.ToPolkadot

    return (
      <div className={cn('tx-summary p-0 pt-0', className)}>
        <div className="pt-3">
          <div className="relative my-4 flex max-w-3xl flex-col gap-3 rounded-lg border bg-white p-3 shadow-sm">
            <div className="absolute -top-2.5 left-2.5 bg-white px-1 text-sm text-turtle-level5">
              Summary
            </div>
            <div className="flex items-center justify-between space-x-4 py-2">
              {fees && (
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-amber-50 p-1.5">
                    <Zap className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      {bridgingFees ? 'Execution fee' : 'Fee'}
                    </p>
                    <div className="flex flex-col items-baseline gap-0.5">
                      <span className="text-sm font-medium">
                        {formatAmount(toHuman(fees.amount, fees.token))} {fees.token.symbol}
                      </span>
                      {fees.inDollars > 0 && (
                        <span className="text-xs text-gray-400">
                          ${formatAmount(fees.inDollars)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!isBridgeTransfer ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-purple-50 p-1.5">
                      <Clock className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <span className="text-sm font-medium">{durationEstimate}</span>
                  </div>
                </div>
              ) : (
                bridgingFees && (
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-blue-50 p-1.5">
                      <ArrowRightLeft className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Bridging fee</p>
                      <div className="flex flex-col items-baseline gap-0.5">
                        <span className="text-sm font-medium">
                          {formatAmount(toHuman(bridgingFees.amount, bridgingFees.token))}{' '}
                          {bridgingFees.token.symbol}
                        </span>
                        {bridgingFees.inDollars > 0 && (
                          <span className="text-xs text-gray-400">
                            ${formatAmount(bridgingFees.inDollars)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {isBridgeTransfer && (
              <>
                <div className="border-t border-gray-100" />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-purple-50 p-1.5">
                      <Clock className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-xs text-gray-500">Duration</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">{durationEstimate}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {!canPayFees && fees ? (
            <div className="mx-auto flex w-fit flex-row items-center rounded-[6px] border-1 border-black bg-turtle-warning px-2 py-1 text-xs">
              <ExclamationMark
                width={16}
                height={16}
                fill={colors['turtle-foreground']}
                className="mr-2"
              />
              <span>You don&apos;t have enough {fees.token.symbol}</span>
            </div>
          ) : !canPayAdditionalFees && bridgingFees ? (
            <div className="mx-auto flex w-fit items-center rounded-[6px] border-1 border-black bg-turtle-warning px-2 py-1 text-xs">
              <ExclamationMark
                width={16}
                height={16}
                fill={colors['turtle-foreground']}
                className="mr-2"
              />
              <span>You don&apos;t have enough {bridgingFees.token.symbol}</span>
            </div>
          ) : canPayFees && isAmountTooLow ? (
            <div className="mx-auto my-4 flex w-fit flex-row items-center justify-center rounded-[8px] bg-turtle-secondary-transparent p-2">
              <ExclamationMark
                width={20}
                height={20}
                fill={colors['turtle-foreground']}
                className="mr-3"
              />
              <div className="text-small">The amount is a bit too low to justify the fees</div>
            </div>
          ) : null}
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

export default TxSummary
