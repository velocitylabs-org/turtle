import { Fees } from '@/models/transfer'
import { feeToHuman } from '@/utils/transfer'
import { AnimatePresence, motion } from 'framer-motion'
import { FC } from 'react'
import { spinnerSize } from './Button'
import LoadingIcon from './svg/LoadingIcon'

interface FeesPreviewProps {
  loading?: boolean
  fees?: Fees | null
  hidden?: boolean
}

const FeesPreview: FC<FeesPreviewProps> = ({ loading, fees, hidden }) => {
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
      <div className="fees mt-2 p-4">
        <div className="border-t border-turtle-level2 py-4">
          <div className="text-center text-xl font-bold text-turtle-foreground">Fees</div>
          <div className="mt-4 flex items-center justify-between border-y border-turtle-level2 py-3">
            <div>
              <div className="text-turtle-foreground">
                {feeToHuman(fees)} {fees.token.symbol}
              </div>
              {fees.inDollars > 0 && (
                <div className="text-turtle-level3">${fees.inDollars.toFixed(10)}</div>
              )}
            </div>
            <div className="flex items-center">
              <div className="text-green-900">~30 mins</div>
            </div>
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

export default FeesPreview
