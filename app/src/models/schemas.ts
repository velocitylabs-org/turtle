import { z } from 'zod'

import { Chain, Network } from '@/models/chain'
import { ManualRecipient, TokenAmount } from '@/models/select'
import { Token } from '@/models/token'

export const chainSchema: z.ZodType<Chain> = z.object({
  uid: z.string(),
  name: z.string(),
  logoURI: z.string(),
  chainId: z.number(),
  network: z.nativeEnum(Network),
})

export const tokenSchema: z.ZodType<Token> = z.object({
  id: z.string(),
  name: z.string(),
  logoURI: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  address: z.string(),
})

export const tokenAmountSchema: z.ZodType<TokenAmount> = z.object({
  token: tokenSchema.nullable().refine(val => val !== null, { message: 'Token is required' }),
  amount: z
    .number()
    .gt(0, 'Amount must be larger than 0')
    .nullable()
    .refine(val => val !== null, { message: 'Required', path: ['amount'] }),
})

export const manualRecipientSchema: z.ZodType<ManualRecipient> = z.object({
  enabled: z.boolean(),
  address: z.string(),
})

export const schema = z.object({
  sourceChain: chainSchema
    .nullable()
    .refine(val => val !== null, { message: 'Source chain is required' }),
  destinationChain: chainSchema.refine(val => val !== null, {
    message: 'Destination chain is required',
  }),
  tokenAmount: tokenAmountSchema,
  manualRecipient: manualRecipientSchema,
})
