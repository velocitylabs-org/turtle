import { AmountInfo } from '@/models/transfer'
import { formatAmount, toAmountInfo, toHuman } from '@/utils/transfer'
import { AnimatePresence, motion } from 'framer-motion'
import { FC } from 'react'
import { spinnerSize } from './Button'
import LoadingIcon from './svg/LoadingIcon'
import { ExclamationMark } from './svg/ExclamationMark'
import { colors } from '../../tailwind.config'
import { AMOUNT_VS_FEE_RATIO } from '@/config'
import { TokenAmount } from '@/models/select'
import useTokenPrice from '@/hooks/useTokenPrice'
import { cn } from '@/utils/cn'
import Delayed from './Delayed'
import { Direction } from '@/services/transfer'
import { Tooltip } from './Tooltip'
import { Info } from 'lucide-react'

interface TxSummaryProps {
  tokenAmount: TokenAmount
  loading?: boolean
  fees?: AmountInfo | null
  durationEstimate?: string
  direction?: Direction
  canPayFees: boolean
  className?: string
}

const TxSummary: FC<TxSummaryProps> = ({
  loading,
  tokenAmount,
  fees,
  durationEstimate,
  direction,
  canPayFees,
  className,
}) => {
  const { price } = useTokenPrice(tokenAmount.token)
  const transferAmount = toAmountInfo(tokenAmount, price)

  if (!fees && !loading) return null

  const renderContent = () => {
    if (loading || !fees) {
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
            <div className="animate-slide-up-soft mt-1 text-xs text-turtle-secondary">
              Sorry that it&apos;s taking so long. Hang on or try again
            </div>
          </Delayed>
        </div>
      )
    }

    const isAmountTooLow =
      transferAmount && transferAmount.inDollars < fees.inDollars * AMOUNT_VS_FEE_RATIO

    return (
      <div className={cn('tx-summary p-4 pt-0', className)}>
        <div className="pt-3">
          <div className="mt-3 text-center text-lg font-bold text-turtle-foreground">Summary</div>
          <ul>
            <li className="mt-4 flex items-start justify-between border-turtle-level2">
              <div className="items-left flex flex-col">
                <div className="font-bold">Fee</div>
                {!canPayFees && (
                  <div className="ml-[-6px] mt-1 flex w-auto flex-row items-center rounded-[6px] border-1 border-black bg-turtle-warning px-2 py-1 text-xs">
                    <ExclamationMark
                      width={16}
                      height={16}
                      fill={colors['turtle-foreground']}
                      className="mr-2"
                    />
                    <span>You don&apos;t have enough {fees.token.symbol} to pay fees</span>
                  </div>
                )}
              </div>
              <div className="items-right flex">
                <div>
                  <div className="text-right text-turtle-foreground">
                    {formatAmount(toHuman(fees.amount, fees.token))} {fees.token.symbol}
                  </div>
                  {fees.inDollars > 0 && (
                    <div className="text-right text-turtle-level4">
                      ${formatAmount(fees.inDollars)}
                    </div>
                  )}
                </div>
              </div>
            </li>
            <li className="mt-4 flex items-start justify-between border-turtle-level2">
              <div className="flex">
                <div className="font-bold">Duration</div>
              </div>
              <div className="items-right flex items-center space-x-0.5">
                <div className="text-turtle-foreground">{durationEstimate}</div>
                {direction === Direction.WithinPolkadot && (
                  <Tooltip
                    showIcon={false}
                    content={
                      'Your tokens should land in ~30s but our services usually take ~2 minutes to catch up'
                    }
                  >
                    <Info className="h-3 w-3 text-turtle-level6" />
                  </Tooltip>
                )}
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
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: 1,
          height: 'auto',
          transition: { type: 'spring', bounce: 0.6, duration: 0.5 },
        }}
        exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
      >
        {renderContent()}
      </motion.div>
    </AnimatePresence>
  )
}

export default TxSummary
