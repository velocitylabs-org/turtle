import { Swap } from './svg/Swap'
import { cn } from '@/utils/cn'

export const SwapChains = ({
  disabled,
  handleChainChange,
  isTransferOngoing,
}: {
  disabled: boolean
  handleChainChange: () => void
  isTransferOngoing: boolean
}) => {
  return (
    <div
      onClick={() => !disabled && handleChainChange()}
      className={cn(
        '-my-4 mx-auto flex  items-center justify-center space-x-0.5 p-2 text-turtle-level6',
        disabled
          ? isTransferOngoing
            ? 'cursor-default opacity-40'
            : 'cursor-not-allowed opacity-40'
          : 'cursor-pointer opacity-100',
      )}
    >
      <Swap />
      <p className="text-sm ">Swap From and To</p>
    </div>
  )
}
