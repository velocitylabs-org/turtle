import { z } from 'zod'
import { type TxStatus, txStatusOptions } from '@/models/Transaction'

const txDetailViewSchema = z.object({
  _id: z.any().transform((id) => id?.toString() || ''),
  txHashId: z.string(),
  sourceTokenId: z.string(),
  sourceTokenAmount: z.number(),
  sourceTokenAmountUsd: z.number(),
  destinationTokenId: z.string(),
  destinationTokenAmount: z.number().optional(),
  destinationTokenAmountUsd: z.number().optional(),
  feesTokenId: z.string(),
  feesTokenAmount: z.number(),
  feesTokenAmountUsd: z.number(),
  bridgingFeeTokenId: z.string().optional(),
  bridgingFeeTokenAmount: z.number().optional(),
  bridgingFeeTokenAmountUsd: z.number().optional(),
  senderAddress: z.string(),
  recipientAddress: z.string(),
  sourceChainUid: z.string(),
  destinationChainUid: z.string(),
  txDate: z
    .date()
    .or(z.string())
    .transform((date) => (date instanceof Date ? date.toISOString() : date)),
  hostedOn: z.string(),
  isSwap: z.boolean(),
  status: z.enum(txStatusOptions) as z.ZodType<TxStatus>,
})

export type TxDetailView = z.infer<typeof txDetailViewSchema>

export default txDetailViewSchema
