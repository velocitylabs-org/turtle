import { AmountInfo } from '@/models/transfer'
import { formatAmount, toHuman } from '@/utils/transfer'
import { AnimatePresence, motion } from 'framer-motion'
import { FC } from 'react'
import { spinnerSize } from './Button'
import LoadingIcon from './svg/LoadingIcon'
import { ExclamationMark } from './svg/ExclamationMark'
import { colors } from '../../tailwind.config'
import { AMOUNT_VS_FEE_RATIO } from '@/config'

interface TxSummaryProps {
  loading?: boolean
  transferAmount?: AmountInfo | null
  fees?: AmountInfo | null
  durationEstimate?: string
  hidden?: boolean
}

const TxSummary: FC<TxSummaryProps> = ({ loading, transferAmount, fees, durationEstimate, hidden }) => {
  const renderContent = () => {
    if (loading) {
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

    if (!fees || !transferAmount) return null

    return (
      <div className="tx-summary p-4 pt-3">
        <div className="pt-3">
          {/* Vertical divider */}
          <div className="flex justify-center">
            <div className="h-[30px] border-r border-turtle-level3"></div>
          </div>

          <div className="mt-3 text-center text-xl font-bold text-turtle-foreground">Summary</div>

          <ul>
          <li className="mt-4 flex items-start justify-between border-turtle-level2">
              <div className="flex">
                <div className="font-bold">Fees</div>
              </div>
              <div className="items-right flex">
                <div>
                  <div className="text-right text-lg text-turtle-foreground">
                    {formatAmount(toHuman(fees.amount, fees.token))} {fees.token.symbol}
                  </div>
                  {fees.inDollars > 0 && (
                    <div className="text-right text-turtle-level3">
                      ${formatAmount(fees.inDollars)}
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
                    {formatAmount(Number(transferAmount.amount))} {transferAmount.token.symbol}
                  </div>
                  {transferAmount.inDollars > 0 && (
                    <div className="text-right text-turtle-level3">
                      ${formatAmount(transferAmount.inDollars)}
                    </div>
                  )}
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

          { transferAmount.inDollars < (fees.inDollars * AMOUNT_VS_FEE_RATIO) && 
          <div className="flex flex-row items-center justify-around my-4 p-2 px-3 rounded-[8px] bg-turtle-secondary-transparent">
            <ExclamationMark
              width={20}
              height={20}
              fill={colors['turtle-foreground']}
              className="mr-2 h-[1.3rem] w-[1.3rem]"
            />
            <div className="text-small">The amount is a bit too low to justify the fees</div>
          </div>
          }
          
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {!hidden && (
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
      )}
    </AnimatePresence>
  )
}

export default TxSummary
