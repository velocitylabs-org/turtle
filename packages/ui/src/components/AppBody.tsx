import { ArrowLeft } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import HistoryIcon from './HistoryIcon'

type TransferTab = 'New' | 'History'
export type TransferTabOptions = TransferTab

export const AppBody = ({
  children,
  ongoingTransfers,
  completedTransfers,
  selectedTab,
  setSelectedTab,
}: {
  children: React.ReactNode
  // TODO: replace with Transfer Type when moving the Types to turtle-core
  // biome-ignore lint/suspicious/noExplicitAny: any
  ongoingTransfers?: any[]
  // TODO: replace with Transfer Type when moving the Types to turtle-core
  // biome-ignore lint/suspicious/noExplicitAny: any
  completedTransfers?: any[]
  selectedTab: string
  setSelectedTab: Dispatch<SetStateAction<TransferTab>>
}) => {
  const onClick = () => {
    setSelectedTab(selectedTab === 'New' ? 'History' : 'New')
  }

  return (
    <div className="flex flex-col">
      <div className="relative">
        {(ongoingTransfers.length > 0 || completedTransfers?.length > 0) && (
          <div className="absolute -top-5 right-10 z-30 rounded-lg" onClick={onClick}>
            <div className="relative cursor-pointer rounded-lg border border-turtle-foreground p-3 bg-turtle-background">
              {ongoingTransfers.length > 0 && selectedTab !== 'History' && (
                <div className="absolute -right-1 -top-1 flex h-[12px] w-[12px] rounded-full bg-turtle-primary animate-ping" />
              )}
              <div>{selectedTab === 'History' ? <ArrowLeft className="h-4 w-4" /> : <HistoryIcon />}</div>
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
