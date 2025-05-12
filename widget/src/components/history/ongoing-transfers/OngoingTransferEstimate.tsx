import { FC } from 'react'
import ProgressBar from '@/components/ProgressBar'
import useTransferProgress from '@/hooks/useTransferProgress'
import { StoredTransfer } from '@/models/transfer'
import { Direction } from '@/utils/transfer'

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

  return (
    <ProgressBar
      progress={transfer.progress ?? progress}
      outlinedProgressBar={outlinedProgressBar}
    />
  )
}

export default TransferEstimate
