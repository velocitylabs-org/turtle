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

type ResultData = {
  message: string
  severity: NotificationSeverity
  status: TxStatus
}

const apiKey = process.env.NEXT_PUBLIC_OC_API_KEY_READ_WRITE || ''

// TMP Helper until Ocelloids supports Interlay transfers
export const isFromOrToInterlay = (
  transfer: StoredTransfer | OngoingTransferWithDirection,
): boolean => {
  const { sourceChain, destChain } = transfer
  return sourceChain.chainId === Interlay.chainId || destChain.chainId === Interlay.chainId
}

// TMP Helper until Ocelloids supports DOT transfers between non system chains.
export const isTokenDotBtwParachains = (
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
      if (isFromOrToInterlay(t) || isTokenDotBtwParachains(t)) return false
      return true
    }
    return false
  })
}

export const initOcelloidsClient = () =>
  new OcelloidsClient({
    apiKey,
  })

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
                console.log('SENT', payload)
                break
              case xcm.XcmNotificationType.Relayed:
                console.log('RELAYED', payload)
                break
              case xcm.XcmNotificationType.Received:
                console.log('TRANSFER RECEIVED', payload)
                handleTransferRecord(
                  transfer,
                  xcm.XcmNotificationType.Received,
                  remove,
                  addCompletedTransfer,
                  addNotification,
                )
                ws.close()
                break
              case xcm.XcmNotificationType.Hop:
                console.log('HOP - TRANSFER FAILED', payload)
                handleTransferRecord(
                  transfer,
                  xcm.XcmNotificationType.Hop,
                  remove,
                  addCompletedTransfer,
                  addNotification,
                )
                break
              case xcm.XcmNotificationType.Timeout:
                console.log('TRACKING TIMED OUT', payload)
                handleTransferRecord(
                  transfer,
                  xcm.XcmNotificationType.Timeout,
                  remove,
                  addCompletedTransfer,
                  addNotification,
                )
                ws.close()
                break
              default: {
                console.error('Unsupported XCM payload type')
                break
              }
            }
          }
        },
        onAuthError: error => console.log('Auth Error', error),
        onError: error => console.log('WebSocket Error', error),
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

const handleTransferRecord = (
  transfer: StoredTransfer,
  xcmMsgType: xcm.XcmNotificationType,
  remove: (id: string) => void,
  addCompletedTransfer: (completedTransfer: CompletedTransfer) => void,
  addNotification: (notification: Omit<Notification, 'id'>) => void,
) => {
  const resultData = getResultData(xcmMsgType)
  if (!resultData) return

  const { status, message, severity } = resultData
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

const getResultData = (xcmMsgType: xcm.XcmNotificationType): ResultData | undefined => {
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
