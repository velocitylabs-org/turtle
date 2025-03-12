import { CompletedTransfer, StoredTransfer, TxStatus } from '@/models/transfer'
// eslint-disable-next-line import/named
import { AnyJson, OcelloidsAgentApi, OcelloidsClient, xcm } from '@sodazone/ocelloids-client'
import { getExplorerLink } from '@/utils/explorer'
import { NotificationSeverity, Notification } from '@/models/notification'
import { Direction, resolveDirection } from '@/utils/transfer'
import { Moonbeam } from '@/registry/mainnet/chains'
import { OCELLOIDS_API_Key } from '@/utils/consts'

type ResultNotification = {
  message: string
  severity: NotificationSeverity
  status: TxStatus
}

enum xcmNotificationType {
  Sent = 'xcm.sent',
  Received = 'xcm.received',
  Relayed = 'xcm.relayed',
  Timeout = 'xcm.timeout',
  Hop = 'xcm.hop',
  Bridge = 'xcm.bridge',
}

export const OCELLOIDS_API_KEY = OCELLOIDS_API_Key || ''

// Helper to filter the subscribable transfers only
export const getSubscribableTransfers = (transfers: StoredTransfer[]) =>
  transfers.filter(t => resolveDirection(t.sourceChain, t.destChain) === Direction.WithinPolkadot)

export const initOcelloidsClient = (API_KEY: string) => {
  if (!API_KEY) throw new Error('OCELLOIDS_API_KEY is undefined')
  return new OcelloidsClient({
    apiKey: API_KEY,
  })
}

export const getOcelloidsAgentApi = async (): Promise<
  OcelloidsAgentApi<xcm.XcmInputs> | undefined
> => {
  try {
    const OCLD_ClIENT = initOcelloidsClient(OCELLOIDS_API_KEY)

    await OCLD_ClIENT.health()
      .then(() => {})
      .catch(error => {
        const errorMsg = 'Occeloids health error'
        console.error(errorMsg, error)
        // captureException(errorMsg, error) - Sentry
        throw new Error(errorMsg)
      })

    return OCLD_ClIENT.agent<xcm.XcmInputs>('xcm')
  } catch (error) {
    console.log(error)
    // captureException(error) - Sentry
  }
}

/**
 * Subscribes to XCM events for a specific transfer using the Ocelloids agent API.
 *
 * @param ocelloidsAgentApi - The Ocelloids agent API instance.
 * @param transfer - The stored transfer.
 * @param remove - A callback function to remove the transfer once completed.
 * @param addCompletedTransfer - A callback function to add an ongoing transfer to the completed storage.
 * @param addNotification - A callback function to add a notification.
 *
 * It creates a WebSocket connection to listen for XCM events for the provided transfer
 * and processes event:`Received`, `Hop`, and `Timeout`.
 * - Handles the transfer record with the callbacks.
 * - Closes the WebSocket connection once the transfer is processed.
 * - Handles execution and connection errors.
 *
 */
export const xcmOcceloidsSubscribe = async (
  ocelloidsAgentApi: OcelloidsAgentApi<xcm.XcmInputs>,
  transfer: StoredTransfer,
  remove: (id: string) => void,
  addCompletedTransfer: (completedTransfer: CompletedTransfer) => void,
  updateStatus: (id: string) => void,
  addNotification: (notification: Omit<Notification, 'id'>) => void,
  updateProgress: (id: string) => void,
) => {
  try {
    const { id: txHash, sourceChain, destChain } = transfer

    const ws = await ocelloidsAgentApi.subscribe<xcm.XcmMessagePayload>(
      getSubscription(sourceChain.chainId, destChain.chainId),
      {
        onMessage: msg => {
          const {
            type,
            origin: { event, extrinsicHash },
            waypoint,
            destination,
          } = msg.payload
          const eventTxHash = getTxHashFromEvent(event, sourceChain.chainId, extrinsicHash)

          if (eventTxHash === txHash) {
            // Handle different XCM event types
            switch (type) {
              case xcmNotificationType.Sent:
                if (sourceChain.chainId === Moonbeam.chainId) updateStatus(txHash)
                break
              case xcmNotificationType.Relayed:
                break
              case xcmNotificationType.Hop: {
                const hopOutcome = waypoint.outcome
                if (hopOutcome === 'Fail') {
                  updateTransferStatus(
                    transfer,
                    xcmNotificationType.Hop,
                    remove,
                    addCompletedTransfer,
                    addNotification,
                    updateProgress,
                    hopOutcome,
                  )
                  ws.close()
                }
                break
              }
              case xcmNotificationType.Received: {
                const finalOutcome = 'outcome' in destination ? destination.outcome : undefined
                updateTransferStatus(
                  transfer,
                  xcmNotificationType.Received,
                  remove,
                  addCompletedTransfer,
                  addNotification,
                  updateProgress,
                  finalOutcome,
                )
                ws.close()
                break
              }
              case xcmNotificationType.Timeout:
                updateTransferStatus(
                  transfer,
                  xcmNotificationType.Timeout,
                  remove,
                  addCompletedTransfer,
                  addNotification,
                  updateProgress,
                )
                ws.close()
                break
              default: {
                const error = 'Unsupported Ocelloids XCM payload type'
                // captureException(error, { extra: { transfer } }) - Sentry
                console.error(error)
                break
              }
            }
          }
        },
        onAuthError: error => console.log('Auth Error', error),
        onError: error => {
          console.log('Ocelloids WebSocket Error', error)
          // captureException(error, { extra: { ocelloids: 'WebSocket Error' } }) - Sentry
        },
        onClose: event => console.log('WebSocket Closed', event.reason),
      },
      {
        onSubscriptionCreated: () => {},
        onSubscriptionError: console.error,
        onError: console.error,
      },
    )
  } catch (error) {
    console.log(error)
    // captureException(error, { extra: { transfer } }) - Sentry
  }
}

const getSubscription = (
  sourceChainId: number,
  destChainId: number,
  sender?: string,
  events?: xcm.XcmNotificationType[],
): xcm.XcmInputs => {
  const consensus = 'polkadot'
  return {
    senders: sender ? [sender] : '*',
    events: events ? events : '*',
    origins: [`urn:ocn:${consensus}:${sourceChainId}`],
    destinations: [`urn:ocn:${consensus}:${destChainId}`],
  }
}

const updateTransferStatus = (
  transfer: StoredTransfer,
  xcmMsgType: xcm.XcmNotificationType,
  remove: (id: string) => void,
  addCompletedTransfer: (completedTransfer: CompletedTransfer) => void,
  addNotification: (notification: Omit<Notification, 'id'>) => void,
  updateProgress: (id: string) => void,
  transferOutcome?: 'Success' | 'Fail',
) => {
  const notification = getNotification(xcmMsgType, transferOutcome)
  if (!notification) return

  updateProgress(transfer.id)

  setTimeout(() => {
    const { status, message, severity } = notification
    const explorerLink = getExplorerLink(transfer)

    remove(transfer.id)

    addCompletedTransfer({
      id: transfer.id,
      result: status,
      token: transfer.token,
      sourceChain: transfer.sourceChain,
      destChain: transfer.destChain,
      amount: transfer.amount,
      tokenUSDValue: transfer.tokenUSDValue ?? 0,
      fees: transfer.fees,
      sender: transfer.sender,
      recipient: transfer.recipient,
      date: transfer.date,
      ...(explorerLink && { explorerLink }),
    } satisfies CompletedTransfer)

    addNotification({
      message,
      severity,
      dismissible: true,
    })

    if (xcmMsgType === xcmNotificationType.Hop || xcmMsgType === xcmNotificationType.Timeout)
      console.log(new Error(`Ocelloids tracking error:${message}`))
    // captureException(new Error(`Ocelloids tracking error:${message}`), {
    //   tags: { XcmNotificationType: xcmMsgType, ...(transferOutcome && { transferOutcome }) },
    //   extra: { transfer },
    // }) - Sentry
  }, 1500)
}

const getNotification = (
  xcmMsgType: xcm.XcmNotificationType,
  transferOutcome?: 'Success' | 'Fail',
): ResultNotification | undefined => {
  switch (xcmMsgType) {
    case xcmNotificationType.Hop:
      if (transferOutcome === 'Success') return
      return {
        message: 'Transfer failed!',
        severity: NotificationSeverity.Error,
        status: TxStatus.Failed,
      }

    case xcmNotificationType.Timeout:
      return {
        message: 'Transfer timed out!',
        severity: NotificationSeverity.Warning,
        status: TxStatus.Undefined,
      }

    case xcmNotificationType.Received: {
      if (!transferOutcome)
        return {
          message: 'Something went wrong',
          severity: NotificationSeverity.Warning,
          status: TxStatus.Undefined,
        }

      return transferOutcome === 'Success'
        ? {
            message: 'Transfer completed!',
            severity: NotificationSeverity.Success,
            status: TxStatus.Succeeded,
          }
        : {
            message: 'Transfer failed!',
            severity: NotificationSeverity.Error,
            status: TxStatus.Failed,
          }
    }
    default:
      console.error('Unsupported Ocelloids XCM notification type')
      return
  }
}

/**
 * Finds the EVM transaction hash within an Ocelloids event.
 * This is only available for EVM-compatible parachains such as Moonbeam.
 *
 * @param event - The Ocelloids event of type `AnyJson`.
 * @returns The EVM transaction hash as a string or undefined.
 */

const getEvmTxHashFromEvent = (event: AnyJson): string | undefined => {
  return event &&
    typeof event === 'object' &&
    'extrinsic' in event &&
    event.extrinsic &&
    typeof event.extrinsic === 'object' &&
    'evmTxHash' in event.extrinsic
    ? (event.extrinsic.evmTxHash as string)
    : undefined
}

/**
 * Finds the corresponding tx hash from an Ocelloids event:
 * Handles Moonbeam-specific exceptions and falls back to the basic transaction hash for the remaining chains.
 *
 * @param event - The Ocelloids event of type `AnyJson`.
 * @param sourceChainId - The chain ID of the source chain.
 * @param extrinsicHash - The extrinsicHash to be returned if the EVM transaction exception is not met.
 * @returns The EVM transaction hash or the extrinsic hash.
 */
const getTxHashFromEvent = (
  event: AnyJson,
  sourceChainId: number,
  extrinsicHash?: `0x${string}`,
) => {
  const evmTxHashFromEvent = getEvmTxHashFromEvent(event)
  if (sourceChainId === Moonbeam.chainId && evmTxHashFromEvent) return evmTxHashFromEvent
  return extrinsicHash
}
