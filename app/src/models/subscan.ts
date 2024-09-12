export type SubscanEvent = {
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

export type SubscanExtrinsicEvent = {
    event_index: string,
    block_num: number,
    extrinsic_idx: number,
    module_id: string,
    event_id: string,
    params: string,
    phase: number,
    event_idx: number,
    extrinsic_hash: string,
    finalized: boolean,
    block_timestamp: number
}

export type SubscanParams = {
    type: string,
    type_name: string,
    value: any,
    name: string
}

export type ParachainToETHTransferResult = {
    id: string | null,
    status: 0 | 1 | 2,
    submitted: {
        when: Date,
        sourceAddress: string,
        extrinsicIndex: string,
        extrinsicHash: string,
        blockHash: string,
        blockNum: number,
        blockTimestamp: number,
        messageId: string | null,
        bridgeHubMessageId: string | null,
        success: boolean,
        relayChain: {
            blockNum: number,
            blockHash: string,
        }
    },
    bridgeHubXcmDelivered?: {
        blockTimestamp: number,
        eventIndex: string,
        extrinsicHash: string,
        siblingParachain: number,
        success: boolean,
    },
    bridgeHubChannelDelivered?: {
        blockTimestamp: number,
        eventIndex: string,
        extrinsicHash: string,
        channelId: string,
        success: boolean,
    },
    bridgeHubMessageAccepted?: {
        blockTimestamp: number,
        eventIndex: string,
        extrinsicHash: string,
        nonce: number,
    },
    ethMessageDispatched?: {
        blockNumber: number,
        blockHash: string,
        transactionHash: string,
        transactionIndex: number,
        nonce: number,
        success: boolean,
    }
}