import { useEffect, useRef, useState } from 'react'
import { StoredTransfer } from '@/models/transfer'
import { Direction } from '@/services/transfer'
import { EstimatedTransferDuration } from './useTransfersEstimate'

const getTransferProgress = (
  transferDate: Date,
  transferDirection: Direction,
  bridgeStatus: EstimatedTransferDuration,
) => {
  let bridgeTimestamp = 0
  switch (transferDirection) {
    case Direction.ToEthereum:
      bridgeTimestamp = bridgeStatus.ethBridgeStatus * 1000
      break
    case Direction.ToPolkadot:
      bridgeTimestamp = bridgeStatus.polkadotBridgeStatus * 1000
      break
    case Direction.WithinPolkadot:
      bridgeTimestamp = bridgeStatus.xcmTransferStatus * 1000
      break
    default:
      console.error('Unsupported direction to get transfer progress')
  }

  const transferTimestamp = new Date(transferDate).getTime()
  const targetTimestamp = bridgeTimestamp + transferTimestamp
  const currentTimestamp = new Date().getTime()

  if (currentTimestamp > targetTimestamp) return 90

  // time already spent between transfer start & current time
  const diffTimeSinceTransfer = currentTimestamp - transferTimestamp
  const progress = (diffTimeSinceTransfer / bridgeTimestamp) * 100

  // To avoid displaying full progress bar, keep a 10% buffer.
  // It returns 90% max and min 1% (to improve UI)
  return Math.min(progress < 1 ? 1 : progress, 90)
}

const useTransferProgress = (
  transfer: StoredTransfer,
  direction: Direction,
  transferStatus: EstimatedTransferDuration,
) => {
  const [progress, setProgress] = useState<number>(
    // Calculate progress from cache if transferStatus is available
    getTransferProgress(transfer.date, direction, transferStatus),
  )
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const updateProgress = () => {
    const transferProgress = getTransferProgress(transfer.date, direction, transferStatus)
    setProgress(transferProgress)
    if (transferProgress >= 90 && progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  useEffect(() => {
    const intervalDuration = direction === Direction.WithinPolkadot ? 1500 : 5000
    // Initiate the progress bar without waiting the 5 secs timeout.
    if (progress === 0) setProgress(getTransferProgress(transfer.date, direction, transferStatus))
    // Set a time-interval to update the progress bar every 5 seconds
    progressIntervalRef.current = setInterval(updateProgress, intervalDuration)

    // Clean-up function to remove the time-interval when component unmount
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transferStatus])

  return progress
}

export default useTransferProgress
