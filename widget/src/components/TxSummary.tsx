import { AMOUNT_VS_FEE_RATIO } from '@/utils/consts'
import useTokenPrice from '@/hooks/useTokenPrice'
import { TokenAmount } from '@/models/select'
import { AmountInfo } from '@/models/transfer'
import { cn } from '@/utils/helper'
import { getTotalFees, toAmountInfo, Direction } from '@/utils/transfer'
import { AnimatePresence, motion } from 'framer-motion'
import { Info } from 'lucide-react'
import { FC } from 'react'
import { colors } from '../../tailwind.config'
import { spinnerSize } from './Button'
import Delayed from './Delayed'
import { ExclamationMark } from '@/assets/svg/ExclamationMark'
import LoadingIcon from '@/assets/svg/LoadingIcon'
import { Tooltip } from './Tooltip'

interface TxSummaryProps {
  tokenAmount: TokenAmount
  loading?: boolean
  fees?: AmountInfo | null
  additionalfees?: AmountInfo | null
  durationEstimate?: string
  direction?: Direction
  canPayFees: boolean
  className?: string
}

const TxSummary: FC<TxSummaryProps> = ({
  loading,
  tokenAmount,
  fees,
  additionalfees,
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
            <div className="animate-slide-up-soft mt-1 text-center text-xs text-turtle-secondary">
              Sorry that it&apos;s taking so long. Hang on or try again
            </div>
          </Delayed>
        </div>
      )
    }

    const isAmountTooLow =
      transferAmount && transferAmount.inDollars < fees.inDollars * AMOUNT_VS_FEE_RATIO

    const isBridgeTransfer =
      direction === Direction.ToEthereum || direction === Direction.ToPolkadot

    const { totalFeesAmount, totalFeesValue } = getTotalFees(fees, additionalfees)

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
                  <div className="flex items-center text-right text-turtle-foreground">
                    {totalFeesAmount} {fees.token.symbol}
                    {isBridgeTransfer && !additionalfees && (
                      <Tooltip
                        showIcon={false}
                        content={
                          'This excludes ETH gas fees. Check your wallet popup for the total amount.'
                        }
                        className="max-w-xs text-center sm:max-w-sm"
                      >
                        <Info className="ml-0.5 h-3 w-3 text-turtle-foreground" />
                      </Tooltip>
                    )}
                  </div>

                  {fees.inDollars > 0 && (
                    <div className="text-right text-turtle-level4">${totalFeesValue}</div>
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
