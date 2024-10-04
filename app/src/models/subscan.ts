import { TransferStatus } from '@snowbridge/api/dist/history'

export type SubscanTransferResponse = {
  message_hash: string
  origin_event_index: string
  from_account_id: string
  origin_para_id: number
  origin_block_timestamp: number
  relayed_block_timestamp: number
  block_num: number
  status: string
  relayed_event_index: string
  dest_event_index: string
  dest_para_id: number
  to_account_id: string
  confirm_block_timestamp: number
  extrinsic_index: string
  relayed_extrinsic_index: string
  dest_extrinsic_index: string
  child_para_id: number
  child_dest: string
  protocol: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  instructions: any
  message_type: string
  unique_id: string
  xcm_version: number
  from_chain: string
  dest_chain: string
  metadata: {
    send_at?: number
    tx_hash?: string
    message_id?: string
  }
  cross_chain_status: 1 | 2 | 3
  bridge_type: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assets: any
}

type SubscanXCMMetadata = {
  sendAt?: number
  txHash?: string
  messageId?: string
}

export type FromParachainTrackingRes = { 
  messageHash: string
  originEventIndex: string // Parachain/AH transfer block index
  fromAccountId: string
  originParaId: number
  originBlockTimestamp: number // Parachain/AH transfer timestamp
  relayedBlockTimestamp: number // Relaychain transfer timestamp
  blockNum: number // Relaychain transfer block number
  extrinsicStatus: string
  relayedEventIndex: string
  destEventIndex: string // BH transfer block index
  destParaId: number
  toAccountId: string
  confirmBlockTimestamp: number
  extrinsicIndex: string
  relayedExtrinsicIndex: string
  destExtrinsicIndex: string
  uniqueId: string
  metadata: SubscanXCMMetadata
  status: TransferStatus
}

// LEGACY CODE BELOW
// TO KEEP UNTIL FURTHER NOTICE

// export type SubscanEvent = {
//   id: number
//   block_timestamp: number
//   event_index: string
//   extrinsic_index: string
//   phase: number
//   module_id: string
//   event_id: string
//   extrinsic_hash: string
//   finalized: boolean
// }

// export type SubscanExtrinsicEvent = {
//   event_index: string
//   block_num: number
//   extrinsic_idx: number
//   module_id: string
//   event_id: string
//   params: string
//   phase: number
//   event_idx: number
//   extrinsic_hash: string
//   finalized: boolean
//   block_timestamp: number
// }

// export type SubscanParams = {
//   type: string
//   type_name: string
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   value: any
//   name: string
// }

// export type ParachainToEthTransferResult = {
//   id: string | null
//   status: 0 | 1 | 2
//   submitted: {
//     when: Date
//     sourceAddress: string
//     extrinsicIndex: string
//     extrinsicHash: string
//     blockHash: string
//     blockNum: number
//     blockTimestamp: number
//     messageId: string | null
//     bridgeHubMessageId: string | null
//     success: boolean
//     relayChain: {
//       blockNum: number
//       blockHash: string
//     }
//   }
//   bridgeHubXcmDelivered?: {
//     blockTimestamp: number
//     eventIndex: string
//     extrinsicHash: string
//     siblingParachain: number
//     success: boolean
//   }
//   bridgeHubChannelDelivered?: {
//     blockTimestamp: number
//     eventIndex: string
//     extrinsicHash: string
//     channelId: string
//     success: boolean
//   }
//   bridgeHubMessageAccepted?: {
//     blockTimestamp: number
//     eventIndex: string
//     extrinsicHash: string
//     nonce: number
//   }
//   ethMessageDispatched?: {
//     blockNumber: number
//     blockHash: string
//     transactionHash: string
//     transactionIndex: number
//     nonce: number
//     success: boolean
//   }
// }
