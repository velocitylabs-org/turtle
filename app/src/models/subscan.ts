import { TransferStatus } from '@snowbridge/api/dist/history'

export type SubscanTransferResponse = {
  message_hash: string
  origin_event_index: string
  from_account_id: string
  origin_para_id: number
  origin_block_timestamp: number
  relayed_block_timestamp: number
  block_num: number
  status: 'pending' | 'relayed' | 'success' | 'failed'
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

export type FromParachainTrackingResult = {
  messageHash: string
  originEventIndex: string // Parachain/AH transfer block index
  fromAccountId: string
  originParaId: number
  originBlockTimestamp: number // Parachain/AH transfer timestamp
  relayedBlockTimestamp: number // Relaychain transfer timestamp
  blockNum: number // Relaychain transfer block number
  extrinsicStatus: string
  relayedEventIndex: string
  destChain: string
  destEventIndex: string
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
