import { lazy, Suspense, useMemo, useState } from 'react'
import NotificationSystem from '@/components/NotificationSystem'
import SubstrateWalletModal from '@/components/SubstrateWalletModal'
import TransferForm from '@/components/Transfer'
import { Providers } from '@/providers'
import { ArrowLeft, History } from 'lucide-react'
import { useOngoingTransfersStore } from '@/stores/ongoingTransfersStore'
import useCompletedTransfers from '@/hooks/useCompletedTransfers'
import HistoryLoaderSkeleton from './history/HistoryLoaderSkeleton'
import { generateWidgetTheme, WidgetTheme } from '@/utils/theme'

export type TransferTab = 'New' | 'History'
export type TransferTabOptions = TransferTab

const Widget = ({ theme }: { theme?: WidgetTheme }) => {
  useMemo(() => generateWidgetTheme(theme), [theme])

  const ongoingTransfers = useOngoingTransfersStore(state => state.transfers)
  const { completedTransfers } = useCompletedTransfers()

  const [newTransferInit, setNewTransferInit] = useState<TransferTabOptions>('New')
  const isHistoryTabSelected = newTransferInit === 'History'

  const TransfersHistory = lazy(() => import('@/components/history/TransfersHistory'))

  return (
    <div className="turtle-wrapper">
      <Providers>
        <div className="m-4 flex flex-col items-center justify-center p-6">
          <div className="relative">
            {(ongoingTransfers.length > 0 ||
              (completedTransfers && completedTransfers.length > 0)) && (
              <div
                className="absolute -top-5 right-8 z-30 max-w-[90vw] rounded-lg bg-turtle-background"
                onClick={() => setNewTransferInit(newTransferInit === 'New' ? 'History' : 'New')}
              >
                <div className="animation-bounce relative m-1 cursor-pointer rounded-lg border p-3">
                  {ongoingTransfers.length > 0 && !isHistoryTabSelected && (
                    <div className="text-foreground absolute -left-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-turtle-secondary bg-turtle-background">
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
            )}
            {!isHistoryTabSelected ? (
              <TransferForm />
            ) : (
              <Suspense
                fallback={
                  <HistoryLoaderSkeleton
                    length={
                      ongoingTransfers.length + (completedTransfers ? completedTransfers.length : 0)
                    }
                  />
                }
              >
                <TransfersHistory
                  ongoingTransfers={ongoingTransfers}
                  completedTransfers={completedTransfers ?? []}
                />
              </Suspense>
            )}
          </div>
          <NotificationSystem />
          <SubstrateWalletModal />
        </div>
      </Providers>
    </div>
  )
}
export default Widget
