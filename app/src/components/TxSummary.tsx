import NumberFlow from '@number-flow/react'
import type { Chain, TokenAmount } from '@velocitylabs-org/turtle-registry'
import { colors } from '@velocitylabs-org/turtle-tailwind-config'
import { cn, spinnerSize, TokenLogo, Tooltip } from '@velocitylabs-org/turtle-ui'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import FeesBreakdown from '@/components/FeesBreakdown'
import { AMOUNT_VS_FEE_RATIO } from '@/config'
import useTokenPrice from '@/hooks/useTokenPrice'
import type { FeeDetails, FeeSufficiency } from '@/models/transfer'
import { toAmountInfo } from '@/utils/transfer'
import Delayed from './Delayed'
import AlertIcon from './svg/AlertIcon'
import InfoIcon from './svg/Info'
import LoadingIcon from './svg/LoadingIcon'

const fadeAnimationConfig = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

const loadingAnimationConfig = {
  ...fadeAnimationConfig,
  transition: { duration: 0.3 },
}

const contentAnimationConfig = {
  ...fadeAnimationConfig,
  transition: { duration: 0.4, delay: 0.1 },
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

const numberFlowFormat = {
  notation: 'compact' as const,
  maximumFractionDigits: 3,
}

interface TxSummaryProps {
  loading?: boolean
  sendingAmount: TokenAmount | null
  receivingAmount: TokenAmount | null
  destChain: Chain | null
  fees?: FeeDetails[] | null
  durationEstimate?: string
  className?: string
}

export default function TxSummary({
  loading,
  receivingAmount,
  sendingAmount,
  destChain,
  fees,
  durationEstimate,
  className,
}: TxSummaryProps) {
  const { price: sendingTokenPrice } = useTokenPrice(sendingAmount?.token)
  const { price: receivingTokenPrice } = useTokenPrice(receivingAmount?.token)

  const showLoading = loading || !receivingAmount || !receivingAmount.amount || !receivingAmount.token || !fees

  useEffect(() => {
    if (showLoading) {
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth',
        })
      }, 800)
      return
    }
  }, [showLoading])

  // Calculate total fees in dollars for isAmountTooLow check
  const totalFeesInDollars = fees?.reduce((sum, fee) => sum + fee.amount.inDollars, 0) ?? 0
  const isAmountTooLow = calcSendingAmountTooLow(totalFeesInDollars, sendingAmount, sendingTokenPrice)
  const isItWrappedToken = receivingAmount?.token?.origin?.type === 'Ethereum'

  const renderContent = () => {
    return (
      <div>
        <AnimatePresence mode="wait">
          {showLoading ? (
            <motion.div
              key="loading"
              {...loadingAnimationConfig}
              className="mt-6 sm:mt-8 flex h-[180px] w-full flex-col items-center justify-center rounded-[10px] bg-turtle-level1"
            >
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
            </motion.div>
          ) : (
            <motion.div
              key="content"
              {...contentAnimationConfig}
              className={cn(
                'mt-6 sm:mt-8 flex flex-col items-start gap-[15px] sm:gap-[20px] rounded-[8px] border border-turtle-level3 p-[18px] sm:p-[24px]',
                className,
              )}
            >
              {/* You'll get section */}
              <div className="flex w-full flex-row items-start justify-between">
                <div className="text-sm leading-none text-turtle-level6">You&apos;ll get</div>
                <div className="-mt-[9px] flex flex-col items-end gap-1">
                  <div className="flex flex-row items-baseline gap-2">
                    <TokenLogo token={receivingAmount.token!} sourceChain={destChain} size={25} />
                    <div className="text-[32px] font-medium text-turtle-foreground">
                      <NumberFlow value={receivingAmount.amount!} format={numberFlowFormat} />
                    </div>
                  </div>
                  {receivingTokenPrice && (
                    <div className={'animate-slide-up -mt-[5px] text-sm leading-none text-turtle-level6'}>
                      <NumberFlow
                        value={receivingTokenPrice * receivingAmount.amount!}
                        prefix="$"
                        format={numberFlowFormat}
                      />
                    </div>
                  )}
                </div>
              </div>

              {isAmountTooLow && (
                <div className="flex flex-row items-center gap-2 rounded-[8px] bg-turtle-level2 px-2 py-1">
                  <InfoIcon width={17} height={17} fill="black" />
                  <span className="text-[12px] text-turtle-foreground ine-block">
                    <span className="font-bold ">Note:</span> The amount is a bit too low to justify the fees
                  </span>
                </div>
              )}
              {isItWrappedToken && (
                <div className="flex flex-row items-center gap-2 rounded-[8px] bg-turtle-level2 px-2 py-1">
                  <InfoIcon width={17} height={17} fill="black" />
                  <span className="text-[12px] text-turtle-foreground ine-block">
                    <span className="font-bold ">Note:</span> You can swap this wrapped token on Hydration
                  </span>
                </div>
              )}

              <div className="border-1 h-1 w-full border-t border-turtle-level3" />

              <div className="flex w-full flex-row items-start justify-between">
                <div className="flex items-center gap-1">
                  <span className={cn('text-xs leading-none text-turtle-level6', getFeeStatusColor(fees))}>Fee</span>
                  <span className={cn('text-sm', getFeeStatusColor(fees))}>
                    <NumberFlow value={totalFeesInDollars} prefix="$" format={numberFlowFormat} />
                  </span>
                  {!!fees?.length && (
                    <Tooltip showIcon={false} content={<FeesBreakdown fees={fees} />}>
                      {getFeeStatusIcon(fees)}
                    </Tooltip>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-normal text-xs leading-none text-turtle-level6">Duration</span>
                  <span className="text-sm text-turtle-foreground">{durationEstimate}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div {...animationConfig}>{renderContent()}</motion.div>
    </AnimatePresence>
  )
}

function calcSendingAmountTooLow(
  totalFeesInDollars: number,
  sendingAmount: TokenAmount | null,
  sendingTokenPrice: number | undefined,
) {
  // Calculate total fees in dollars for isAmountTooLow check
  const transferAmountInfo = toAmountInfo(sendingAmount, sendingTokenPrice)
  return transferAmountInfo && transferAmountInfo.inDollars < totalFeesInDollars * AMOUNT_VS_FEE_RATIO
}

function getFeeStatus(fees?: FeeDetails[] | null): FeeSufficiency {
  if (!fees?.length) return 'sufficient'

  const hasInsufficient = fees.some(fee => fee.sufficient === 'insufficient')
  if (hasInsufficient) return 'insufficient'

  const hasUndetermined = fees.some(fee => fee.sufficient === 'undetermined')
  if (hasUndetermined) return 'undetermined'

  return 'sufficient'
}

function getFeeStatusIcon(fees: FeeDetails[]) {
  const size = { width: 14, height: 14 }
  const status = getFeeStatus(fees)

  switch (status) {
    case 'insufficient':
      return <AlertIcon {...size} fill={colors['turtle-error']} />
    case 'undetermined':
      return <AlertIcon {...size} fill="#F97316" />
    default:
      return <InfoIcon {...size} fill={colors['turtle-level6']} />
  }
}

function getFeeStatusColor(fees?: FeeDetails[] | null): string {
  const status = getFeeStatus(fees)

  switch (status) {
    case 'insufficient':
      return 'text-turtle-error'
    case 'undetermined':
      return 'text-orange-500'
    default:
      return 'text-turtle-foreground'
  }
}
