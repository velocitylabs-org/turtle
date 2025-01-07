import { TxEvent } from 'polkadot-api'

export const handleObservableEvents = (event: TxEvent) => {
  // Wait until block is finalized or in a best block state
  if (event.type === 'finalized' || (event.type === 'txBestBlocksState' && event.found)) {
    // Verify transaction hash
    if (!event.txHash) throw new Error('Failed to generate the transaction hash')
    // Handle execution and extrinsic errors
    if (!event.ok) {
      const dispatchError = event.dispatchError
      if (dispatchError.type === 'Module') {
        const error = dispatchError.value
        const isTypeErrorAvailable = typeof error === 'object' && error !== null && 'type' in error
        throw new Error(`${dispatchError.type} - ${isTypeErrorAvailable && error.type}`)
      }
      throw new Error('Transfer failed')
    }
  }

  if (event.type === 'finalized') {
    const {
      block: { index: txIndex, number: blockNumber },
      events,
    } = event
    const extrinsicIndex = `${blockNumber}-${txIndex}`
    let messageHash: string | undefined
    let messageId: string | undefined

    events.forEach(({ type: section, value: { type: method, value: data } }) => {
      // Get messageHash from parachainSystem pallet (ex: DOT from Hydra to Bifrost )
      if (
        section === 'ParachainSystem' &&
        method === 'UpwardMessageSent' &&
        'message_hash' in data
      ) {
        messageHash = data.message_hash.asHex()
      }
      // Get messageHash from xcmpQueue pallet (ex: BNC from Hydra to Bifrost)
      if (method === 'XcmpMessageSent' && section === 'XcmpQueue' && 'message_hash' in data) {
        messageHash = data.message_hash.asHex()
      }
      // Get messageId from xcmPallet pallet (ex: DOT from Relay Chain to AH)
      if (section === 'XcmPallet' && method === 'Sent' && 'message_id' in data) {
        messageId = data.message_id.asHex()
      }
      // Get messageId from polkadotXcm pallet (ex: DOT from AH to Relay Chain or ETH)
      if (section === 'PolkadotXcm' && method === 'Sent' && 'message_id' in data) {
        messageId = data.message_id.asHex()
      }
    })

    if (!messageHash && !messageId && !extrinsicIndex)
      throw new Error('MessageHash, MessageId and ExtrinsicIndex are all missing')

    return { messageHash, messageId, extrinsicIndex }
  }
}
