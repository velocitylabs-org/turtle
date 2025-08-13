import { useCallback, useEffect, useRef, useState } from 'react'
import type { StoredTransfer } from '@/models/transfer'
import { Direction } from '@/services/transfer'

const ESTIMATED_DURATION = {
  toEthereum: 2 * 60 * 60, // 2 h in seconds
  toPolkadot: 30 * 60, // 30mins in seconds
  xcmTransfer: 30, // 30 seconds
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

const getTransferProgress = (date: Date, direction: Direction, shouldStartProgress: boolean) => {
  if (!shouldStartProgress) return 0
  const estimatedDurationMs = getDurationEstimateMs(direction)
  const transferTimestamp = new Date(date).getTime()
  const targetTimestamp = estimatedDurationMs + transferTimestamp
  const currentTimestamp = Date.now()

  if (currentTimestamp > targetTimestamp) return 90

  // time already spent between transfer start & current time
  const timePassed = currentTimestamp - transferTimestamp
  const progress = (timePassed / estimatedDurationMs) * 100

  // To avoid displaying the full progress bar, keep a 10% buffer.
  // It returns 90% max and min 1% (to improve UI)
  return Math.min(progress + 1, 90)
}

export default function useTransferProgress(transfer: StoredTransfer, direction: Direction) {
  const transferDate = transfer.finalizedAt ? transfer.finalizedAt : transfer.date
  const shouldStartProgress = !!(
    direction !== Direction.WithinPolkadot ||
    (direction === Direction.WithinPolkadot && transfer.finalizedAt)
  )
  const [progress, setProgress] = useState<number>(
    // Calculate progress from cache if transferStatus is available
    getTransferProgress(transferDate, direction, shouldStartProgress),
  )
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const updateProgress = useCallback(() => {
    const transferProgress = getTransferProgress(transferDate, direction, shouldStartProgress)
    setProgress(transferProgress)
    if (transferProgress >= 90 && progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }, [transferDate, direction, shouldStartProgress])

  useEffect(() => {
    const intervalDuration = direction === Direction.WithinPolkadot ? 1500 : 5000
    // Initiate the progress bar without waiting the timeout.
    if (progress === 0) setProgress(getTransferProgress(transferDate, direction, shouldStartProgress))
    // Set a time-interval to update the progress bar
    progressIntervalRef.current = setInterval(updateProgress, intervalDuration)

    // Clean-up function to remove the time-interval when component unmount
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [transferDate, direction, progress, shouldStartProgress, updateProgress])

  return progress
}
