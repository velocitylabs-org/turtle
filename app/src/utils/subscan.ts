import { environment, subscan } from '@snowbridge/api'
import { bnToU8a, hexToU8a, stringToU8a, u8aToHex } from '@polkadot/util'
import { blake2AsU8a, keccak256AsU8a } from '@polkadot/util-crypto'

type messagequeueProcessed = {
  id: number
  block_timestamp: number
  event_index: string
  extrinsic_index: string
  phase: number
  module_id: string
  event_id: string
  extrinsic_hash: string
  finalized: boolean
}

export const forwardedTopicId = (messageId: string): string => {
  const typeEncoded = stringToU8a('forward_id_for')
  const paraIdEncoded = hexToU8a(messageId)
  const joined = new Uint8Array([...typeEncoded, ...paraIdEncoded])
  const newTopicId = blake2AsU8a(joined, 256)
  return u8aToHex(newTopicId)
}

export const paraIdToChannelId = (paraId: number): string => {
  const typeEncoded = stringToU8a('para')
  const paraIdEncoded = bnToU8a(paraId, { bitLength: 32, isLe: false })
  const joined = new Uint8Array([...typeEncoded, ...paraIdEncoded])
  const channelId = keccak256AsU8a(joined)
  return u8aToHex(channelId)
}

export async function getAssetHubData(
  hash: string,
  assetHubScan: subscan.SubscanApi,
  relaychainScan: subscan.SubscanApi,
  ethChainId: number,
) {
  const subscanExtrinsicFetch = await assetHubScan.post('api/scan/extrinsic', {
    hash,
    only_extrinsic_event: true,
  })

  const {
    event,
    block_hash,
    account_id,
    block_timestamp,
    params,
    block_num,
    extrinsic_index,
    extrinsic_hash,
  } = subscanExtrinsicFetch.json.data

  const xcmSentEvent = event.find(
    (e: any) => e.module_id === 'polkadotxcm' && e.event_id === 'Sent',
  )
  const transferSuccess =
    event.find((e: any) => e.module_id === 'system' && e.event_id === 'ExtrinsicSuccess') !==
    undefined

  let messageId: string | null = null
  let bridgeHubMessageId: string | null = null

  if (transferSuccess && xcmSentEvent) {
    const ev = JSON.parse(xcmSentEvent.params)
    messageId = ev.find((pa: any) => pa.name === 'message_id')?.value ?? null
    if (messageId) {
      bridgeHubMessageId = forwardedTopicId(messageId)
    }
  }

  const {
    json: { data: relayBlock },
  } = await relaychainScan.post('api/scan/block', {
    block_timestamp: block_timestamp,
    only_head: true,
  })

  const beneficiary = params.find((p: any) => p.name == 'beneficiary')?.value
  const beneficiaryParents: number | null =
    beneficiary.V3?.parents ?? beneficiary.V4?.parents ?? null
  const beneficiaryAddress: string | null =
    beneficiary.V3?.interior?.X1?.AccountKey20?.key ??
    (beneficiary.V4?.interior?.X1 && beneficiary.V4?.interior?.X1[0])?.AccountKey20?.key ??
    null

  if (!(beneficiaryParents === 0 && beneficiaryAddress !== null)) {
    return null
  }

  const assets = params.find((p: any) => p.name == 'assets')?.value
  let amount: string | null = null
  let tokenParents: number | null = null
  let tokenAddress: string | null = null
  let tokenChainId: number | null = null
  for (const asset of assets.V3 ?? assets.V4 ?? []) {
    amount = asset.fun?.Fungible ?? null
    if (amount === null) {
      continue
    }

    tokenParents = asset.id?.parents ?? asset.id?.Concrete?.parents ?? null
    if (tokenParents === null) {
      continue
    }

    const tokenX2 = asset.id?.interior?.X2 ?? Object.values(asset.id?.Concrete?.interior?.X2 ?? {})
    if (tokenX2 === null || tokenX2.length !== 2) {
      continue
    }

    tokenChainId = tokenX2[0].GlobalConsensus?.Ethereum ?? null
    if (tokenChainId === null) {
      continue
    }

    tokenAddress = tokenX2[1].AccountKey20?.key ?? null
    if (tokenAddress === null) {
      continue
    }

    break
  }

  if (
    !(tokenParents === 2 && tokenChainId === ethChainId && tokenAddress !== null && amount !== null)
  ) {
    return null
  }

  return {
    status: subscanExtrinsicFetch.status,
    statusText: subscanExtrinsicFetch.statusText,
    data: {
      events: event,
      messageId,
      bridgeHubMessageId,
      success: transferSuccess,
      block_hash,
      account_id,
      relayChain: { block_num: relayBlock.block_num, block_hash: relayBlock.hash },
      tokenAddress,
      beneficiaryAddress,
      amount,
      block_timestamp,
      block_num,
      extrinsic_index,
      extrinsic_hash,
    },
  }
}

export async function getBridgeHubData(
  bridgeHubScan: subscan.SubscanApi,
  timestamp: number,
  bridgeHubMessageId: string,
) {
  const eventIds = ['Processed', 'ProcessingFailed', 'OverweightEnqueued']

  // implement an exponential retry mechanism
  const fromBridgeHubBlock = await subscan.fetchBlockNearTimestamp(bridgeHubScan, timestamp)

  const eventsBody = {
    module: 'messagequeue',
    block_range: `${fromBridgeHubBlock.block_num}-${fromBridgeHubBlock.block_num + 10}`,
    event_id: eventIds.length === 1 ? eventIds[0] : undefined,
    row: 100,
    page: 0,
  }

  // paginate the query with a loop that handles the page param
  const subscanEventFetch = await bridgeHubScan.post('api/v2/scan/events', eventsBody)

  const events = await subscanEventFetch.json.data.events
  if (subscanEventFetch.json.data?.count === 0 || events.length === 0) return []

  const messageprocessedEvents = await Promise.all(
    events.map(async (e: messagequeueProcessed) => {
      const eventParams = await bridgeHubScan.post('api/scan/event/params', {
        event_index: [e.event_index],
      })
      const { params } = eventParams.json.data[0]

      const messageId = params.find((e: any) => e.name === 'id')?.value
      if (!messageId || messageId !== bridgeHubMessageId) {
        return
      }

      const origin = params.find((e: any) => e.name === 'origin')?.value
      const sibling = origin?.Sibling ?? null
      const channelId = origin?.Snowbridge ?? null
      const success =
        e.event_id === 'Processed' &&
        (params.find((e: any) => e.name === 'success')?.value ?? false)

      return { ...e, messageId, sibling, channelId, success }
    }),
  )
  return messageprocessedEvents.filter(e => !!e)
}

export const getAhToParachainHistory = async (
  env: environment.SnowbridgeEnvironment,
  hash: string,
) => {
  if (!env.config.SUBSCAN_API) {
    throw new Error(`No subscan api urls configured for ${env.name}`)
  }
  const subscanKey = process.env.NEXT_PUBLIC_SUBSCAN_KEY
  if (!subscanKey) {
    throw Error('Missing Subscan Key')
  }

  const assetHubScan = subscan.createApi(env.config.SUBSCAN_API.ASSET_HUB_URL, subscanKey)
  const relaychainScan = subscan.createApi(env.config.SUBSCAN_API.RELAY_CHAIN_URL, subscanKey)
  const bridgeHubScan = subscan.createApi(env.config.SUBSCAN_API.BRIDGE_HUB_URL, subscanKey)

  try {
    const ahTransferData = await getAssetHubData(hash, assetHubScan, relaychainScan, env.ethChainId)
    if (!ahTransferData) return // TODO improve error

    const result: any = {
      id: ahTransferData.data.messageId,
      status: 0, // === pending
      info: {
        when: new Date(ahTransferData.data.block_timestamp * 1000),
        sourceAddress: ahTransferData.data.account_id,
        tokenAddress: ahTransferData.data.tokenAddress,
        beneficiaryAddress: ahTransferData.data.beneficiaryAddress,
        amount: ahTransferData.data.amount,
      },
      submitted: {
        extrinsic_index: ahTransferData.data.extrinsic_index,
        extrinsic_hash: ahTransferData.data.extrinsic_hash,
        block_hash: ahTransferData.data.block_hash,
        account_id: ahTransferData.data.account_id,
        block_num: ahTransferData.data.block_num,
        block_timestamp: ahTransferData.data.block_timestamp,
        messageId: ahTransferData.data.messageId,
        bridgeHubMessageId: ahTransferData.data.bridgeHubMessageId,
        success: ahTransferData.data.success,
        relayChain: {
          block_num: ahTransferData.data.relayChain.block_num,
          block_hash: ahTransferData.data.relayChain.block_hash,
        },
      },
    }

    if (!result.submitted.success) {
      result.status = 2 // === failed
    }

    if (!result.submitted.bridgeHubMessageId) {
      return // TODO improve error
    }

    const bridgeHubXcmDelivered = await getBridgeHubData(
      bridgeHubScan,
      result.submitted.block_timestamp,
      result.submitted.bridgeHubMessageId,
    )

    if (bridgeHubXcmDelivered.length) {
      result.bridgeHubXcmDelivered = {
        block_timestamp: bridgeHubXcmDelivered[0].block_timestamp,
        event_index: bridgeHubXcmDelivered[0].event_index,
        extrinsic_hash: bridgeHubXcmDelivered[0].extrinsic_hash,
        siblingParachain: bridgeHubXcmDelivered[0].sibling,
        success: bridgeHubXcmDelivered[0].success,
      }
      if (!result.bridgeHubXcmDelivered.success) {
        result.status = 2 // === failed
      }
    }
    return result
  } catch (error) {
    console.log(error)
  }
}

// BEGINING TEST
// const context = await getSnowBridgeContext()
// const { api: bridgeHub } = await constructApiPromise(
//   'wss://rococo-bridge-hub-rpc.polkadot.io',
// )
// try {
//   const test = await waitForMessageQueuePallet(
//     context.polkadot.api.assetHub,
//     "0x96618413c7dd80a998d3247751c9557f889bfd9df7cd3d06bf4148b86a8be5c9",
//     env.config.BRIDGE_HUB_PARAID,
//     () => true,
//     {
//       scanBlocks: 40,
//     }
//   )
// } catch (error) {
//   console.log(error)
// }
// END TEST
