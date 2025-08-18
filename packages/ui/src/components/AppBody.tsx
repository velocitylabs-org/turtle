import { ArrowLeft, History } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'

type TransferTab = 'New' | 'History'
export type TransferTabOptions = TransferTab

export const AppBody = ({
  children,
  ongoingTransfers,
  completedTransfers,
  isHistoryTabSelected,
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
  isHistoryTabSelected: boolean
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
            <div className="animation-bounce relative cursor-pointer rounded-lg border border-turtle-foreground p-3 bg-turtle-background">
              {ongoingTransfers.length > 0 && !isHistoryTabSelected && (
                <div className="text-foreground absolute -left-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-turtle-secondary bg-turtle-background">
                  <span className="text-xs">{ongoingTransfers.length}</span>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-turtle-secondary-dark opacity-25" />
                </div>
              )}
              <div>{isHistoryTabSelected ? <ArrowLeft className="h-4 w-4" /> : <History className="h-4 w-4" />}</div>
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
