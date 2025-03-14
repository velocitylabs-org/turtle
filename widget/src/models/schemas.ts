import { z } from 'zod'

import { Chain } from '@/models/chain'
import { ManualRecipient, TokenAmount } from '@/models/select'
import { Token } from '@/models/token'

const originSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('Ethereum'), bridge: z.enum(['Snowbridge']) }),
  z.object({ type: z.literal('Polkadot'), paraId: z.number() }),
])

export const tokenSchema: z.ZodType<Token> = z.object({
  id: z.string(),
  name: z.string(),
  logoURI: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  address: z.string(),
  multilocation: z.string(),
  coingeckoId: z.string().optional(),
  origin: originSchema,
})

export const chainSchema: z.ZodType<Chain> = z.object({
  uid: z.string(),
  name: z.string(),
  logoURI: z.string(),
  chainId: z.number(),
  network: z.enum(['Ethereum', 'Polkadot']),
  supportedAddressTypes: z.array(z.enum(['evm', 'ss58'])),
  walletType: z.enum(['EVM', 'Substrate', 'SubstrateEVM']),
  destinationFeeDOT: z.string().optional(),
  rpcConnection: z.string().optional(),
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
