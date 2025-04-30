import { AMOUNT_VS_FEE_RATIO } from '@/utils/consts'
import useTokenPrice from '@/hooks/useTokenPrice'
import { TokenAmount } from '@/models/select'
import { AmountInfo } from '@/models/transfer'
import { cn } from '@/utils/helper'
import { toAmountInfo, Direction, formatAmount, toHuman } from '@/utils/transfer'
import { AnimatePresence, motion } from 'framer-motion'
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
  bridgingFee?: AmountInfo | null
  durationEstimate?: string
  direction?: Direction
  canPayFees: boolean
  canPayAdditionalFees: boolean
  className?: string
  exceedsTransferableBalance: boolean
  applyTransferableBalance: () => void
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

const TxSummary = ({
  loading,
  tokenAmount,
  fees,
  bridgingFee,
  durationEstimate,
  direction,
  canPayFees,
  canPayAdditionalFees,
  className,
  exceedsTransferableBalance,
  applyTransferableBalance,
}: TxSummaryProps) => {
  const { price } = useTokenPrice(tokenAmount.token)
  const transferAmount = toAmountInfo(tokenAmount, price)

  if (!loading && !fees && !bridgingFee) return null

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

    const exceedsTransferableBalanceInFees = !!(
      exceedsTransferableBalance &&
      transferAmount?.token?.id &&
      fees?.token?.id &&
      transferAmount.token.id === fees.token.id
    )

    const exceedsTransferableBalanceInBridgingFee = !!(
      exceedsTransferableBalance &&
      !exceedsTransferableBalanceInFees &&
      transferAmount?.token?.id &&
      bridgingFee?.token?.id &&
      transferAmount.token.id === bridgingFee.token.id
    )

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
                    <p className="text-xs text-gray-500">{bridgingFee ? 'Execution fee' : 'Fee'}</p>
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
                bridgingFee && (
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-blue-50 p-1.5">
                      <ArrowRightLeft className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Bridging fee</p>
                      <div className="flex flex-col items-baseline gap-0.5">
                        <span className="text-sm font-medium">
                          {formatAmount(toHuman(bridgingFee.amount, bridgingFee.token))}{' '}
                          {bridgingFee.token.symbol}
                        </span>
                        {bridgingFee.inDollars > 0 && (
                          <span className="text-xs text-gray-400">
                            ${formatAmount(bridgingFee.inDollars)}
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

          {/* Display warning messages if needed */}
          {displayWarningMessage({
            fees,
            bridgingFee,
            canPayFees,
            canPayAdditionalFees,
            exceedsTransferableBalanceInFees,
            exceedsTransferableBalanceInBridgingFee,
            isAmountTooLow,
            applyTransferableBalance,
          })}
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

function displayWarningMessage(params: {
  fees?: AmountInfo | null
  bridgingFee?: AmountInfo | null
  canPayFees: boolean
  canPayAdditionalFees: boolean
  exceedsTransferableBalanceInFees: boolean
  exceedsTransferableBalanceInBridgingFee: boolean
  isAmountTooLow: boolean | null
  applyTransferableBalance: () => void
}) {
  const {
    fees,
    bridgingFee,
    canPayFees,
    canPayAdditionalFees,
    exceedsTransferableBalanceInFees,
    exceedsTransferableBalanceInBridgingFee,
    isAmountTooLow,
    applyTransferableBalance,
  } = params

  if (fees) {
    if (!canPayFees) {
      return (
        <div className="mx-auto flex w-fit flex-row items-center rounded-[6px] border-1 border-black bg-turtle-warning px-2 py-1 text-xs">
          <ExclamationMark
            width={16}
            height={16}
            fill={colors['turtle-foreground']}
            className="mr-2"
          />
          <span>You don&apos;t have enough {fees.token.symbol}</span>
        </div>
      )
    }

    if (exceedsTransferableBalanceInFees && canPayFees) {
      return (
        <div
          role="button"
          onClick={applyTransferableBalance}
          className="mx-auto flex w-fit cursor-pointer flex-row items-center rounded-[6px] border-1 border-black bg-turtle-warning px-2 py-1 text-xs"
        >
          <ExclamationMark
            width={16}
            height={16}
            fill={colors['turtle-foreground']}
            className="mr-2"
          />
          <span>
            We need some of that {fees.token.symbol} to pay fees
            <span className="ml-1 underline"> Ok</span>
          </span>
        </div>
      )
    }
  }

  if (bridgingFee) {
    if (!canPayAdditionalFees) {
      return (
        <div className="mx-auto flex w-fit items-center rounded-[6px] border-1 border-black bg-turtle-warning px-2 py-1 text-xs">
          <ExclamationMark
            width={16}
            height={16}
            fill={colors['turtle-foreground']}
            className="mr-2"
          />
          <span>You don&apos;t have enough {bridgingFee.token.symbol}</span>
        </div>
      )
    }

    if (exceedsTransferableBalanceInBridgingFee && canPayAdditionalFees) {
      return (
        <div
          role="button"
          onClick={applyTransferableBalance}
          className="mx-auto flex w-fit cursor-pointer flex-row items-center rounded-[6px] border-1 border-black bg-turtle-warning px-2 py-1 text-xs"
        >
          <ExclamationMark
            width={16}
            height={16}
            fill={colors['turtle-foreground']}
            className="mr-2"
          />
          <span>
            We need some of that {bridgingFee.token.symbol} to pay fees
            <span className="ml-1 underline"> Ok</span>
          </span>
        </div>
      )
    }
  }

  if (canPayFees && !exceedsTransferableBalanceInFees && isAmountTooLow) {
    return (
      <div className="mx-auto my-4 flex w-fit flex-row items-center justify-center rounded-[8px] bg-turtle-secondary-transparent p-2">
        <ExclamationMark
          width={16}
          height={16}
          fill={colors['turtle-foreground']}
          className="mr-2"
        />
        <div className="text-small">The amount is a bit too low to justify the fees</div>
      </div>
    )
  }

  return
}
