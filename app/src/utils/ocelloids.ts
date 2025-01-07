import { captureException } from '@sentry/nextjs'
import {
  CompletedTransfer,
  OngoingTransferWithDirection,
  StoredTransfer,
  TxStatus,
} from '@/models/transfer'
import { OcelloidsAgentApi, OcelloidsClient, xcm } from '@sodazone/ocelloids-client'
import { getExplorerLink, parachainsOnly } from './transfer'
import { NotificationSeverity, Notification } from '@/models/notification'
import { Direction, resolveDirection } from '@/services/transfer'
import { Interlay } from '@/registry/mainnet/chains'
import { Polkadot } from '@/registry/mainnet/tokens'

type ResultNotification = {
  message: string
  severity: NotificationSeverity
  status: TxStatus
}

const OCELLOIDS_API_KEY = process.env.NEXT_PUBLIC_OC_API_KEY_READ_WRITE || ''

// TMP Helper until Ocelloids supports Interlay transfers
export const isFromOrToInterlay = (
  transfer: StoredTransfer | OngoingTransferWithDirection,
): boolean => {
  const { sourceChain, destChain } = transfer
  return sourceChain.chainId === Interlay.chainId || destChain.chainId === Interlay.chainId
}

// TMP Helper until Ocelloids supports DOT transfers between non system chains.
export const isTransferringDotBetweenParachains = (
  transfer: StoredTransfer | OngoingTransferWithDirection,
): boolean => {
  return transfer.token.id === Polkadot.DOT.id && parachainsOnly(transfer)
}

// Helper to filter the subscribable transfers only
export const getSubscribableTransfers = (transfers: StoredTransfer[]) => {
  if (transfers.length === 0) return []
  return transfers.filter(t => {
    // Filters XCM transfers only
    if (resolveDirection(t.sourceChain, t.destChain) === Direction.WithinPolkadot) {
      // Exclude transfer if it contains Interlay as source or destination chain, or if DOT is transfered between parachains
      if (isFromOrToInterlay(t) || isTransferringDotBetweenParachains(t)) return false
      return true
    }
    return false
  })
}

export const initOcelloidsClient = () => {
  if (!OCELLOIDS_API_KEY || !OCELLOIDS_API_KEY.length)
    throw new Error('OCELLOIDS_API_KEY is undefined')
  return new OcelloidsClient({
    apiKey: OCELLOIDS_API_KEY,
  })
}

export const getOcelloidsAgentApi = async (): Promise<
  OcelloidsAgentApi<xcm.XcmInputs> | undefined
> => {
  try {
    const OCLD_ClIENT = initOcelloidsClient()

    await OCLD_ClIENT.health()
      .then(() => {})
      .catch(error => {
        const errorMsg = 'Occeloids health error'
        console.error(errorMsg, error)
        captureException(errorMsg, error)
        throw new Error(errorMsg)
      })

    return OCLD_ClIENT.agent<xcm.XcmInputs>('xcm')
  } catch (error) {
    console.log(error)
    captureException(error)
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
  addNotification: (notification: Omit<Notification, 'id'>) => void,
) => {
  try {
    const { id: txHash, sourceChain, destChain } = transfer

    const ws = await ocelloidsAgentApi.subscribe<xcm.XcmMessagePayload>(
      getSubscription(sourceChain.chainId, destChain.chainId),
      {
        onMessage: msg => {
          const payload = msg.payload
          if (payload.origin.extrinsicHash === txHash) {
            // Handle different XCM event types
            switch (payload.type) {
              case xcm.XcmNotificationType.Sent:
              case xcm.XcmNotificationType.Relayed:
                break
              case xcm.XcmNotificationType.Received:
                updateTransferStatus(
                  transfer,
                  xcm.XcmNotificationType.Received,
                  remove,
                  addCompletedTransfer,
                  addNotification,
                )
                ws.close()
                break
              case xcm.XcmNotificationType.Hop:
                updateTransferStatus(
                  transfer,
                  xcm.XcmNotificationType.Hop,
                  remove,
                  addCompletedTransfer,
                  addNotification,
                )
                break
              case xcm.XcmNotificationType.Timeout:
                updateTransferStatus(
                  transfer,
                  xcm.XcmNotificationType.Timeout,
                  remove,
                  addCompletedTransfer,
                  addNotification,
                )
                ws.close()
                break
              default: {
                const error = 'Unsupported Ocelloids XCM payload type'
                captureException(error, { extra: { transfer } })
                console.error(error)
                break
              }
            }
          }
        },
        onAuthError: error => console.log('Auth Error', error),
        onError: error => {
          console.log('Ocelloids WebSocket Error', error)
          captureException(error, { extra: { ocelloids: 'WebSocket Error' } })
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
    captureException(error, { extra: { transfer } })
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
    origin: `urn:ocn:${consensus}:${sourceChainId}`,
    senders: sender ? [sender] : '*',
    events: events ? events : '*',
    destinations: [`urn:ocn:${consensus}:${destChainId}`],
  }
}

const updateTransferStatus = (
  transfer: StoredTransfer,
  xcmMsgType: xcm.XcmNotificationType,
  remove: (id: string) => void,
  addCompletedTransfer: (completedTransfer: CompletedTransfer) => void,
  addNotification: (notification: Omit<Notification, 'id'>) => void,
) => {
  const notification = getNotification(xcmMsgType)
  if (!notification) return

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

  if (xcmMsgType === (xcm.XcmNotificationType.Hop || xcm.XcmNotificationType.Timeout))
    captureException(new Error(`Ocelloids tracking error:${message}`), { extra: { transfer } })
}

const getNotification = (xcmMsgType: xcm.XcmNotificationType): ResultNotification | undefined => {
  switch (xcmMsgType) {
    case xcm.XcmNotificationType.Hop:
      return {
        message: 'Transfer failed!',
        severity: NotificationSeverity.Error,
        status: TxStatus.Failed,
      }

    case xcm.XcmNotificationType.Timeout:
      return {
        message: 'Transfer timed out!',
        severity: NotificationSeverity.Warning,
        status: TxStatus.Undefined,
      }

    case xcm.XcmNotificationType.Received:
      return {
        message: 'Transfer completed!',
        severity: NotificationSeverity.Success,
        status: TxStatus.Succeeded,
      }

    default:
      console.error('Unsupported Ocelloids XCM notification type')
      return
  }
}
