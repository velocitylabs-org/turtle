import { z } from 'zod'
import { txStatusOptions, TxStatus } from '@/models/Transaction'

const swapViewSchema = z.object({
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
  destinationTokenAmount: z.number(),
  destinationTokenAmountUsd: z.number(),
  destinationChainUid: z.string(),
  destinationChainName: z.string(),
  status: z.enum(txStatusOptions) as z.ZodType<TxStatus>,
})

export type SwapView = z.infer<typeof swapViewSchema>

export default swapViewSchema
