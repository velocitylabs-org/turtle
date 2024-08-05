import { useEffect, useRef, useState } from 'react'

import { bridgeProgressionValue } from '@/context/snowbridge'
import { SnowbridgeStatus } from '@/models/snowbridge'
import { StoredTransfer } from '@/models/transfer'
import { Direction } from '@/services/transfer'

const useOngoingTransferProgression = (
  transfer: StoredTransfer,
  direction: Direction,
  bridgeStatus?: SnowbridgeStatus,
) => {
  const [progression, setProgression] = useState<number>(0)
  const progressionIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const getProgression = () => {
    const transferProgression = bridgeProgressionValue(transfer.date, direction, bridgeStatus)
    setProgression(transferProgression)
    if (transferProgression >= 90 && progressionIntervalRef.current) {
      clearInterval(progressionIntervalRef.current)
      progressionIntervalRef.current = null
    }
  }

  useEffect(() => {
    progressionIntervalRef.current = setInterval(getProgression, 5000)
    return () => {
      if (progressionIntervalRef.current) {
        clearInterval(progressionIntervalRef.current)
      }
    }
  }, [bridgeStatus])

  return { progression }
}

export default useOngoingTransferProgression
