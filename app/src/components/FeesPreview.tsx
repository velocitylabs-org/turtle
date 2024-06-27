import { Fees } from '@/models/transfer'
import { feeToHuman } from '@/utils/transfer'
import { FC } from 'react'

export interface Loading {
  type: 'Loading'
}
export interface Ready {
  type: 'Ready'
  fees: Fees
}
type State = Loading | Ready

const Dropdown: FC<{ state: State }> = ({ state }) => {
  if (state.type === 'Loading')
    return (
      <div className="mt-4 flex h-[10rem] w-full items-center justify-center rounded-[8px] bg-turtle-level1">
        <i className="fas fa-sync-alt mr-3 animate-[spin_3s_infinite] text-3xl font-light text-turtle-level3"></i>
      </div>
    )

  return (
    <div className="fees mt-2 p-4">
      <div className="border-t border-turtle-level2 py-4">
        <div className="text-center text-xl font-bold text-turtle-foreground">Fees</div>
        <div className="mt-4 flex items-center justify-between border-y border-turtle-level2 py-3">
          <div>
            <div className="text-turtle-foreground">
              {feeToHuman(state.fees)} {state.fees.token.symbol}
            </div>
            {/* todo(nuno) */}
            {/* <div className="text-turtle-level3">${state.fees.inDollars}</div> */}
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
