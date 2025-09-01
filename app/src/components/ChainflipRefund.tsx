import ExclamationIcon from '@velocitylabs-org/turtle-assets/icons/exclamation-circle.svg'
import type { Chain, Token } from '@velocitylabs-org/turtle-registry'
import { cn } from '@velocitylabs-org/turtle-ui'
import Image from 'next/image'
import { isChainflipSwap } from '@/utils/chainflip'

interface ChainflipRefundProps {
  isChainflipCheck?: boolean | null
  swapParams?: {
    sourceChain: Chain
    destinationChain: Chain
    sourceToken: Token
    destinationToken: Token
  } | null
  className?: string
}

export default function ChainflipRefund({ isChainflipCheck, swapParams, className }: ChainflipRefundProps) {
  if (!isChainflipCheck && !swapParams) return null

  if (
    isChainflipCheck ||
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
        <Image src={ExclamationIcon} alt={'Refund warning'} width={16} height={16} />
        <span className="text-xs">Any refund will be sent back to your origin account.</span>
      </div>
    )
  }
}
