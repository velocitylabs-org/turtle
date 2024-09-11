import { FC } from 'react'

import { HomeComponentSelect } from '@/components/HomeComponentSelect'
import { TurtlesBackground } from '@/components/TurtlesBackground'
import { getEnvironment } from '@/context/snowbridge'
import { shouldUseTestnet } from '@/utils/env'
// WIP - TEST
import { getAhToParachainHistory, getNewAPI } from '@/utils/subscan'
import { Environment } from '@/store/environmentStore'
import { constructApiPromise } from '@substrate/asset-transfer-api'

const App: FC = async () => {
  const env = getEnvironment(shouldUseTestnet ? Environment.Testnet : Environment.Mainnet)
  // // const txHash = '0xcdefd199b2b88c8ae43130dd4e48d8a5d3407556edfa617dba259bd51505a588'
  // const txHash = '0x7989863a2b9cb1d8afba99e9e7dbac9e75d28f0693dd87bd70c01d39bf14ab66'
  // const txHash = '0x6b5f276a7581063adf9c0f421fe6ccbac7ca80cbbdd9c8ec01dd9f40f202f675'
  const txHash = "0xa42fd8668a51cddec85dca40d9cbb6e7c40424f32d8f99edc167c887a38c3d99"
  const data0 = await getAhToParachainHistory(env, txHash)
  console.log('AhToParachainHistory', data0)
  const data = await getNewAPI(env, txHash)
  console.log('AhAPI', data)

  // // new WsProvider(config.polkadot.url.bridgeHub),
  // // const { api, safeXcmVersion } = await constructApiPromise(
  // //   'wss://rococo-bridge-hub-rpc.polkadot.io',
  // // )
  // // let number 
  // // await api.rpc.chain.subscribeFinalizedHeads(async header => {
  // //   number = header.number.toNumber()
  // //   // const blockHash = await api.rpc.chain.getBlockHash(blockNumber)
  // //   // const signedBlock = await api.rpc.chain.getBlock(blockHash)
  // //   // const apiAt = await api.at(signedBlock.block.header.hash)
  // //   // const allRecords = (await apiAt.query.system.events()) as any

  // //   console.log(number)
  // // })


  return (
    <main>
      <TurtlesBackground />
      <section className="z-10 mt-10 flex flex-col items-center justify-center gap-8 sm:mt-6 sm:p-5">
        <HomeComponentSelect />
      </section>
    </main>
  )
}

export default App

// xcmdataFromUID {
//   message_hash: '0x60155d7fd0d1b1003d5f72a5527661a32dec194054a9fe8b40dc510cec3b5a06',
//   origin_event_index: '6129210-9',
//   from_account_id: 'fac081286e3cefdaa414d8d303d9fa826bdc0353fe044256556b7903d453c227',
//   origin_para_id: 1000,
//   origin_block_timestamp: 1725610704,
//   relayed_block_timestamp: 1725610722,
//   block_num: 12081252,
//   status: 'success',
//   relayed_event_index: '12081252-4',
//   dest_event_index: '4766302-14',
//   dest_para_id: 1013,
//   to_account_id: '0x79e9d02dbe43fb49fda9d03c9ea1eb601d2692c3',
//   confirm_block_timestamp: 1725610722,
//   extrinsic_index: '6129210-2',
//   relayed_extrinsic_index: '12081252-1',
//   dest_extrinsic_index: '4766302-0',
//   child_para_id: -1,
//   child_dest: '',
//   protocol: 'HRMP',
//   instructions: { V3: [ [Object], [Object], [Object], [Object], [Object] ] },
//   message_type: 'transfer',
//   unique_id: 'd411eb65cd05a5aeba9c26246a88fb5bd0cad9cf',
//   xcm_version: 3,
//   from_chain: 'rococo',
//   dest_chain: 'ethereum-sepolia',
//   metadata: {
//     send_at: 1725614424,
//     tx_hash: '0x7705b926a09706444df60371f5787ff3c1d2d8ee5b1f43c3a618f252e113edba',
//     message_id: '0x7723e5a916b89258ace4e8bcb831ca5b98bd0d3be3116a3e13bd1a56467962de'
//   },
//   cross_chain_status: 3,
//   bridge_type: 's2e',
//   assets: [
//     {
//       enum_key: 'Concrete',
//       asset_module: 'foreignAssets',
//       amount: '395820000000000000',
//       currency_amount: '0',
//       decimals: 18,
//       symbol: 'WETH',
//       raw: [Object],
//       network: 'ethereum-sepolia',
//       asset_unique_id: 'standard_foreign_assets/e32e4696dcdeae5481097aa3a5bd792bf5fe8118'
//     }
//   ]
// }

// xcmdataFromUID {
//   message_hash: '0x7423406898547d8319e6864361d825ab4319a84b039b58016c7ad4b6a5b68b82',
//   origin_event_index: '6186188-9',
//   from_account_id: 'fac081286e3cefdaa414d8d303d9fa826bdc0353fe044256556b7903d453c227',
//   origin_para_id: 1000,
//   origin_block_timestamp: 1725981288,
//   relayed_block_timestamp: 1725981300,
//   block_num: 12142336,
//   status: 'success',
//   relayed_event_index: '12142336-4',
//   dest_event_index: '4822186-9',
//   dest_para_id: 1013,
//   to_account_id: '0x1afb3aa8d0ad21ce0389bf180499a3dc8dce94be',
//   confirm_block_timestamp: 1725981300,
//   extrinsic_index: '6186188-2',
//   relayed_extrinsic_index: '12142336-1',
//   dest_extrinsic_index: '4822186-0',
//   child_para_id: -1,
//   child_dest: '',
//   protocol: 'HRMP',
//   instructions: { V3: [ [Object], [Object], [Object], [Object], [Object] ] },
//   message_type: 'transfer',
//   unique_id: '21202355ce3bc6185cce3c6722d9ca2117ab8d71',
//   xcm_version: 3,
//   from_chain: 'rococo',
//   dest_chain: 'ethereum-sepolia',
//   metadata: {},
//   cross_chain_status: 1,
//   bridge_type: 's2e',
//   assets: [
//     {
//       enum_key: 'Concrete',
//       asset_module: 'foreignAssets',
//       amount: '8999999999999999',
//       currency_amount: '0',
//       decimals: 18,
//       symbol: 'WETH',
//       raw: [Object],
//       network: 'ethereum-sepolia',
//       asset_unique_id: 'standard_foreign_assets/e32e4696dcdeae5481097aa3a5bd792bf5fe8118'
//     }
//   ]
// }