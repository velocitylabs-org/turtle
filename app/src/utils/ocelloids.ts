import { CompletedTransfer, StoredTransfer, TxStatus } from '@/models/transfer'
import { OcelloidsAgentApi, OcelloidsClient, xcm } from '@sodazone/ocelloids-client'
import { getExplorerLink } from './transfer'
import { NotificationSeverity, Notification } from '@/models/notification'

const apiKey = process.env.NEXT_PUBLIC_OC_API_KEY_READ_WRITE || ''

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
      .then(() => { })
      .catch(error => {
        console.error('Occeloids health error', error)
        throw new Error('Occeloids health failed')
      })

    return OCLD_ClIENT.agent<xcm.XcmInputs>('xcm')
  } catch (error) {
    console.log(error)
  }
}

type ResultData = {
  message: string
  severity: NotificationSeverity
  status: TxStatus
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

export const xcmOcceloidsSubscribe = async (
  ocelloidsAgentApi: OcelloidsAgentApi<xcm.XcmInputs>,
  transfer: StoredTransfer,
  remove: (id: string) => void,
  addCompletedTransfer: (completedTransfer: CompletedTransfer) => void,
  addNotification: (notification: Omit<Notification, 'id'>) => void,
) => {
  try {
    const { id: txHash, sourceChain, destChain } = transfer
    const explorerLink = getExplorerLink(transfer)

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
                  remove,
                  addCompletedTransfer,
                  addNotification,
                  xcm.XcmNotificationType.Received,
                  explorerLink,
                )
                ws.close()
                break
              case xcm.XcmNotificationType.Hop:
                console.log('HOP - TRANSFER FAILED', payload)
                handleTransferRecord(
                  transfer,
                  remove,
                  addCompletedTransfer,
                  addNotification,
                  xcm.XcmNotificationType.Hop,
                  explorerLink,
                )
                break
              case xcm.XcmNotificationType.Timeout:
                console.log('TRACKING TIMED OUT', payload)
                handleTransferRecord(
                  transfer,
                  remove,
                  addCompletedTransfer,
                  addNotification,
                  xcm.XcmNotificationType.Timeout,
                  explorerLink,
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
        onSubscriptionCreated: () => { },
        onSubscriptionError: console.error,
        onError: console.error,
      },
    )
  } catch (error) {
    console.log(error)
  }
}

const handleTransferRecord = (
  transfer: StoredTransfer,
  remove: (id: string) => void,
  addCompletedTransfer: (completedTransfer: CompletedTransfer) => void,
  addNotification: (notification: Omit<Notification, 'id'>) => void,
  xcmMsgType: xcm.XcmNotificationType,
  explorerLink?: string,
) => {
  const resultData = getResultData(xcmMsgType)
  if (!resultData) return

  const { status, message, severity } = resultData

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
      console.error("Unsupported Ocelloids XCM notification type")
      return
  }
}
