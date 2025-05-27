import { z } from 'zod'
import { TxStatus } from '@/models/Transaction'

const transactionViewSchema = z.object({
  _id: z.any().transform(id => id?.toString() || ''),
  txDate: z
    .date()
    .or(z.string())
    .transform(date => (date instanceof Date ? date.toISOString() : date)),
  sourceTokenId: z.string(),
  sourceTokenSymbol: z.string(),
  sourceTokenAmount: z.number(),
  sourceTokenAmountUsd: z.number(),
  sourceChainUid: z.string(),
  sourceChainName: z.string(),
  destinationTokenId: z.string(),
  destinationTokenSymbol: z.string(),
  destinationChainUid: z.string(),
  destinationChainName: z.string(),
  status: z.enum(['pending', 'succeeded', 'failed']) as z.ZodType<TxStatus>,
})

export type TransactionView = z.infer<typeof transactionViewSchema>

export default transactionViewSchema
