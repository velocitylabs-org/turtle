import { Token } from '@/models/token'
import { FC } from 'react'

type State = 'Idle' | 'Loading' | 'Ready'

interface Props {
  state: State
  amount?: bigint
  token?: Token
}

const Dropdown: FC<Props> = ({ state, amount, token }) => {
  if (state === 'Idle') return null

  if (state === 'Loading')
    return (
      <div className="mt-4 flex h-[10rem] w-full items-center justify-center rounded-[8px] bg-turtle-level1">
        <i className="fas fa-sync-alt mr-3 animate-[spin_3s_infinite] text-3xl font-light text-turtle-level3"></i>
      </div>
    )
  // todo(nuno): handle no amount or token

  return (
    <div className="fees mt-2 p-4">
      <div className="border-t border-turtle-level2 py-4">
        <div className="text-center text-xl font-bold text-turtle-foreground">Fees</div>
        <div className="mt-4 flex items-center justify-between border-y border-turtle-level2 py-3">
          <div>
            <div className="text-turtle-foreground">
              {amount} {token?.symbol}
            </div>
            <div className="text-turtle-level3">$297.19</div>
          </div>
          <div className="flex items-center">
            <div className="text-green-900">~30 mins</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dropdown
