import { cn } from '@/lib/utils'
import { Swap } from '@/assets/svg/Swap'

export const SwapChains = ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => {
  return (
    <div
      onClick={() => !disabled && onClick()}
      className={cn(
        '-my-4 mx-auto flex select-none items-center justify-center space-x-0.5 p-2 text-turtle-level6',
        disabled ? 'cursor-default opacity-40' : 'cursor-pointer opacity-100',
      )}
    >
      <Swap />
      <p className="text-sm">Switch From and To</p>
    </div>
  )
}
