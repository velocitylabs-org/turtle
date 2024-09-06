import { cn } from '@/utils/cn'
import { Swap } from './svg/Swap'

export const SwapChains = ({
  handleChainChange,
  disabled,
}: {
  disabled: boolean
  handleChainChange: () => void
}) => {
  return (
    <div
      onClick={() => !disabled && handleChainChange()}
      className={cn(
        '-my-4 mx-auto flex select-none items-center justify-center space-x-0.5 p-2 text-turtle-level6',
        disabled ? 'cursor-default opacity-40' : 'cursor-pointer opacity-100',
      )}
    >
      <Swap />
      <p className="text-sm ">Swap From and To</p>
    </div>
  )
}
