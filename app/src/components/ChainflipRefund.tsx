import ExclamationIcon from '@velocitylabs-org/turtle-assets/icons/exclamation-circle.svg'
import InfoIcon from '@velocitylabs-org/turtle-assets/icons/info.svg'
import type { Chain, Token } from '@velocitylabs-org/turtle-registry'
import { cn } from '@velocitylabs-org/turtle-ui'
import Image from 'next/image'
import { ChainflipRefundStatus, isChainflipSwap } from '@/utils/chainflip'

interface ChainflipRefundProps {
  isSwap?: boolean | null
  swapParams?: {
    sourceChain: Chain
    destinationChain: Chain
    sourceToken: Token
    destinationToken: Token
  } | null
  swapCompleted?: boolean | null
  swapRefundError?: string | null
  className?: string
}

export default function ChainflipRefund({
  isSwap,
  swapParams,
  swapRefundError,
  swapCompleted,
  className,
}: ChainflipRefundProps) {
  // Not a chainflip swap
  if (!isSwap && !swapParams) return null
  // Swap completed without refund
  if (swapCompleted && !swapRefundError) return null

  const refundMessage = (swapCompleted?: boolean | null, swapRefundError?: string | null): string | null => {
    // Info message to ongoing swaps
    if (!swapCompleted) return 'Refunds will be sent back to your origin account.'
    // Swap completed with a partial refund
    if (swapRefundError === ChainflipRefundStatus.Partially) return 'Swap partially refunded to your origin account.'
    // Swap completed with a full refund
    return 'Swap refunded to your origin account.'
  }

  if (
    isSwap ||
    (swapParams &&
      isChainflipSwap(
        swapParams.sourceChain,
        swapParams.destinationChain,
        swapParams.sourceToken,
        swapParams.destinationToken,
      ))
  ) {
    return (
      <div className={cn('flex justify-center items-center gap-1', className)}>
        <Image src={swapCompleted ? ExclamationIcon : InfoIcon} alt={'Refund warning'} width={16} height={16} />
        <span className="text-xs">{refundMessage(swapCompleted, swapRefundError)}</span>
      </div>
    )
  }
}
