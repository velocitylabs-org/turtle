import useTransferProgress from '@/hooks/useTransferProgress'
import { StoredTransfer } from '@/models/transfer'
import { Direction } from '@/services/transfer'
import ProgressBar from './ProgressBar'

interface TransferEstimateProps {
  transfer: StoredTransfer
  direction: Direction
  outlinedProgressBar: boolean
}

export default function TransferEstimate({
  transfer,
  direction,
  outlinedProgressBar,
}: TransferEstimateProps) {
  const progress = useTransferProgress(transfer, direction)

  return <ProgressBar progress={progress} outlinedProgressBar={outlinedProgressBar} />
}
