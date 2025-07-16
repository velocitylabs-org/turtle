'use server'

import Transaction from '@/models/Transaction'
import txDetailView from '@/models/tx-detail-view'
import captureServerError from '@/utils/capture-server-error'
import dbConnect from '@/utils/db-connect'

export async function getTxDetail(id: string) {
  try {
    await dbConnect()
    const transaction = await Transaction.findById(id).lean()

    if (!transaction) {
      return null
    }

    return txDetailView.parse(transaction)
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    await captureServerError(error)
    throw error
  }
}
