import CheckIcon from '@velocitylabs-org/turtle-assets/icons/check.svg'
import CustomizeIcon from '@velocitylabs-org/turtle-assets/icons/customize.svg'
import SwapIcon from '@velocitylabs-org/turtle-assets/icons/swap.svg'
import ThunderIcon from '@velocitylabs-org/turtle-assets/icons/thunder.svg'
import TransferIcon from '@velocitylabs-org/turtle-assets/icons/transfer.svg'

export const headerButtons = [
  {
    label: 'Swap',
    icon: SwapIcon,
  },
  {
    label: 'Bridging',
    icon: ThunderIcon,
  },
  {
    label: 'XCM Transfers',
    icon: TransferIcon,
  },
  {
    label: 'Full Ecosystem Compatibility',
    icon: CheckIcon,
  },
  {
    label: 'Customizable',
    icon: CustomizeIcon,
  },
]

export const features = [
  {
    title: 'Seamless Interactions',
    listItems: [
      'Bridging, XCM transfers, swaps — all from within your own product UI and focused on your use case',
      'Upcoming: Fiat onramps, Native X-Chain Swaps from Ethereum, Arbitrum and Solana',
    ],
  },
  {
    title: 'Customizable & Configurable',
    listItems: [
      'Match your brand with themes, layouts, and styling options',
      'Define default tokens, chains, and flows to align with your use case',
    ],
  },
  {
    title: 'Easy Integration',
    listItems: ['Drop-in React component', 'Minimal config'],
  },
  {
    title: 'Wide Ecosystem Support',
    listItems: ['Native support for all major Polkadot parachains and Ethereum. Powered by ParaSpell and Snowbridge'],
  },
  {
    title: 'Data Dashboard',
    listItems: [
      'Track all the relevant data in real time for your widget (i.e. volumes, # of transfers, tokens, origin/destination chains and more)',
    ],
  },
]

const code = `
  import Widget from '@velocitylabs-org/turtle-widget'

  function Home() {
    const theme = {
      primary: '#DBB3B1', // HexColor
      dialogOverlayRgb: '219, 179, 177', // RGBColor
      dialogOverlayOpacity: 0.5 // number
    } satisfies WidgetTheme

    const registry = {
      chains: ['polkadot', 'hydration'],
      tokens: ['dot', 'usdc', 'usdt']
    } satisfies ConfigRegistryType


    return (
      <div className="">
          <Widget theme={theme} registry={registry} />
      </div>
    )
  }
    
  export default Home`

export const developerIntegrationGuide: {
  title: string
  code?: string
  language?: string
  description?: string
}[] = [
  {
    title: '1. Install',
    code: `  pnpm install @velocitylabs-org/turtle-widget`,
    language: 'bash',
  },
  {
    title: '2. Import',
    code: code,
    language: 'typescript',
  },
  {
    title: '3. Test',
    description: 'Run the widget, for more information on how to setup the widget, see the documentation.',
  },
]
