import { useEffect, useRef, useState } from 'react'

import { estimateBridgeProgress } from '@/context/snowbridge'
import { SnowbridgeStatus } from '@/models/snowbridge'
import { StoredTransfer } from '@/models/transfer'
import { Direction } from '@/services/transfer'

const useSnowbridgeTransferEstimate = (
  transfer: StoredTransfer,
  direction: Direction,
  transferStatus?: SnowbridgeStatus,
) => {
  const [progress, setProgress] = useState<number>(
    // Caluculate progress from cache if transferStatus is available
    estimateBridgeProgress(transfer.date, direction, transferStatus),
  )
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const updateProgress = () => {
    const transferProgress = estimateBridgeProgress(transfer.date, direction, transferStatus)
    setProgress(transferProgress)
    if (transferProgress >= 90 && progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  useEffect(() => {
    // Initiate the progress bar without waiting the 5 secs timeout.
    if (progress === 0)
      setProgress(estimateBridgeProgress(transfer.date, direction, transferStatus))
    // Set a time-interval to update the progress bar every 5 seconds
    progressIntervalRef.current = setInterval(updateProgress, 5000)

    // Clean-up function to remove the time-interval when component unmount
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [transferStatus])

  return progress
}

export default useSnowbridgeTransferEstimate
