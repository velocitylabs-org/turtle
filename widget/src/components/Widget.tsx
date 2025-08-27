import {
  AppBody,
  HistoryLoaderSkeleton,
  TabSwitcherWrapper,
  type TransferTabOptions,
} from '@velocitylabs-org/turtle-ui'
import { lazy, Suspense, useMemo, useState } from 'react'
import NotificationSystem from '@/components/NotificationSystem'
import SubstrateWalletModal from '@/components/SubstrateWalletModal'
import TransferForm from '@/components/Transfer'
import useCompletedTransfers from '@/hooks/useCompletedTransfers'
import { Providers } from '@/providers'
import { ConfigProvider, type ConfigRegistryType } from '@/providers/ConfigProviders'
import { useOngoingTransfersStore } from '@/stores/ongoingTransfersStore'
import { generateWidgetTheme, type WidgetTheme } from '@/utils/theme'

const Widget = ({ theme, registry }: { theme?: WidgetTheme; registry?: ConfigRegistryType }) => {
  useMemo(() => generateWidgetTheme(theme), [theme])

  const ongoingTransfers = useOngoingTransfersStore(state => state.transfers)
  const { completedTransfers } = useCompletedTransfers()

  const [selectedTab, setSelectedTab] = useState<TransferTabOptions>('New')

  const TransfersHistory = lazy(() => import('@/components/history/TransfersHistory'))

  return (
    <div className="turtle-wrapper">
      <Providers>
        <ConfigProvider registry={registry ?? { chains: [], tokens: [] }}>
          <div className="flex flex-col items-center justify-center">
            <TabSwitcherWrapper
              TransferComponent={
                <AppBody
                  ongoingTransfers={ongoingTransfers}
                  completedTransfers={completedTransfers}
                  selectedTab={selectedTab}
                  setSelectedTab={setSelectedTab}
                >
                  {selectedTab !== 'History' ? (
                    <TransferForm />
                  ) : (
                    <Suspense fallback={<HistoryLoaderSkeleton length={5} />}>
                      <TransfersHistory
                        ongoingTransfers={ongoingTransfers}
                        completedTransfers={completedTransfers ?? []}
                      />
                    </Suspense>
                  )}
                </AppBody>
              }
              BuySellComponent={<div>Buy/Sell</div>}
            />
            <NotificationSystem />
            <SubstrateWalletModal />
          </div>
        </ConfigProvider>
      </Providers>
    </div>
  )
}
export default Widget
