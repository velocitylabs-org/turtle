import { useEffect, useRef, useState } from 'react'
import { StoredTransfer } from '@/models/transfer'
import { Direction } from '@/services/transfer'

const ESTIMATED_DURATION = {
  toEthereum: 4 * 60 * 60, // 30 mins in seconds
  toPolkadot: 30 * 60, // 4h in seconds
  xcmTransfer: 2 * 60, // 2 mins in seconds
}

const getDurationEstimateMs = (direction: Direction) => {
  switch (direction) {
    case Direction.ToEthereum:
      return ESTIMATED_DURATION.toEthereum * 1000
    case Direction.ToPolkadot:
      return ESTIMATED_DURATION.toPolkadot * 1000
    case Direction.WithinPolkadot:
      return ESTIMATED_DURATION.xcmTransfer * 1000
    default:
      console.error('Unsupported direction to get transfer progress')
      return 30 * 60 * 1000 // default 30 mins
  }
}

const getTransferProgress = (date: Date, direction: Direction) => {
  const estimatedDurationMs = getDurationEstimateMs(direction)
  const transferTimestamp = new Date(date).getTime()
  const targetTimestamp = estimatedDurationMs + transferTimestamp
  const currentTimestamp = new Date().getTime()

  if (currentTimestamp > targetTimestamp) return 90

  // time already spent between transfer start & current time
  const timePassed = currentTimestamp - transferTimestamp
  const progress = (timePassed / estimatedDurationMs) * 100

  // To avoid displaying full progress bar, keep a 10% buffer.
  // It returns 90% max and min 1% (to improve UI)
  return Math.min(progress + 1, 90)
}

const useTransferProgress = (transfer: StoredTransfer, direction: Direction) => {
  const [progress, setProgress] = useState<number>(
    // Calculate progress from cache if transferStatus is available
    getTransferProgress(transfer.date, direction),
  )
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const updateProgress = () => {
    const transferProgress = getTransferProgress(transfer.date, direction)
    setProgress(transferProgress)
    if (transferProgress >= 90 && progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  useEffect(() => {
    const intervalDuration = direction === Direction.WithinPolkadot ? 1500 : 5000
    // Initiate the progress bar without waiting the 5 secs timeout.
    if (progress === 0) setProgress(getTransferProgress(transfer.date, direction))
    // Set a time-interval to update the progress bar every 5 seconds
    progressIntervalRef.current = setInterval(updateProgress, intervalDuration)

    // Clean-up function to remove the time-interval when component unmount
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return progress
}

export default useTransferProgress
