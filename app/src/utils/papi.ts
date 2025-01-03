import { TxEvent } from 'polkadot-api'

export const handleObservableEvent = (event: TxEvent) => {
  // event.type === 'broadcasted'
  console.log('Tx type: ', event.type)
  console.log('Tx txHash: ', event.txHash)
}
