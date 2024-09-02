import { AlchemyProvider } from 'ethers'
import { environment, subscan } from '@snowbridge/api'
import { BeefyClient__factory, IGateway__factory } from '@snowbridge/contract-types'
import { hexToU8a, stringToU8a, u8aToHex } from '@polkadot/util'
import { blake2AsU8a } from '@polkadot/util-crypto'

export const forwardedTopicId = (messageId: string): string => {
  const typeEncoded = stringToU8a('forward_id_for')
  const paraIdEncoded = hexToU8a(messageId)
  const joined = new Uint8Array([...typeEncoded, ...paraIdEncoded])
  const newTopicId = blake2AsU8a(joined, 256)
  return u8aToHex(newTopicId)
}

export async function getData(env: environment.SnowbridgeEnvironment, hash: string) {
  if (!env.config.SUBSCAN_API) {
    console.warn(`No subscan api urls configured for ${env.name}`)
    // return []
    throw new Error(`No subscan api urls configured for ${env.name}`)
  }
  const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY
  if (!alchemyKey) {
    throw Error('Missing Alchemy Key')
  }

  const subscanKey = process.env.NEXT_PUBLIC_SUBSCAN_KEY
  if (!subscanKey) {
    throw Error('Missing Subscan Key')
  }

  const assetHubScan = subscan.createApi(env.config.SUBSCAN_API.ASSET_HUB_URL, subscanKey)
  const bridgeHubScan = subscan.createApi(env.config.SUBSCAN_API.BRIDGE_HUB_URL, subscanKey)
  const relaychainScan = subscan.createApi(env.config.SUBSCAN_API.RELAY_CHAIN_URL, subscanKey)
  const bridgeHubParaId = env.config.BRIDGE_HUB_PARAID
  const assetHubParaId = env.config.ASSET_HUB_PARAID
  const beacon_url = env.config.BEACON_HTTP_API
  const ethChainId = env.ethChainId
  const ethereumProvider = new AlchemyProvider(env.ethChainId, alchemyKey)
  const beefyClient = BeefyClient__factory.connect(env.config.BEEFY_CONTRACT, ethereumProvider)
  const gateway = IGateway__factory.connect(env.config.GATEWAY_CONTRACT, ethereumProvider)

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
  // console.log(event)

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

    // found first token
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

export const getHistoryTest = async (env: environment.SnowbridgeEnvironment) => {
  try {
    const transfer = await getData(
      env,
      '0xcdefd199b2b88c8ae43130dd4e48d8a5d3407556edfa617dba259bd51505a588',
    )
    if (!transfer) return

    const result = {
      id: transfer.data.messageId,
      status: 0, // === pending
      info: {
        when: new Date(transfer.data.block_timestamp * 1000),
        sourceAddress: transfer.data.account_id,
        tokenAddress: transfer.data.tokenAddress,
        beneficiaryAddress: transfer.data.beneficiaryAddress,
        amount: transfer.data.amount,
      },
      submitted: {
        extrinsic_index: transfer.data.extrinsic_index,
        extrinsic_hash: transfer.data.extrinsic_hash,
        block_hash: transfer.data.block_hash,
        account_id: transfer.data.account_id,
        block_num: transfer.data.block_num,
        block_timestamp: transfer.data.block_timestamp,
        messageId: transfer.data.messageId,
        bridgeHubMessageId: transfer.data.bridgeHubMessageId,
        success: transfer.data.success,
        relayChain: {
          block_num: transfer.data.relayChain.block_num,
          block_hash: transfer.data.relayChain.block_hash,
        },
      },
    }

    if (!result.submitted.success) {
      result.status = 2 // === failed
    }
    return result
  } catch (error) {
    console.log(error)
  }
}
