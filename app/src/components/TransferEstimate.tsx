import { FC } from 'react'
import useSnowbridgeTransferEstimate from '@/hooks/useSnowbridgeTransferEstimate'
import { StoredTransfer } from '@/models/transfer'
import { SnowbridgeStatus } from '@/models/snowbridge'
import { Direction } from '@/services/transfer'
import ProgressBar from './ProgressBar'

interface TransferEstimateProps {
  transfer: StoredTransfer
  direction: Direction
  outlinedProgressBar: boolean
  estimatedTransferDuration?: SnowbridgeStatus
}

const TransferEstimate: FC<TransferEstimateProps> = ({
  transfer,
  direction,
  estimatedTransferDuration,
  outlinedProgressBar,
}) => {
  const progress = useSnowbridgeTransferEstimate(transfer, direction, estimatedTransferDuration)

  return <ProgressBar progress={progress} outlinedProgressBar={outlinedProgressBar} />
}

export default TransferEstimate
