import { subscan, environment } from '@snowbridge/api'
import { TransferStatus } from '@snowbridge/api/dist/history'
import { SubscanTransferResponse, FromParachainTrackingResult } from '@/models/subscan'
import { OngoingTransferWithDirection } from '@/models/transfer'

export const trackFromParachainTx = async (
  env: environment.SnowbridgeEnvironment,
  ongoingTransfers: OngoingTransferWithDirection[],
) => {
  try {
    const xcmTransfers: FromParachainTrackingResult[] = []
    if (!env.config.SUBSCAN_API) {
      console.warn(`No subscan api urls configured for ${env.name}`)
      return xcmTransfers
    }
    const subscanKey = process.env.NEXT_PUBLIC_SUBSCAN_KEY
    if (!subscanKey) throw Error('Missing Subscan Key')
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

      const transferData: SubscanTransferResponse[] = query.json?.data?.list ?? []
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
