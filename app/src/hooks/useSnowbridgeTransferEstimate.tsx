import { useEffect, useRef, useState } from 'react'

import { getBridgeProgress } from '@/context/snowbridge'
import { SnowbridgeStatus } from '@/models/snowbridge'
import { StoredTransfer } from '@/models/transfer'
import { Direction } from '@/services/transfer'

const useSnowbridgeTransferEstimate = (
  transfer: StoredTransfer,
  direction: Direction,
  transferStatus?: SnowbridgeStatus,
) => {
  const [progress, setProgress] = useState<number>(0)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const updateProgress = () => {
    const transferProgress = getBridgeProgress(transfer.date, direction, transferStatus)
    setProgress(transferProgress)
    if (transferProgress >= 90 && progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  useEffect(() => {
    progressIntervalRef.current = setInterval(updateProgress, 5000)
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [transferStatus])

  return progress
}

export default useSnowbridgeTransferEstimate
