import { FC } from 'react'
import useTransferProgress from '@/hooks/useTransferProgress'
import { StoredTransfer } from '@/models/transfer'
import { Direction } from '@/services/transfer'
import ProgressBar from './ProgressBar'

interface TransferEstimateProps {
  transfer: StoredTransfer
  direction: Direction
  outlinedProgressBar: boolean
}

const TransferEstimate: FC<TransferEstimateProps> = ({
  transfer,
  direction,
  outlinedProgressBar,
}) => {
  const progress = useTransferProgress(transfer, direction)

  return <ProgressBar progress={progress} outlinedProgressBar={outlinedProgressBar} />
}

export default TransferEstimate
