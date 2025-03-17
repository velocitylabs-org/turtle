import { FC } from 'react'
import { cn } from '@/utils/helper'

interface ProgressBarProps {
  progress: number
  outlinedProgressBar: boolean
}

const ProgressBar: FC<ProgressBarProps> = ({ progress, outlinedProgressBar }) => {
  return (
    <>
      {!outlinedProgressBar ? (
        <div
          className={cn(
            'mb-4 h-2 overflow-hidden rounded-full border border-turtle-secondary-dark bg-white',
            progress <= 0 && 'animate-pulse',
          )}
        >
          <div
            className="h-full rounded-full bg-turtle-secondary transition-all duration-1000 ease-in-out"
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
