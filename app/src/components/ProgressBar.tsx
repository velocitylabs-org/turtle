import { FC } from 'react'
import { cn } from '@/utils/cn'

interface ProgressBarProps {
  progression: number
  outlinedProgressBar: boolean
}

const ProgressBar: FC<ProgressBarProps> = ({ progression, outlinedProgressBar }) => {
  return (
    <>
      {!outlinedProgressBar ? (
        <div
          className={cn(
            'mb-4 h-2 overflow-hidden rounded-full bg-turtle-secondary-light',
            progression <= 0 && 'animate-pulse',
          )}
        >
          <div
            className="h-full rounded-full border border-turtle-secondary-dark bg-turtle-secondary transition-all duration-700 ease-in-out"
            style={{ transform: `translateX(-${100 - (progression || 0)}%)` }}
          />
        </div>
      ) : (
        <div className="mb-4 h-2 rounded-full border border-turtle-secondary bg-white">
          {progression > 0 && (
            <div
              className="-ml-[1px] -mt-[1px] h-2 rounded-full border border-turtle-secondary-dark bg-turtle-secondary"
              style={{ width: `${progression}%` }}
            />
          )}
        </div>
      )}
    </>
  )
}

export default ProgressBar
