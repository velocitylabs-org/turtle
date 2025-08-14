import { ArrowLeft, History } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'

type TransferTab = 'New' | 'History'
export type TransferTabOptions = TransferTab

export const FormContainer = ({
  children,
  ongoingTransfers,
  completedTransfers,
  isHistoryTabSelected,
  newTransferInit,
  setNewTransferInit,
}: {
  children: React.ReactNode
  // TODO: replace with Transfer Type when moving the Types to turtle-core
  // biome-ignore lint/suspicious/noExplicitAny: any
  ongoingTransfers?: any[]
  // TODO: replace with Transfer Type when moving the Types to turtle-core
  // biome-ignore lint/suspicious/noExplicitAny: any
  completedTransfers?: any[]
  isHistoryTabSelected: boolean
  newTransferInit: string
  setNewTransferInit: Dispatch<SetStateAction<TransferTab>>
}) => {
  const onClick = () => {
    setNewTransferInit(newTransferInit === 'New' ? 'History' : 'New')
  }

  return (
    <div className="m-4 flex flex-col items-center justify-center p-6">
      <div className="relative">
        {(ongoingTransfers.length > 0 || completedTransfers?.length > 0) && (
          <div className="absolute -top-5 right-8 z-30 rounded-lg bg-turtle-background" onClick={onClick}>
            <div className="animation-bounce relative m-1 cursor-pointer rounded-lg border border-turtle-foreground p-3">
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
