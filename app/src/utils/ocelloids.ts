import { StoredTransfer } from '@/models/transfer'
import { OcelloidsAgentApi, OcelloidsClient, xcm } from '@sodazone/ocelloids-client'

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
      .then(() => {})
      .catch(error => {
        console.error('Occeloids health error', error)
        throw new Error('Occeloids health failed')
      })

    return OCLD_ClIENT.agent<xcm.XcmInputs>('xcm')
  } catch (error) {
    console.log(error)
  }
}

export const xcmOcceloidsSubscribe = async (
  ocelloidsAgentApi: OcelloidsAgentApi<xcm.XcmInputs>,
  transfer: StoredTransfer,
) => {
  try {
    if (!ocelloidsAgentApi) throw new Error('Occeloids Agent is undefined')
    const { id: txHash, sourceChain, destChain } = transfer
    const ws = await ocelloidsAgentApi.subscribe<xcm.XcmMessagePayload>(
      getSubscription(sourceChain.chainId, destChain.chainId),
      {
        onMessage: msg => {
          const payload = msg.payload
          if (payload.origin.extrinsicHash === txHash) {
            // Handle different XCM event types
            switch (payload.type) {
              case 'xcm.sent':
                console.log('SENT', payload)
                break
              case 'xcm.relayed':
                console.log('RELAYED', payload)
                break
              case 'xcm.hop':
                console.log('HOP - TRANSFER FAILED', payload)
                break
              case 'xcm.received':
                console.log('RECEIVED - TRANSFER RECEIVED', payload)
                ws.close()
                break
              case 'xcm.timeout':
                console.log('TIMEOUT - TRANSFER FAILED', payload)
                ws.close()
                break
              default:
                throw new Error('Unsupported XCM payload type')
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
  }
}

type Consensus = 'polkadot'

const getSubscription = (
  sourceChainId: number,
  destChainId: number,
  sender?: string,
  events?: xcm.XcmNotificationType[],
  consensus: Consensus = 'polkadot',
): xcm.XcmInputs => {
  return {
    origin: `urn:ocn:${consensus}:${sourceChainId}`,
    senders: sender ? [sender] : '*',
    events: events ? events : '*',
    destinations: [`urn:ocn:${consensus}:${destChainId}`],
  }
}
