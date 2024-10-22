import { ApiPromise, WsProvider } from '@polkadot/api'
import { ISubmittableResult } from '@polkadot/types/types'

/**
 * Processes blockchain events and handles extrinsic success or failure.
 * It listens to the transaction process, checks for errors, and filters relevant data.
 *
 * @param result - The blockchain result returned by the signAndSend() method.
 * @param exitCallBack - A boolean flag to manual mark the process as completed, exit the callback and prevent unnecessary loops.
 * @returns - An object containing the messageHash, the messageId and the exitCallBack boolean.
 */
export const handleSubmittableEvents = (result: ISubmittableResult, exitCallBack: boolean) => {
  const { txHash, status, events, isError, internalError, isCompleted, dispatchError } = result
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

    let messageHash: string | undefined
    let messageId: string | undefined

    // Filter the events to get the needed data
    events.forEach(({ event: { data, method, section } }) => {
      if (method === 'XcmpMessageSent' && section === 'xcmpQueue' && 'messageHash' in data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messageHash = (data.messageHash as any).toString()
      }
      if (method === 'Sent' && section === 'polkadotXcm' && 'messageId' in data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messageId = (data.messageId as any).toString()
      }
    })
    if (!messageHash) throw new Error('Cross chain messageHash missing')
    if (!messageId) throw new Error('Parachain messageId missing')

    // Mark the transfer as complete and return
    exitCallBack = true
    return { messageHash, messageId, exitCallBack }
  }
}

export const getApiPromise = async (wssEndpoint?: string): Promise<ApiPromise | undefined> => {
  if (!wssEndpoint) return

  const wsProvider = new WsProvider(wssEndpoint)
  return await ApiPromise.create({
    provider: wsProvider,
  })
}
