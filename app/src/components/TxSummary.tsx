import { AmountInfo } from '@/models/transfer'
import { formatAmount, toHuman } from '@/utils/transfer'
import { AnimatePresence, motion } from 'framer-motion'
import { FC } from 'react'
import { spinnerSize } from './Button'
import LoadingIcon from './svg/LoadingIcon'
import { ExclamationMark } from './svg/ExclamationMark'
import { colors } from '../../tailwind.config'

interface TxSummaryProps {
  loading?: boolean
  fees?: AmountInfo | null
  durationEstimate?: string
  hidden?: boolean
}

const TxSummary: FC<TxSummaryProps> = ({ loading, fees, durationEstimate, hidden }) => {
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

    if (!fees) return null

    return (
      <div className="fees p-4">
        <div className="pt-3">
          {/* Vertical divider */}
          <div className='flex justify-center'><div className='h-[30px] border-r border-turtle-level3'></div></div>
          
          <div className="text-center text-xl font-bold text-turtle-foreground mt-3">Summary</div>

          {/* Row */}
          <ul>
            <li className="mt-4 flex items-start justify-between border-turtle-level2">
              <div className="flex">
                <div className="font-bold">Amount</div>
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
                <div className="font-bold">Duration</div>
              </div>
              <div className="items-right flex">
              <div className="text-turtle-foreground">{durationEstimate}</div>
              </div>
            </li>
          </ul>

          <div className='flex flex-row items-center justify-around p-2 px-3 my-4 bg-turtle-secondary-transparent rounded-[8px]'>
            <ExclamationMark width={20} height={20}  fill={colors['turtle-foreground']} className='mr-2 w-[1.3rem] h-[1.3rem]'/>
            <div className='text-small'>The amount is a bit too low to justify the fees</div>
          </div>
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
