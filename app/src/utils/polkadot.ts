import { ApiPromise, WsProvider } from '@polkadot/api'
import { web3FromSource } from '@polkadot/extension-dapp'
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'
import { ISubmittableResult } from '@polkadot/types/types'

/**
 * Processes blockchain events and handles extrinsic success or failure.
 * It listens to the transaction process, checks for errors, and filters relevant data.
 *
 * @param result - The blockchain result returned by the signAndSend() method.
 * @returns - An object containing the messageHash, the messageId and the exitCallBack boolean.
 */
export const handleSubmittableEvents = (result: ISubmittableResult) => {
  const { txHash, status, events, isError, internalError, isCompleted, dispatchError, txIndex } =
    result
  // check for execution errors
  if (isError || internalError) throw new Error('Transfer failed')

  // verify transaction hash
  if (!txHash) throw new Error('Failed to generate the transaction hash')
  console.log('status', status.toJSON())

  // Wait until block is finalized before handling transfer data
  if (isCompleted && status.isFinalized) {
    // check for extrinsic errors
    if (dispatchError !== undefined) {
      if (dispatchError.isModule) {
        const { docs, section } = dispatchError.registry.findMetaError(dispatchError.asModule)
        throw new Error(`${docs.join(' ')} - Pallet '${section}'`)
      }
    }

    // Verify extrinsic success
    const extrinsicSuccess = result.findRecord('system', 'ExtrinsicSuccess')
    if (!extrinsicSuccess) throw new Error(`'ExtrinsicSuccess' event not found`)

    const blockNumber: string | undefined =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'blockNumber' in result ? (result.blockNumber as any).toJSON() : undefined
    const extrinsicIndex: string | undefined =
      blockNumber && txIndex ? `${blockNumber}-${txIndex}` : undefined

    let messageHash: string | undefined
    let messageId: string | undefined

    // Filter the events to get the needed data
    events.forEach(({ event: { data, method, section } }) => {
      // Get messageHash from parachainSystem pallet (ex: DOT from Para to Para )
      if (method === 'UpwardMessageSent' && section === 'parachainSystem') {
        messageHash = data[0].toString()
      }
      // Get messageHash from xcmpQueue pallet (ex: AH to ETH)
      if (method === 'XcmpMessageSent' && section === 'xcmpQueue' && 'messageHash' in data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messageHash = (data.messageHash as any).toString()
      }
      // Get messageId from xcmPallet pallet (ex: Relay Chain to AH)
      if (method === 'Sent' && section === 'xcmPallet' && 'messageId' in data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messageId = (data.messageId as any).toString()
      }
      // Get messageId from polkadotXcm pallet (ex: AH to Relay Chain or ETH)
      if (method === 'Sent' && section === 'polkadotXcm' && 'messageId' in data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messageId = (data.messageId as any).toString()
      }
    })
    if (!messageHash && !messageId && !extrinsicIndex)
      throw new Error('MessageHash, MessageId and ExtrinsicIndex are all missing')

    return { messageHash, messageId, extrinsicIndex }
  }
}

export const getApiPromise = async (wssEndpoint?: string): Promise<ApiPromise | undefined> => {
  if (!wssEndpoint) return

  const wsProvider = new WsProvider(wssEndpoint)
  return await ApiPromise.create({
    provider: wsProvider,
  })
}

export const getInjector = async (account: InjectedAccountWithMeta) => {
  return await web3FromSource(account.meta.source)
}
