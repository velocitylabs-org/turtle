import { Ban, CheckCircle, CircleHelp, RefreshCcw } from 'lucide-react'
import { TxStatus } from '@/models/Transaction'

interface TransactionStatusIndicatorProps {
  status: TxStatus
  logoOnly?: boolean
}

export function TransactionStatusIndicator({
  status,
  logoOnly = false,
}: TransactionStatusIndicatorProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
      case 'failed':
        return <Ban className="mr-1 h-4 w-4 text-red-500" />
      case 'undefined':
        return <CircleHelp className="mr-1 h-4 w-4 text-yellow-500" />
      case 'ongoing':
        return <RefreshCcw className="mr-1 h-4 w-4 animate-spin text-blue-500" />
      default:
        return null
    }
  }

  if (logoOnly) {
    return getStatusIcon()
  }

  return (
    <div className="flex flex-col items-center">
      {getStatusIcon()}
      <span className="text-xs capitalize">{status}</span>
    </div>
  )
}
