import { z } from 'zod'
import { TxStatus } from './transfer'

const logoURISchema = z.string().or(z.object({}).passthrough())

const looseChainSchema = z.object({
  uid: z.string(),
  name: z.string(),
  logoURI: logoURISchema,
  chainId: z.number(),
  network: z.enum(['Ethereum', 'Polkadot', 'Kusama', 'Arbitrum']),

  supportedAddressTypes: z.array(z.enum(['evm', 'ss58'])).optional(),
  walletType: z.enum(['EVM', 'Substrate', 'SubstrateEVM']).optional(),
  destinationFeeDOT: z.string().optional(),
  rpcConnection: z.string().optional(),
  supportExecuteExtrinsic: z.boolean().optional(),
})

const looseTokenSchema = z.object({
  id: z.string(),
  name: z.string(),
  logoURI: logoURISchema,
  symbol: z.string(),
  decimals: z.number(),
  address: z.string().optional(),
  location: z.any().optional(),
  coingeckoId: z.string().optional(),
  origin: z.any().optional(),
})

const amountInfoSchema = z.object({
  amount: z.union([z.string(), z.bigint(), z.number()]),
  token: looseTokenSchema,
  inDollars: z.number(),
})

const feeDetailsSchema = z.object({
  title: z.enum([
    'Execution fees',
    'Delivery fees',
    'Bridging fees',
    'Routing fees',
    'Swap fees',
    'Transfer fees',
    'Broker fees',
    'Deposit fees',
  ]),
  chain: looseChainSchema,
  amount: amountInfoSchema,
  sufficient: z.enum(['sufficient', 'insufficient', 'undetermined']),
})

const transferResultSchema = z.union([
  z.nativeEnum(TxStatus),
  z.literal('Succeeded'),
  z.literal('failed'),
  z.literal('Undefined'),
])

const completedTransferSchema = z.object({
  id: z.string(),
  result: transferResultSchema,
  sourceToken: looseTokenSchema,
  sourceAmount: z.string(),
  sourceChain: looseChainSchema,
  destChain: looseChainSchema,
  fees: z.array(feeDetailsSchema),
  sender: z.string(),
  recipient: z.string(),
  date: z.string(),

  destinationAmount: z.string().optional(),
  destinationToken: looseTokenSchema.optional(),
  sourceTokenUSDValue: z.number().optional(),
  destinationTokenUSDValue: z.number().optional(),
  explorerLink: z.string().optional(),
  errors: z.array(z.string()).optional(),
  minTokenRecieved: z.string().optional(),
  minTokenRecievedValue: z.number().optional(),
})

export default completedTransferSchema
