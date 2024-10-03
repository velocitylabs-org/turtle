import { subscan, environment } from '@snowbridge/api'
import { TransferStatus } from '@snowbridge/api/dist/history'
import { SubscanXCMTransferRawResponse, SubscanXCMTransferResult } from '@/models/subscan'
import { OngoingTransferWithDirection } from '@/models/transfer'

export const trackFromParachainTx = async (
  env: environment.SnowbridgeEnvironment,
  ongoingTransfers: OngoingTransferWithDirection[],
) => {
  try {
    const xcmTransfers: SubscanXCMTransferResult[] = []
    if (!env.config.SUBSCAN_API) {
      console.warn(`No subscan api urls configured for ${env.name}`)
      return xcmTransfers
    }
    const subscanKey = process.env.NEXT_PUBLIC_SUBSCAN_KEY
    if (!subscanKey) {
      throw Error('Missing Subscan Key')
    }
    const relaychain = subscan.createApi(env.config.SUBSCAN_API.RELAY_CHAIN_URL, subscanKey)

    for (const transfer of ongoingTransfers) {
      const { crossChainMessageHash } = transfer
      if (!crossChainMessageHash) {
        console.log('Cross chain message undefined')
        // Should not return an error as we want to continue looping to the others transfers
        return xcmTransfers
      }

      const query = await relaychain.post('api/scan/xcm/list', {
        message_hash: crossChainMessageHash,
        row: 10,
      })
      if (query.status !== 200) {
        console.log('Subscan API request failed')
        // Should not return an error as we want to continue looping to the others transfers
        return xcmTransfers
      }

      const transferData: SubscanXCMTransferRawResponse[] = query.json?.data?.list ?? []
      if (!transferData.length || !transferData[0]) {
        console.log(`No XCM transfer data found for message hash ${crossChainMessageHash}`)
        // Should not return an error as we want to continue looping to the others transfers
        return xcmTransfers
      }

      let xchainTransferStatus: number = 1
      switch (transferData[0].cross_chain_status) {
        case 1:
          xchainTransferStatus = TransferStatus.Pending
          break
        case 2:
          xchainTransferStatus = TransferStatus.Failed
          break
        case 3:
          xchainTransferStatus = TransferStatus.Complete
          break
        default:
          break
      }

      xcmTransfers.push({
        messageHash: transferData[0].message_hash,
        originEventIndex: transferData[0].origin_event_index,
        fromAccountId: transferData[0].from_account_id,
        originParaId: transferData[0].origin_para_id,
        originBlockTimestamp: transferData[0].origin_block_timestamp,
        relayedBlockTimestamp: transferData[0].relayed_block_timestamp,
        blockNum: transferData[0].block_num,
        extrinsicStatus: transferData[0].status,
        relayedEventIndex: transferData[0].relayed_event_index,
        destEventIndex: transferData[0].dest_event_index,
        destParaId: transferData[0].dest_para_id,
        toAccountId: transferData[0].to_account_id,
        confirmBlockTimestamp: transferData[0].confirm_block_timestamp,
        extrinsicIndex: transferData[0].extrinsic_index,
        relayedExtrinsicIndex: transferData[0].relayed_extrinsic_index,
        destExtrinsicIndex: transferData[0].dest_extrinsic_index,
        uniqueId: transferData[0].unique_id,
        metadata: {
          ...(transferData[0].metadata.send_at && { sendAt: transferData[0].metadata.send_at }),
          ...(transferData[0].metadata.tx_hash && { txHash: transferData[0].metadata.tx_hash }),
          ...(transferData[0].metadata.message_id && {
            messageId: transferData[0].metadata.message_id,
          }),
        },
        status: xchainTransferStatus,
      })
    }

    return xcmTransfers
  } catch (error) {
    console.error(`Subscan XCM transfers tracking error:`, error)
    return []
  }
}

// LEGACY CODE BELOW
// TO KEEP UNTIL FURTHER NOTICE

// import { AlchemyProvider } from 'ethers'
// import { blake2AsU8a, keccak256AsU8a } from '@polkadot/util-crypto'
// import { bnToU8a, hexToU8a, stringToU8a, u8aToHex } from '@polkadot/util'
// import { environment, subscan } from '@snowbridge/api'
// import {
//   IGateway,
//   IGateway__factory,
//   // BeefyClient,
//   // BeefyClient__factory,
// } from '@snowbridge/contract-types'
// import {
//   SubscanExtrinsicEvent,
//   SubscanParams,
//   SubscanEvent,
//   ParachainToETHTransferResult,
//   SubscanXCMTransferRawResponse,
//   SubscanXCMTransferResult,
// } from '@/models/subscan'

// import { ETHEREUM_BLOCK_TIME_SECONDS, HISTORY_IN_SECONDS } from './snowbridge'
// import { OngoingTransferWithDirection } from '@/models/transfer'
// import { TransferStatus } from '@snowbridge/api/dist/history'

// export const forwardedTopicId = (messageId: string): string => {
//   const typeEncoded = stringToU8a('forward_id_for')
//   const paraIdEncoded = hexToU8a(messageId)
//   const joined = new Uint8Array([...typeEncoded, ...paraIdEncoded])
//   const newTopicId = blake2AsU8a(joined, 256)
//   return u8aToHex(newTopicId)
// }

// export const paraIdToChannelId = (paraId: number): string => {
//   const typeEncoded = stringToU8a('para')
//   const paraIdEncoded = bnToU8a(paraId, { bitLength: 32, isLe: false })
//   const joined = new Uint8Array([...typeEncoded, ...paraIdEncoded])
//   const channelId = keccak256AsU8a(joined)
//   return u8aToHex(channelId)
// }

// export async function getAHTransferFromHash(
//   hash: string,
//   assetHubScan: subscan.SubscanApi,
//   relaychainScan: subscan.SubscanApi,
//   // ethChainId: number,
// ) {
//   const subscanExtrinsicFetch = await assetHubScan.post('api/scan/extrinsic', {
//     hash,
//     only_extrinsic_event: true,
//   })
//   if (!subscanExtrinsicFetch?.json?.data) return null

//   const {
//     event,
//     block_hash,
//     account_id,
//     block_timestamp,
//     // params,
//     block_num,
//     extrinsic_index,
//     extrinsic_hash,
//   } = subscanExtrinsicFetch.json.data

//   const xcmSentEvent = event.find(
//     (e: SubscanExtrinsicEvent) => e.module_id === 'polkadotxcm' && e.event_id === 'Sent',
//   )
//   const extrinsicSuccess = event.some(
//     (e: SubscanExtrinsicEvent) => e.module_id === 'system' && e.event_id === 'ExtrinsicSuccess',
//   )

//   let messageId: string | null = null
//   let bridgeHubMessageId: string | null = null

//   if (extrinsicSuccess && xcmSentEvent) {
//     const event = JSON.parse(xcmSentEvent.params)
//     messageId = event.find((p: SubscanParams) => p.name === 'message_id')?.value ?? null
//     if (messageId) {
//       bridgeHubMessageId = forwardedTopicId(messageId)
//     }
//   }

//   const {
//     json: { data: relayBlock },
//   } = await relaychainScan.post('api/scan/block', {
//     block_timestamp: block_timestamp,
//     only_head: true,
//   })

//   // const beneficiary = params.find((p: any) => p.name == 'beneficiary')?.value
//   // const beneficiaryParents: number | null =
//   //   beneficiary.V3?.parents ?? beneficiary.V4?.parents ?? null
//   // const beneficiaryAddress: string | null =
//   //   beneficiary.V3?.interior?.X1?.AccountKey20?.key ??
//   //   (beneficiary.V4?.interior?.X1 && beneficiary.V4?.interior?.X1[0])?.AccountKey20?.key ??
//   //   null

//   // if (!(beneficiaryParents === 0 && beneficiaryAddress !== null)) return null

//   // const assets = params.find((p: any) => p.name == 'assets')?.value

//   // let amount: string | null = null
//   // let tokenParents: number | null = null
//   // let tokenAddress: string | null = null
//   // let tokenChainId: number | null = null
//   // for (const asset of assets.V3 ?? assets.V4 ?? []) {
//   //   amount = asset.fun?.Fungible ?? null
//   //   if (amount === null) continue

//   //   tokenParents = asset.id?.parents ?? asset.id?.Concrete?.parents ?? null
//   //   if (tokenParents === null) continue

//   //   const tokenX2 = asset.id?.interior?.X2 ?? Object.values(asset.id?.Concrete?.interior?.X2 ?? {})
//   //   if (tokenX2 === null || tokenX2.length !== 2) continue

//   //   tokenChainId = tokenX2[0].GlobalConsensus?.Ethereum ?? null
//   //   if (tokenChainId === null) continue

//   //   tokenAddress = tokenX2[1].AccountKey20?.key ?? null
//   //   if (tokenAddress === null) continue

//   //   break
//   // }

//   // if (
//   //   !(tokenParents === 2 && tokenChainId === ethChainId && tokenAddress !== null && amount !== null)
//   // )
//   //   return null

//   return {
//     status: subscanExtrinsicFetch.status,
//     statusText: subscanExtrinsicFetch.statusText,
//     data: {
//       events: event,
//       messageId,
//       bridgeHubMessageId,
//       success: extrinsicSuccess,
//       block_hash,
//       account_id,
//       relayChain: { block_num: relayBlock.block_num, block_hash: relayBlock.hash },
//       block_timestamp,
//       block_num,
//       extrinsic_index,
//       extrinsic_hash,
//       // tokenAddress,
//       // beneficiaryAddress,
//       // amount,
//     },
//   }
// }

// export async function getBHMessageQueueProccessed(
//   bridgeHubScan: subscan.SubscanApi,
//   assetHubTransferTimestamp: number,
// ) {
//   const eventIds = ['Processed', 'ProcessingFailed', 'OverweightEnqueued']

//   const fromBridgeHubBlock = await subscan.fetchBlockNearTimestamp(
//     bridgeHubScan,
//     assetHubTransferTimestamp,
//   )

//   const events = []
//   let page = 0
//   let keepFetching = true

//   while (keepFetching) {
//     const eventsBody = {
//       module: 'messagequeue',
//       block_range: `${fromBridgeHubBlock.block_num}-${fromBridgeHubBlock.block_num + 50}`, // Arbitrary decision to hardcode +50 blocks corresponding to 5 mins
//       event_id: eventIds[0],
//       row: 100,
//       page,
//     }
//     const eventsQuery = await bridgeHubScan.post('api/v2/scan/events', eventsBody)
//     const subscanEvents = eventsQuery?.json?.data?.events ?? []
//     if (!subscanEvents.length) {
//       keepFetching = false
//     }
//     events.push(...subscanEvents)
//     page++
//   }

//   if (events.length === 0) return []

//   const messageprocessedEvents = await Promise.all(
//     events.map(async (e: SubscanEvent) => {
//       const eventParams = await bridgeHubScan.post('api/scan/event/params', {
//         event_index: [e.event_index],
//       })
//       const { params }: { params: SubscanParams[] } = eventParams.json.data[0]

//       const messageId = params.find(e => e.name === 'id')?.value
//       if (!messageId) return

//       const origin = params.find(e => e.name === 'origin')?.value
//       const sibling = origin?.Sibling ?? null
//       const channelId = origin?.Snowbridge ?? null
//       const success =
//         e.event_id === eventIds[0] && (params.find(e => e.name === 'success')?.value ?? false)

//       return { ...e, messageId, sibling, channelId, success }
//     }),
//   )
//   return messageprocessedEvents.filter(e => !!e)
// }

// export async function getBHEthOutboundMessages(
//   bridgeHubScan: subscan.SubscanApi,
//   assetHubTransferTimestamp: number,
//   assetHubMessageId: string,
// ) {
//   const eventIds = ['MessageAccepted', 'MessageQueued']

//   // implement an exponential retry mechanism ?
//   const fromBridgeHubBlock = await subscan.fetchBlockNearTimestamp(
//     bridgeHubScan,
//     assetHubTransferTimestamp,
//   )

//   const events = []
//   let page = 0
//   let keepFetching = true

//   while (keepFetching) {
//     const eventsBody = {
//       module: 'ethereumoutboundqueue',
//       block_range: `${fromBridgeHubBlock.block_num}-${fromBridgeHubBlock.block_num + 50}`, // Arbitrary decision to hardcode +50 blocks
//       row: 100,
//       page,
//     }
//     const eventsQuery = await bridgeHubScan.post('api/v2/scan/events', eventsBody)
//     const subscanEvents = eventsQuery?.json?.data?.events ?? []
//     if (!subscanEvents.length) {
//       keepFetching = false
//     }
//     events.push(...subscanEvents)
//     page++
//   }

//   if (events.length === 0) return []

//   const ethOutboundQueueMessage = await Promise.all(
//     events.map(async (e: SubscanEvent) => {
//       if (!eventIds.includes(e.event_id)) return
//       const eventParams = await bridgeHubScan.post('api/scan/event/params', {
//         event_index: [e.event_index],
//       })
//       const { params }: { params: SubscanParams[] } = eventParams.json.data[0]

//       const messageId = params.find(e => e.name === 'id')?.value
//       if (!messageId || messageId !== assetHubMessageId) return

//       const nonce = params.find(e => e.name === 'nonce')?.value ?? null
//       return { ...e, messageId, nonce }
//     }),
//   )
//   return ethOutboundQueueMessage.filter(e => !!e)
// }

// // const getBeefyClientUpdates = async (
// //   beefyClient: BeefyClient,
// //   fromBlock: number,
// //   toBlock: number,
// // ) => {
// //   const NewMMRRoot = beefyClient.getEvent('NewMMRRoot')
// //   const roots = await beefyClient.queryFilter(NewMMRRoot, fromBlock, toBlock)
// //   const updates = roots.map(r => {
// //     return {
// //       blockNumber: r.blockNumber,
// //       blockHash: r.blockHash,
// //       logIndex: r.index,
// //       transactionIndex: r.transactionIndex,
// //       transactionHash: r.transactionHash,
// //       data: {
// //         blockNumber: Number(r.args.blockNumber),
// //         mmrRoot: r.args.mmrRoot,
// //       },
// //     }
// //   })
// //   updates.sort((a, b) => Number(a.data.blockNumber - b.data.blockNumber))
// //   return updates
// // }

// const getEthInboundMessagesDispatched = async (
//   gateway: IGateway,
//   fromBlock: number,
//   toBlock: number,
// ) => {
//   const InboundMessageDispatched = gateway.getEvent('InboundMessageDispatched')
//   const inboundMessages = await gateway.queryFilter(InboundMessageDispatched, fromBlock, toBlock)
//   return inboundMessages.map(message => {
//     return {
//       blockNumber: message.blockNumber,
//       blockHash: message.blockHash,
//       logIndex: message.index,
//       transactionIndex: message.transactionIndex,
//       transactionHash: message.transactionHash,
//       data: {
//         channelId: message.args.channelID,
//         nonce: Number(message.args.nonce),
//         messageId: message.args.messageID,
//         success: message.args.success,
//       },
//     }
//   })
// }

// export const trackAhToEthTransfer = async (
//   env: environment.SnowbridgeEnvironment,
//   hash: string,
// ): Promise<ParachainToETHTransferResult | undefined> => {
//   if (!env.config.SUBSCAN_API) {
//     throw new Error(`No subscan api urls configured for ${env.name}`)
//   }
//   const subscanKey = process.env.NEXT_PUBLIC_SUBSCAN_KEY
//   if (!subscanKey) {
//     throw Error('Missing Subscan Key')
//   }
//   const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY
//   if (!alchemyKey) {
//     throw Error('Missing Alchemy Key')
//   }

//   const assetHubScan = subscan.createApi(env.config.SUBSCAN_API.ASSET_HUB_URL, subscanKey)
//   const relaychainScan = subscan.createApi(env.config.SUBSCAN_API.RELAY_CHAIN_URL, subscanKey)
//   const bridgeHubScan = subscan.createApi(env.config.SUBSCAN_API.BRIDGE_HUB_URL, subscanKey)
//   const ethereumProvider = new AlchemyProvider(env.ethChainId, alchemyKey)
//   // const beefyClient = BeefyClient__factory.connect(env.config.BEEFY_CONTRACT, ethereumProvider)
//   const gateway = IGateway__factory.connect(env.config.GATEWAY_CONTRACT, ethereumProvider)

//   try {
//     // Get Extrinsic data from tx hash on AssetHub.
//     const ahTransferData = await getAHTransferFromHash(
//       hash,
//       assetHubScan,
//       relaychainScan,
//       // env.ethChainId,
//     )
//     if (!ahTransferData) {
//       throw new Error('Failed to fetch AH transfer')
//     }

//     const result: ParachainToETHTransferResult = {
//       id: ahTransferData.data.messageId,
//       status: 0, // === pending
//       // info: {
//       //   // beneficiaryAddress: ahTransferData.data.beneficiaryAddress,
//       //   // tokenAddress: ahTransferData.data.tokenAddress,
//       //   // amount: ahTransferData.data.amount,
//       // },
//       submitted: {
//         when: new Date(ahTransferData.data.block_timestamp * 1000),
//         sourceAddress: ahTransferData.data.account_id,
//         extrinsicIndex: ahTransferData.data.extrinsic_index,
//         extrinsicHash: ahTransferData.data.extrinsic_hash,
//         blockHash: ahTransferData.data.block_hash,
//         blockNum: ahTransferData.data.block_num,
//         blockTimestamp: ahTransferData.data.block_timestamp,
//         messageId: ahTransferData.data.messageId,
//         bridgeHubMessageId: ahTransferData.data.bridgeHubMessageId,
//         success: ahTransferData.data.success,
//         relayChain: {
//           blockNum: ahTransferData.data.relayChain.block_num,
//           blockHash: ahTransferData.data.relayChain.block_hash,
//         },
//       },
//     }

//     if (!result.submitted.success) {
//       result.status = 2 // === transfer failed
//       return result
//     }

//     // Get processed 'messagequeue' message on BridgeHub.
//     const bridgeHubMessageQueues = await getBHMessageQueueProccessed(
//       bridgeHubScan,
//       result.submitted.blockTimestamp,
//     )
//     // Parse bridgehub events, filter siblingParachain & update result.
//     if (!bridgeHubMessageQueues || bridgeHubMessageQueues.length === 0) return result

//     if (!result.submitted.bridgeHubMessageId || !result.submitted.messageId) return result // should I throw and error ??
//     const bridgeHubXcmDelivered = bridgeHubMessageQueues.find(
//       e =>
//         e.messageId === result.submitted.bridgeHubMessageId &&
//         e.sibling == env.config.ASSET_HUB_PARAID,
//     )
//     if (bridgeHubXcmDelivered) {
//       result.bridgeHubXcmDelivered = {
//         blockTimestamp: bridgeHubXcmDelivered.block_timestamp,
//         eventIndex: bridgeHubXcmDelivered.event_index,
//         extrinsicHash: bridgeHubXcmDelivered.extrinsic_hash,
//         siblingParachain: bridgeHubXcmDelivered.sibling,
//         success: bridgeHubXcmDelivered.success,
//       }
//       if (!result.bridgeHubXcmDelivered.success) {
//         result.status = 2 // === transfer failed
//         return result
//       }
//     }

//     // Parse bridgehub events, filter channelId & update result.
//     // Needed to compare to final gateway.
//     const assetHubChannelId = paraIdToChannelId(env.config.ASSET_HUB_PARAID)
//     const bridgeHubChannelDelivered = bridgeHubMessageQueues.find(
//       e =>
//         e.extrinsic_hash === result.bridgeHubXcmDelivered?.extrinsicHash &&
//         e.channelId === assetHubChannelId &&
//         e.block_timestamp === result.bridgeHubXcmDelivered?.blockTimestamp,
//     )
//     if (bridgeHubChannelDelivered) {
//       result.bridgeHubChannelDelivered = {
//         blockTimestamp: bridgeHubChannelDelivered.block_timestamp,
//         eventIndex: bridgeHubChannelDelivered.event_index,
//         extrinsicHash: bridgeHubChannelDelivered.extrinsic_hash,
//         channelId: bridgeHubChannelDelivered.channelId,
//         success: bridgeHubChannelDelivered.success,
//       }
//       if (!result.bridgeHubChannelDelivered.success) {
//         result.status = 2 // === transfer failed
//         return result
//       }
//     }

//     // // Get 'ethereumoutboundqueue' message on BridgeHub.
//     const outboundMessages = await getBHEthOutboundMessages(
//       bridgeHubScan,
//       result.submitted.blockTimestamp,
//       result.submitted.messageId,
//     )

//     // // Parse bridgehub events, filter ethereumoutboundqueue = MessageQueued & update result.
//     // const bridgeHubMessageQueued = outboundMessages.find(e => e.event_id === 'MessageQueued')
//     // if (bridgeHubMessageQueued) {
//     //   result.bridgeHubMessageQueued = {
//     //     block_timestamp: bridgeHubMessageQueued.block_timestamp,
//     //     event_index: bridgeHubMessageQueued.event_index,
//     //     extrinsic_hash: bridgeHubMessageQueued.extrinsic_hash,
//     //   }
//     // }

//     // Parse bridgehub events, filter ethereumoutboundqueue = MessageAccepted & update result.
//     const bridgeHubMessageAccepted = outboundMessages.find(e => e.event_id === 'MessageAccepted')
//     if (bridgeHubMessageAccepted) {
//       result.bridgeHubMessageAccepted = {
//         blockTimestamp: bridgeHubMessageAccepted.block_timestamp,
//         eventIndex: bridgeHubMessageAccepted.event_index,
//         extrinsicHash: bridgeHubMessageAccepted.extrinsic_hash,
//         nonce: bridgeHubMessageAccepted.nonce,
//       }
//     }

//     const ethereumSearchPeriodBlocks = HISTORY_IN_SECONDS / ETHEREUM_BLOCK_TIME_SECONDS
//     const ethNowBlock = await ethereumProvider.getBlock('latest', false)
//     if (!ethNowBlock) return result

//     // //BEEFY light client check - Need to confirm how usefull is this
//     // const beefyClientUpdates = await getBeefyClientUpdates(
//     //   beefyClient,
//     //   ethNowBlock.number - ethereumSearchPeriodBlocks,
//     //   ethNowBlock.number,
//     // )

//     // const secondsTillAcceptedByRelayChain = 6 /* 6 secs per block */ * 10 /* blocks */
//     // const ethereumBeefyIncluded = beefyClientUpdates.find(
//     //   e =>
//     //     e.data.blockNumber >
//     //     result.submitted.relayChain.block_num + secondsTillAcceptedByRelayChain,
//     // )
//     // if (ethereumBeefyIncluded) {
//     //   result.ethereumBeefyIncluded = {
//     //     blockNumber: ethereumBeefyIncluded.blockNumber,
//     //     blockHash: ethereumBeefyIncluded.blockHash,
//     //     transactionHash: ethereumBeefyIncluded.transactionHash,
//     //     transactionIndex: ethereumBeefyIncluded.transactionIndex,
//     //     logIndex: ethereumBeefyIncluded.logIndex,
//     //     relayChainblockNumber: ethereumBeefyIncluded.data.blockNumber,
//     //     mmrRoot: ethereumBeefyIncluded.data.mmrRoot,
//     //   }
//     // }

//     // Parse & filter gateway events & update final result.
//     const ethInboundMessagesDispatched = await getEthInboundMessagesDispatched(
//       gateway,
//       ethNowBlock.number - ethereumSearchPeriodBlocks,
//       ethNowBlock.number,
//     )
//     const ethMessageDispatched = ethInboundMessagesDispatched.find(
//       e =>
//         e.data.channelId === result.bridgeHubChannelDelivered?.channelId &&
//         e.data.messageId === result.submitted.messageId &&
//         e.data.nonce === result.bridgeHubMessageAccepted?.nonce,
//     )

//     if (ethMessageDispatched) {
//       result.ethMessageDispatched = {
//         blockNumber: ethMessageDispatched.blockNumber,
//         blockHash: ethMessageDispatched.blockHash,
//         transactionHash: ethMessageDispatched.transactionHash,
//         transactionIndex: ethMessageDispatched.transactionIndex,
//         // logIndex: ethMessageDispatched.logIndex,
//         // messageId: ethMessageDispatched.data.messageId,
//         // channelId: ethMessageDispatched.data.channelId,
//         nonce: ethMessageDispatched.data.nonce,
//         success: ethMessageDispatched.data.success,
//       }
//       if (!result.ethMessageDispatched.success) {
//         result.status = 2 // === transfer failed
//         return result
//       }
//       result.status = 1 // === transfer completed & successful
//     }

//     return result
//   } catch (error) {
//     console.log(error)
//   }
// }
