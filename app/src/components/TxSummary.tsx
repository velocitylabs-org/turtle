import { AmountInfo } from '@/models/transfer'
import { formatAmount, toAmountInfo, toHuman } from '@/utils/transfer'
import { AnimatePresence, motion } from 'framer-motion'
import NumberFlow from '@number-flow/react'
import { FC } from 'react'
import { spinnerSize } from './Button'
import LoadingIcon from './svg/LoadingIcon'
import { ExclamationMark } from './svg/ExclamationMark'
import { colors } from '../../tailwind.config'
import { AMOUNT_VS_FEE_RATIO } from '@/config'
import { TokenAmount } from '@/models/select'
import useTokenPrice from '@/hooks/useTokenPrice'
import { Skeleton } from './ui/skeleton'
import { cn } from '@/utils/cn'

interface TxSummaryProps {
  tokenAmount: TokenAmount
  loading?: boolean
  fees?: AmountInfo | null
  durationEstimate?: string
  className?: string
}

const TxSummary: FC<TxSummaryProps> = ({
  loading,
  tokenAmount,
  fees,
  durationEstimate,
  className,
}) => {
  const { price, loading: isLoadingTokenPrice } = useTokenPrice(tokenAmount.token)
  const transferAmount = toAmountInfo(tokenAmount, price)
  if (!fees && !loading) return null

  const renderContent = () => {
    if (loading || !fees) {
      return (
        <div className="mt-4 flex h-[10rem] w-full items-center justify-center rounded-[8px] bg-turtle-level1">
          <LoadingIcon
            className="animate-spin"
            width={spinnerSize['lg']}
            height={spinnerSize['lg']}
          />
        </div>
      )
    }

    return (
      <div className={cn('tx-summary p-4 pt-3', className)}>
        <div className="pt-3">
          <div className="mt-3 text-center text-xl font-bold text-turtle-foreground">Summary</div>
          <ul>
            <li className="mt-4 flex items-start justify-between border-turtle-level2">
              <div className="flex">
                <div className="font-bold">Fee</div>
              </div>
              <div className="items-right flex">
                <div>
                  <div className="text-right text-lg text-turtle-foreground">
                    {formatAmount(toHuman(fees.amount, fees.token))} {fees.token.symbol}
                  </div>
                  {fees.inDollars > 0 && (
                    <div className="text-right text-turtle-level4">
                      {/* ${formatAmount(fees.inDollars)} */}
                      <NumberFlow value={fees.inDollars} prefix="$" />x
                    </div>
                  )}
                </div>
              </div>
            </li>
            <li className="mt-4 flex items-start justify-between border-turtle-level2">
              <div className="flex">
                <div className="font-bold">Amount</div>
              </div>
              <div className="items-right flex">
                <div>
                  <div className="text-right text-lg text-turtle-foreground">
                    {formatAmount(Number(tokenAmount.amount))} {tokenAmount.token?.symbol}
                  </div>
                  <div className="min-h-6">
                    {isLoadingTokenPrice ? (
                      <Skeleton className="h-6 w-20 rounded-md bg-turtle-level1" />
                    ) : (
                      transferAmount &&
                      transferAmount.inDollars > 0 && (
                        <div className="text-right text-turtle-level4">
                          {/* ${formatAmount(transferAmount.inDollars)} */}
                          <NumberFlow value={transferAmount.inDollars} prefix="$" />
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </li>
            <li className="mt-4 flex items-start justify-between border-turtle-level2">
              <div className="flex">
                <div className="font-bold">Duration</div>
              </div>
              <div className="items-right flex">
                <div className="text-turtle-foreground">{durationEstimate}</div>
              </div>
            </li>
          </ul>

          {transferAmount && transferAmount.inDollars < fees.inDollars * AMOUNT_VS_FEE_RATIO && (
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
