import { cn } from '@velocitylabs-org/turtle-ui'

interface ProgressBarProps {
  progress: number
  outlinedProgressBar: boolean
}

export default function ProgressBar({ progress, outlinedProgressBar }: ProgressBarProps) {
  return (
    <>
      {!outlinedProgressBar ? (
        <div
          className={cn(
            'mb-4 h-2 overflow-hidden rounded-full bg-turtle-secondary-light group-hover:bg-turtle-background',
            progress <= 0 && 'animate-pulse',
          )}
        >
          <div
            className="h-full rounded-full border border-turtle-secondary-dark bg-turtle-secondary transition-all duration-1000 ease-in-out"
            style={{ transform: `translateX(-${100 - (progress || 0)}%)` }}
          />
        </div>
      ) : (
        <div
          className={cn(
            'mb-4 h-2 rounded-full border border-turtle-secondary bg-white',
            progress <= 0 && 'animate-pulse',
          )}
        >
          {progress > 0 && (
            <div
              className="-ml-[1px] -mt-[1px] h-2 rounded-full border border-turtle-secondary-dark bg-turtle-secondary transition-all duration-1000 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          )}
        </div>
      )}
    </>
  )
}
