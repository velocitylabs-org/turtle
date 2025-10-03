import { AppBody, MeldWidget, TabSwitcherWrapper, type TransferTabOptions } from '@velocitylabs-org/turtle-ui'
import { useMemo, useState } from 'react'
import TransfersHistory from '@/components/history/TransfersHistory'
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
  meldApiKey = MELD_API_KEY,
}: {
  theme?: WidgetTheme
  registry?: ConfigRegistryType
  endpointUrl?: string
  meldApiKey?: string
}) => {
  useMemo(() => generateWidgetTheme(theme), [theme])

  const ongoingTransfers = useOngoingTransfersStore(state => state.transfers)
  const { completedTransfers } = useCompletedTransfers()
  const [selectedTab, setSelectedTab] = useState<TransferTabOptions>('New')

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
                    <TransfersHistory transfers={completedTransfers ?? []} />
                  )}
                </AppBody>
              }
              BuySellComponent={<MeldWidget apiKey={meldApiKey ?? ''} />}
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
