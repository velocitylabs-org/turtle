import { FC } from 'react'
import useOngoingTransferProgress from '@/hooks/useOngoingTransferProgress'
import { StoredTransfer } from '@/models/transfer'
import { SnowbridgeStatus } from '@/models/snowbridge'
import { Direction } from '@/services/transfer'
import { cn } from '@/utils/cn'

interface ProgressBarProps {
  transfer: StoredTransfer
  direction: Direction
  outlinedProgressBar: boolean
  transferStatus?: SnowbridgeStatus
}

const ProgressBar: FC<ProgressBarProps> = ({
  transfer,
  direction,
  transferStatus,
  outlinedProgressBar,
}) => {
  const progress = useOngoingTransferProgress(transfer, direction, transferStatus)

  return (
    <>
      {!outlinedProgressBar ? (
        <div
          className={cn(
            'mb-4 h-2 overflow-hidden rounded-full bg-turtle-secondary-light',
            progress <= 0 && 'animate-pulse',
          )}
        >
          <div
            className="h-full rounded-full border border-turtle-secondary-dark bg-turtle-secondary transition-all duration-700 ease-in-out"
            style={{ transform: `translateX(-${100 - (progress || 0)}%)` }}
          />
        </div>
      ) : (
        <div className="mb-4 h-2 rounded-full border border-turtle-secondary bg-white">
          {progress > 0 && (
            <div
              className="-ml-[1px] -mt-[1px] h-2 rounded-full border border-turtle-secondary-dark bg-turtle-secondary"
              style={{ width: `${progress}%` }}
            />
          )}
        </div>
      )}
    </>
  )
}

export default ProgressBar
