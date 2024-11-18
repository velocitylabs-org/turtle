// eslint-disable-next-line import/no-namespace
import * as Firebase from '@/config/firebase'

export interface TransferMetric {
  id?: string
  sender: string
  sourceChain: string
  token: string
  amount: string
  destinationChain: string
  usdValue: number
  usdFees: number
  recipient: string
  date: string
}

export async function trackTransferMetrics(data: TransferMetric) {
  try {
    await Firebase.setDoc(
      Firebase.doc(Firebase.db, 'turtle-usage', data.id ?? crypto.randomUUID()),
      {
        amount: data.amount,
        date: data.date,
        destinationChain: data.destinationChain,
        recipient: data.recipient,
        sender: data.sender,
        sourceChain: data.sourceChain,
        token: data.token,
        usdFees: data.usdFees,
        usdValue: data.usdValue,
      },
    )
  } catch (error) {
    console.error('Error, was not able to log transaction to Firestore: ', error)
  }
}
