export const headerButtons = [
  {
    label: 'Swap',
    icon: '',
  },
  {
    label: 'Bridging',
    icon: '',
  },
  {
    label: 'XCM Transfers',
    icon: '',
  },
  {
    label: 'Full Ecosystem Compatibility',
    icon: '',
  },
  {
    label: 'Customizable',
  },
]

export const features = [
  {
    title: 'Seamless Interactions',
    listItems: [
      'Bridging, XCM transfers, swaps — all from within your own product UI and focused on your use case',
      'Upcoming: fiat-to-crypto onramps, 1-click bridge & swaps, 1-click swaps within Polkadot, and more.',
    ],
  },
  {
    title: 'Customizable & Configurable',
    listItems: [
      'Match your brand with themes, layouts, and styling options.',
      'Define default tokens, chains, and flows to align with your use case.',
    ],
  },
  {
    title: 'Easy Integration',
    listItems: ['Drop-in React component', 'Minimal config'],
  },
  {
    title: 'Wide Ecosystem Support',
    listItems: ['Support across all major Polkadot parachains & Ethereum through Snowbridge'],
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
    return (
      <div className="flex h-screen w-screen items-center justify-center">
          <Widget />
      </div>
    )
  }
    
  export default Home`

export const developerIntegrationGuide = [
  {
    title: '1. Install',
    code: `pnpm install @velocitylabs-org/turtle-widget`,
    language: 'bash',
  },
  {
    title: '2. Import',
    code: code,
    language: 'typescript',
  },
]
