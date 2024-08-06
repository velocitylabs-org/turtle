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
  transferStatus?: SnowbridgeStatus
}

const TransferEstimate: FC<TransferEstimateProps> = ({
  transfer,
  direction,
  transferStatus,
  outlinedProgressBar,
}) => {
  const progress = useSnowbridgeTransferEstimate(transfer, direction, transferStatus)

  return <ProgressBar progress={progress} outlinedProgressBar={outlinedProgressBar} />
}

export default TransferEstimate
