import { type TransferTabOptions, TxHistoryToggle } from '@velocitylabs-org/turtle-ui'
import { lazy, Suspense, useMemo, useState } from 'react'
import NotificationSystem from '@/components/NotificationSystem'
import SubstrateWalletModal from '@/components/SubstrateWalletModal'
import TransferForm from '@/components/Transfer'
import useCompletedTransfers from '@/hooks/useCompletedTransfers'
import { Providers } from '@/providers'
import { ConfigProvider, type ConfigRegistryType } from '@/providers/ConfigProviders'
import { useOngoingTransfersStore } from '@/stores/ongoingTransfersStore'
import { generateWidgetTheme, type WidgetTheme } from '@/utils/theme'
import HistoryLoaderSkeleton from './history/HistoryLoaderSkeleton'

const Widget = ({ theme, registry }: { theme?: WidgetTheme; registry?: ConfigRegistryType }) => {
  useMemo(() => generateWidgetTheme(theme), [theme])

  const ongoingTransfers = useOngoingTransfersStore(state => state.transfers)
  const { completedTransfers } = useCompletedTransfers()

  const [newTransferInit, setNewTransferInit] = useState<TransferTabOptions>('New')
  const isHistoryTabSelected = newTransferInit === 'History'

  const TransfersHistory = lazy(() => import('@/components/history/TransfersHistory'))

  return (
    <div className="turtle-wrapper">
      <Providers>
        <ConfigProvider registry={registry ?? { chains: [], tokens: [] }}>
          <div className="m-4 flex flex-col items-center justify-center p-6">
            <div className="relative">
              <TxHistoryToggle
                ongoingTransfers={ongoingTransfers}
                completedTransfers={completedTransfers}
                isHistoryTabSelected={isHistoryTabSelected}
                newTransferInit={newTransferInit}
                setNewTransferInit={setNewTransferInit}
              />
              {!isHistoryTabSelected ? (
                <TransferForm />
              ) : (
                <Suspense
                  fallback={
                    <HistoryLoaderSkeleton
                      length={ongoingTransfers.length + (completedTransfers ? completedTransfers.length : 0)}
                    />
                  }
                >
                  <TransfersHistory ongoingTransfers={ongoingTransfers} completedTransfers={completedTransfers ?? []} />
                </Suspense>
              )}
            </div>
            <NotificationSystem />
            <SubstrateWalletModal />
          </div>
        </ConfigProvider>
      </Providers>
    </div>
  )
}
export default Widget
