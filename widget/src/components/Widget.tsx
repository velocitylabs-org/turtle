import NotificationSystem from '@/components/NotificationSystem'
import SubstrateWalletModal from '@/components/SubstrateWalletModal'
import Transfer from '@/components/Transfer'
import { Providers } from '@/providers'
import { ArrowLeft, History } from 'lucide-react'
import { useState } from 'react'
import OngoingTransfers from './history/ongoing-transfers/OngoingTransfers'
import { useOngoingTransfersStore } from '@/stores/ongoingTransfersStore'

export interface WidgetProps {
  title?: string
}

export type TransferTab = 'New' | 'History'
export type TransferTabOptions = TransferTab

export const Widget: React.FC<WidgetProps> = () => {
  const ongoingTransfers = useOngoingTransfersStore(state => state.transfers)
  const [newTransferInit, setNewTransferInit] = useState<TransferTabOptions>('New')
  const isHistoryTabSelected = newTransferInit === 'History'
  return (
    <Providers>
      <div className="m-4 flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div
            className="z-15 max-w-[90vw absolute -top-4 right-8 bg-white"
            onClick={() => setNewTransferInit(newTransferInit === 'New' ? 'History' : 'New')}
          >
            <div className="animation-bounce relative mx-1 cursor-pointer rounded-lg border p-3">
              {ongoingTransfers.length > 0 && !isHistoryTabSelected && (
                <div className="absolute -left-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-turtle-secondary bg-background text-foreground">
                  <span className="text-xs">{ongoingTransfers.length}</span>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-turtle-secondary-dark opacity-25" />
                </div>
              )}
              <div>
                {isHistoryTabSelected ? (
                  <ArrowLeft className="h-4 w-4" />
                ) : (
                  <History className="h-4 w-4" />
                )}
              </div>
            </div>
          </div>
          {!isHistoryTabSelected ? (
            <Transfer />
          ) : (
            <OngoingTransfers ongoingTransfers={ongoingTransfers} />
          )}
        </div>
        <NotificationSystem />
        <SubstrateWalletModal />
      </div>
    </Providers>
  )
}
