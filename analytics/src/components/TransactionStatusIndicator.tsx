import { Ban, CheckCircle, CircleHelp } from 'lucide-react'
import { TxStatus } from '@/models/Transaction'

interface TransactionStatusIndicatorProps {
  status: TxStatus
}

export function TransactionStatusIndicator({ status }: TransactionStatusIndicatorProps) {
  switch (status) {
    case 'succeeded':
      return (
        <div className="flex flex-col items-center">
          <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
          <span className="text-xs capitalize">{status}</span>
        </div>
      )
    case 'failed':
      return (
        <div className="flex flex-col items-center">
          <Ban className="mr-1 h-4 w-4 text-red-500" />
          <span className="text-xs capitalize">{status}</span>
        </div>
      )
    case 'undefined':
      return (
        <div className="flex flex-col items-center">
          <CircleHelp className="mr-1 h-4 w-4 text-yellow-500" />
          <span className="text-xs capitalize">{status}</span>
        </div>
      )
    default:
      return null
  }
}
