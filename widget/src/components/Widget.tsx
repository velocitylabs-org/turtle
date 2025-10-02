import {
  AppBody,
  HistoryLoaderSkeleton,
  MeldWidget,
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
import { useOngoingTransfersStore } from '@/store/ongoingTransfersStore'
import { MELD_API_KEY } from '@/utils/consts'
import { generateWidgetTheme, type WidgetTheme } from '@/utils/theme'

const Widget = ({
  theme,
  registry,
  endpointUrl = 'https://app.turtle.cool/',
}: {
  theme?: WidgetTheme
  registry?: ConfigRegistryType
  endpointUrl?: string
}) => {
  useMemo(() => generateWidgetTheme(theme), [theme])

  const ongoingTransfers = useOngoingTransfersStore(state => state.transfers)
  const { completedTransfers } = useCompletedTransfers()

  const [selectedTab, setSelectedTab] = useState<TransferTabOptions>('New')

  const TransfersHistory = lazy(() => import('@/components/history/TransfersHistory'))

  return (
    <div className="turtle-wrapper">
      <Providers>
        <ConfigProvider registry={registry ?? { chains: [], tokens: [] }} endpointUrl={endpointUrl}>
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
                      <TransfersHistory transfers={completedTransfers ?? []} />
                    </Suspense>
                  )}
                </AppBody>
              }
              BuySellComponent={<MeldWidget apiKey={MELD_API_KEY ?? ''} />}
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
