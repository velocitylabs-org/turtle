import useTransferProgress from '@/hooks/useTransferProgress'
import type { StoredTransfer } from '@/models/transfer'
import type { Direction } from '@/services/transfer'
import ProgressBar from './ProgressBar'

interface TransferEstimateProps {
  transfer: StoredTransfer
  direction: Direction
  outlinedProgressBar: boolean
}

export default function TransferEstimate({ transfer, direction, outlinedProgressBar }: TransferEstimateProps) {
  const progress = useTransferProgress(transfer, direction)

  return <ProgressBar progress={transfer.progress ?? progress} outlinedProgressBar={outlinedProgressBar} />
}
