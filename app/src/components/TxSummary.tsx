import { AnimatePresence, motion } from 'framer-motion'
import { AMOUNT_VS_FEE_RATIO } from '@/config'
import useTokenPrice from '@/hooks/useTokenPrice'
import { TokenAmount } from '@/models/select'
import { AmountInfo } from '@/models/transfer'
import { Direction } from '@/services/transfer'
import { cn } from '@/utils/cn'
import { formatAmount, toAmountInfo , toHuman } from '@/utils/transfer'
import { colors } from '../../tailwind.config'
import { spinnerSize } from './Button'
import Delayed from './Delayed'
import ExclamationMark from './svg/ExclamationMark'
import LoadingIcon from './svg/LoadingIcon'

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

export default function TxSummary({
  loading,
  tokenAmount,
  fees,
  bridgingFees,
  durationEstimate,
  direction,
  canPayFees,
  canPayAdditionalFees,
  className,
}: TxSummaryProps) {
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
          <div className="mt-3 text-center text-lg font-bold text-turtle-foreground md:text-xl">
            Summary
          </div>
          <ul>
            {/* Execution fees */}
            {fees && (
              <li className="mt-4 flex items-start justify-between border-turtle-level2">
                <div className="items-left flex flex-col">
                  <div className="pt-[3px] text-sm font-bold">
                    {bridgingFees ? 'Execution fee' : 'Fee'}{' '}
                  </div>
                  {!canPayFees && (
                    <div className="ml-[-6px] mt-1 flex w-auto flex-row items-center rounded-[6px] border-1 border-black bg-turtle-warning px-2 py-1 text-xs">
                      <ExclamationMark
                        width={16}
                        height={16}
                        fill={colors['turtle-foreground']}
                        className="mr-2"
                      />
                      <span>You don&apos;t have enough {fees.token.symbol}</span>
                    </div>
                  )}
                </div>
                <div className="items-right flex">
                  <div>
                    <div className="flex items-center text-right text-lg text-turtle-foreground md:text-xl">
                      {formatAmount(toHuman(fees.amount, fees.token))} {fees.token.symbol}
                    </div>

                    {fees.inDollars > 0 && (
                      <div className="text-right text-sm text-turtle-level4">
                        ${formatAmount(fees.inDollars)}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            )}

            {/* Bridging fees */}
            {isBridgeTransfer && bridgingFees && (
              <li className="mt-4 flex items-start justify-between border-turtle-level2">
                <div className="items-left flex flex-col">
                  <div className="pt-[3px] text-sm font-bold">Bridging fee</div>
                  {!canPayAdditionalFees && (
                    <div className="ml-[-6px] mt-1 flex w-auto flex-row items-center rounded-[6px] border-1 border-black bg-turtle-warning px-2 py-1 text-xs">
                      <ExclamationMark
                        width={16}
                        height={16}
                        fill={colors['turtle-foreground']}
                        className="mr-2"
                      />
                      <span>You don&apos;t have enough {bridgingFees.token.symbol}</span>
                    </div>
                  )}
                </div>
                <div className="items-right flex">
                  <div>
                    <div className="flex items-center text-right text-lg text-turtle-foreground md:text-xl">
                      {formatAmount(toHuman(bridgingFees.amount, bridgingFees.token))}{' '}
                      {bridgingFees.token.symbol}
                    </div>

                    {bridgingFees.inDollars > 0 && (
                      <div className="text-right text-sm text-turtle-level4">
                        ${formatAmount(bridgingFees.inDollars)}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            )}

            <li className="mt-4 flex items-start justify-between border-turtle-level2">
              <div className="flex">
                <div className="pt-[3px] text-sm font-bold">Duration</div>
              </div>
              <div className="items-right flex items-center space-x-0.5">
                <div className="text-right text-lg text-turtle-foreground md:text-xl">
                  {durationEstimate}
                </div>
              </div>
            </li>
          </ul>

          {canPayFees && isAmountTooLow && (
            <div className="my-4 flex flex-row items-center justify-center rounded-[8px] bg-turtle-secondary-transparent p-2">
              <ExclamationMark
                width={20}
                height={20}
                fill={colors['turtle-foreground']}
                className="mr-3"
              />
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
