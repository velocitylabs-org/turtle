import { type environment, subscan } from '@snowbridge/api'
import { TransferStatus } from '@snowbridge/api/dist/history'
import type { FromParachainTrackingResult, Status, SubscanTransferResponse } from '@/models/subscan'
import type { OngoingTransferWithDirection } from '@/models/transfer'

export const trackXcm = async (
  env: environment.SnowbridgeEnvironment,
  ongoingTransfers: OngoingTransferWithDirection[],
) => {
  try {
    const xcmTransfers: FromParachainTrackingResult[] = []
    const subscanKey = process.env.NEXT_PUBLIC_SUBSCAN_KEY
    if (!subscanKey) throw Error('Missing Subscan Key')
    const relaychain = subscan.createApi(env.config.RELAY_CHAIN_URL, subscanKey)

    for (const transfer of ongoingTransfers) {
      const { crossChainMessageHash, sourceChainExtrinsicIndex } = transfer
      if (!crossChainMessageHash && !sourceChainExtrinsicIndex) {
        console.log('Both crossChainMessageHash and sourceChainExtrinsicIndex are undefined')
        // Should not return an error as we want to continue looping to the others transfers
        continue
      }

      const body = {
        ...(crossChainMessageHash && { message_hash: crossChainMessageHash }),
        // Only fetch by ExtrinsicIndex if sourceChain is Relay chain & crossChainMessageHash is undefined
        ...(!crossChainMessageHash && sourceChainExtrinsicIndex && { extrinsic_index: sourceChainExtrinsicIndex }),
        row: 10,
      }
      const query = await relaychain.post('api/scan/xcm/list', body)
      if (query.status !== 200) {
        console.log('Subscan API request failed')
        // Should not return an error as we want to continue looping to the others transfers
        continue
      }

      const transferData: SubscanTransferResponse[] = query.json?.data?.list ?? []
      if (!transferData.length || !transferData[0]) {
        console.log(
          `XCM transfer not found for ${crossChainMessageHash ? `message hash: ${crossChainMessageHash}` : `extrinsic id: ${sourceChainExtrinsicIndex}`}.`,
        )
        query.json?.message && console.log(`Additional information: ${query.json.message}`)
        // Should not return an error as we want to continue looping to the others transfers
        continue
      }
      const { status, protocol, unique_id } = transferData[0]

      if (status === 'success' && protocol === 'UMP') {
        const body = {
          unique_id,
        }
        const uniqueIdQuery = await relaychain.post('api/scan/xcm/info', body)
        if (uniqueIdQuery.status !== 200) {
          console.log(`Subscan API info request failed for unique_id: ${unique_id}`)
          continue
        }

        const uniqueIdData: SubscanTransferResponse = uniqueIdQuery.json?.data
        if (!uniqueIdData) {
          console.log(`XCM transfer not found for unique_id: ${unique_id}`)
          query.json?.message && console.log(`Additional information: ${query.json.message}`)
          continue
        }

        xcmTransfers.push(formatTransferData(transferData[0], uniqueIdData.child_message?.status))
        continue
      }
      xcmTransfers.push(formatTransferData(transferData[0]))
    }

    return xcmTransfers
  } catch (error) {
    console.error(`Subscan XCM transfers tracking error:`, error)
    return []
  }
}

const formatTransferData = (data: SubscanTransferResponse, txStatus?: Status) => {
  return {
    messageHash: data.message_hash,
    originEventIndex: data.origin_event_index,
    fromAccountId: data.from_account_id,
    originParaId: data.origin_para_id,
    originBlockTimestamp: data.origin_block_timestamp,
    relayedBlockTimestamp: data.relayed_block_timestamp,
    blockNum: data.block_num,
    extrinsicStatus: data.status,
    relayedEventIndex: data.relayed_event_index,
    destChain: data.dest_chain,
    destEventIndex: data.dest_event_index,
    destParaId: data.dest_para_id,
    toAccountId: data.to_account_id,
    confirmBlockTimestamp: data.confirm_block_timestamp,
    extrinsicIndex: data.extrinsic_index,
    relayedExtrinsicIndex: data.relayed_extrinsic_index,
    destExtrinsicIndex: data.dest_extrinsic_index,
    uniqueId: data.unique_id,
    metadata: {
      ...(data.metadata.send_at && { sendAt: data.metadata.send_at }),
      ...(data.metadata.tx_hash && { txHash: data.metadata.tx_hash }),
      ...(data.metadata.message_id && {
        messageId: data.metadata.message_id,
      }),
    },
    status: getTxStatus(txStatus ? txStatus : data.status),
  }
}

const getTxStatus = (status: Status) => {
  let xcmStatus: TransferStatus = TransferStatus.Pending
  // switch (transferData[0].cross_chain_status) {
  //   case 1:
  //     xchainTransferStatus = TransferStatus.Pending
  //     break
  //   case 2:
  //     xchainTransferStatus = TransferStatus.Failed
  //     break
  //   case 3:
  //     xchainTransferStatus = TransferStatus.Complete
  //     break
  //   default:
  //     break
  // }
  switch (status) {
    case 'failed':
      xcmStatus = TransferStatus.Failed
      break
    case 'success':
      xcmStatus = TransferStatus.Complete
      break
    // case ("relayed"):
    //   xchainTransferStatus = TransferStatus.Complete
    //   break
    default:
      xcmStatus = TransferStatus.Pending
      break
  }
  return xcmStatus
}
