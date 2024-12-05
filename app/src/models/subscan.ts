import { TransferStatus } from '@snowbridge/api/dist/history'

export type Status = 'pending' | 'relayed' | 'success' | 'failed'

type Metadata = {
  send_at?: number
  tx_hash?: string
  message_id?: string
}

type Message = {
  message_hash: string
  origin_event_index: string
  from_account_id: string
  origin_para_id: number
  origin_block_timestamp: number
  relayed_block_timestamp: number
  block_num: number
  status: Status
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
  metadata: Metadata
  bridge_type: string
  cross_chain_status: 1 | 2 | 3
}

export type SubscanTransferResponse = Message & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assets: any
  child_message?: Message
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
