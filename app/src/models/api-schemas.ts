import { z } from 'zod'

import { Direction } from '@/services/transfer'
import { chainSchema, tokenSchema } from './schemas'
import { OngoingTransferWithDirection } from './transfer'

export const transferSchema: z.ZodType<OngoingTransferWithDirection> = z.object({
  id: z.string(),
  sourceChain: chainSchema,
  destChain: chainSchema,
  sender: z.string(),
  recipient: z.string(),
  token: tokenSchema,
  date: z.coerce.date(),
  direction: z.nativeEnum(Direction),
  crossChainMessageHash: z.string().optional(),
  parachainMessageId: z.string().optional(),
  sourceChainExtrinsicIndex: z.string().optional(),
})

export const ongoingTransfersSchema = z.object({
  ongoingTransfers: z.array(transferSchema),
})

export type ongoingTransfersSchema = z.infer<typeof ongoingTransfersSchema>
