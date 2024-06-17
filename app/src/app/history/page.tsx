'use client'
import { getContext, getEnvironment } from '@/context/snowbridge'
import useCompletedTransfers from '@/hooks/useCompletedTransfers'
import { Environment } from '@/store/environmentStore'
import { Context, environment, history, subscan } from '@snowbridge/api'

export default function History() {
  // const evmWallet = useEvmWallet()
  // const { substrateAccount, setSubstrateAccount } = useSubstrateWallet()

  // const snowbridgeEnv = getEnvironment(Environment.Testnet)
  // const context = await getContext(snowbridgeEnv)
  // console.log("sub", snowbridgeEnv.config.SUBSCAN_API?.ASSET_HUB_URL)

  // console.log(await fetchCompletedTransfers())

  // const { completedTransfers, loading, error } = useCompletedTransfers("0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE")
  // console.log('completedTransfers', completedTransfers)
  // console.log('loading', loading)
  // console.log('error', error)

  const EXPLORERS: { [env: string]: { [explorer: string]: string } } = {
    rococo_sepolia: {
      etherscan: 'https://sepolia.etherscan.io/',
      subscan_ah: 'https://assethub-rococo.subscan.io/',
      subscan_bh: 'https://bridgehub-rococo.subscan.io/',
    },
    polkadot_mainnet: {
      etherscan: 'https://etherscan.io/',
      subscan_ah: 'https://assethub-polkadot.subscan.io/',
      subscan_bh: 'https://bridgehub-polkadot.subscan.io/',
    },
  }

  return <h1>History</h1>
}
