import { FC } from 'react'
import useTransferProgress from '@/hooks/useTransferProgress'
import { StoredTransfer } from '@/models/transfer'
import { Direction } from '@/services/transfer'
import ProgressBar from './ProgressBar'
import { EstimatedTransferDuration } from '@/hooks/useTransfersEstimate'

interface TransferEstimateProps {
  transfer: StoredTransfer
  direction: Direction
  outlinedProgressBar: boolean
  estimatedTransferDuration: EstimatedTransferDuration
}

const TransferEstimate: FC<TransferEstimateProps> = ({
  transfer,
  direction,
  estimatedTransferDuration,
  outlinedProgressBar,
}) => {
  const progress = useTransferProgress(transfer, direction, estimatedTransferDuration)

  return <ProgressBar progress={progress} outlinedProgressBar={outlinedProgressBar} />
}

export default TransferEstimate
