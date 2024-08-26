import { Swap } from './svg/Swap'
import { cn } from '@/utils/cn'
import { colors } from '../../tailwind.config'

export const SwapChains = ({
  swapAllowed,
  handleChainChange,
}: {
  swapAllowed: boolean
  handleChainChange: () => void
}) => {
  return (
    <div
      onClick={swapAllowed ? handleChainChange : undefined}
      className={cn(
        '-my-4 mx-auto flex  items-center justify-center space-x-0.5 p-2',
        swapAllowed ? 'cursor-pointer text-turtle-level6' : 'cursor-not-allowed text-turtle-level3',
      )}
    >
      <Swap fill={swapAllowed ? colors['turtle-level6'] : colors['turtle-level3']} />
      <p className="text-sm ">Swap From and To</p>
    </div>
  )
}
