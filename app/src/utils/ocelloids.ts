import { OcelloidsClient, xcm } from '@sodazone/ocelloids-client'

const apiKey = process.env.NEXT_PUBLIC_OC_API_KEY_READ_WRITE || ''

export const initOcelloidsClient = () =>
  new OcelloidsClient({
    apiKey,
  })

export const xcmOcceloidsSubscribe = async (txHash?: string) => {
  try {
    console.log({ apiKey })
    const OCLD_ClIENT = initOcelloidsClient()
    OCLD_ClIENT.health().then(console.log).catch(console.error)

    const xcmAgent = OCLD_ClIENT.agent<xcm.XcmInputs>('xcm')
    console.log('xcmAgent', xcmAgent)
    const ws = await xcmAgent.subscribe<xcm.XcmMessagePayload>(
      // {
      //     origin: 'urn:ocn:polkadot:0', // Polkdaot relaychain
      //     senders: '*',
      //     events: '*',
      //     destinations: [
      //         'urn:ocn:polkadot:1000', // AH
      //         'urn:ocn:polkadot:2030', // Bifrost
      //     ],
      // },
      'test-polkadot-xcm', // Permanent Subscribtion POSTed on Ocelloids API from Polkadot
      {
        onMessage: msg => {
          console.log('inside subscribtion')
          const payload = msg.payload
          if (
            // match origin message by extrinsic hash
            payload.origin.extrinsicHash === txHash
          ) {
            // Handle different XCM event types
            switch (payload.type) {
              case 'xcm.sent':
                console.log('SENT', payload)
                break
              case 'xcm.relayed':
                console.log('RELAYED', payload)
                break
              case 'xcm.hop':
                console.log('HOP', payload)
                break
              case 'xcm.received':
                console.log('RECEIVED', payload)
                ws.close()
                break
              case 'xcm.timeout':
                console.log('TIMEOUT', payload)
                ws.close()
                break
              case 'xcm.bridge':
                console.log('BRIDGED', payload)
                break
              default:
                throw new Error('Unsupported XCM payload type')
            }
          }
        },
        // Handle WebSocket errors
        onError: error => console.log('WebSocket Error:', error),
        // Handle WebSocket closure
        onClose: event => console.log('WebSocket Closed:', event.reason),
      },
    )
  } catch (error) {
    console.log('Catch', error)
  }
}
