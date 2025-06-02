import mongoose from 'mongoose'

export type TxStatus = 'succeeded' | 'failed' | 'undefined'
export const txStatusOptions = [
  'succeeded',
  'failed',
  'undefined',
] as const satisfies readonly TxStatus[]

export interface TransactionModel {
  txHashId: string

  sourceTokenId: string
  sourceTokenName: string
  sourceTokenSymbol: string
  sourceTokenAmount: number // Amount of tokens sent from a source chain
  sourceTokenAmountUsd: number // Transaction amount converted to USD at the time of transaction
  sourceTokenUSDValue?: number // USD value per token at transaction time
  sourceTokenAmountRaw: string // For debugging, without using to human helper

  destinationTokenId: string
  destinationTokenName: string
  destinationTokenSymbol: string
  destinationTokenAmount?: number
  destinationTokenAmountUsd?: number
  destinationTokenUSDValue?: number
  destinationTokenAmountRaw?: string

  feesTokenId: string
  feesTokenName: string
  feesTokenSymbol: string
  feesTokenAmount: number
  feesTokenAmountUsd: number
  feesTokenAmountRaw: string

  bridgingFeeTokenId?: string
  bridgingFeeTokenName?: string
  bridgingFeeTokenSymbol?: string
  bridgingFeeTokenAmount?: number
  bridgingFeeTokenAmountUsd?: number
  bridgingFeeAmountRaw?: string

  senderAddress: string
  recipientAddress: string

  sourceChainUid: string
  sourceChainId: string
  sourceChainName: string
  sourceChainNetwork: string

  destinationChainUid: string
  destinationChainId: string
  destinationChainName: string
  destinationChainNetwork: string

  txDate: Date
  hostedOn: string
  status: TxStatus
  migrated: boolean // For transactions migrated from an old analytics source
  oldFormat: boolean // For transactions migrated from an old analytics source with an old format
}

export interface TransactionMongooseModel extends mongoose.Document, TransactionModel {}

const transactionSchema = new mongoose.Schema<TransactionMongooseModel>(
  {
    txHashId: { type: String, unique: true, required: true, validate: nonEmptyString },

    sourceTokenId: { type: String, required: true, validate: nonEmptyString },
    sourceTokenName: { type: String, required: true, validate: nonEmptyString },
    sourceTokenSymbol: { type: String, required: true, validate: nonEmptyString },
    sourceTokenAmount: { type: Number, required: true }, // Amount of tokens sent from a source chain
    sourceTokenAmountUsd: { type: Number, required: true }, // Transaction amount converted to USD at the time of transaction
    sourceTokenUSDValue: { type: Number }, // USD value per token at transaction time
    sourceTokenAmountRaw: { type: String, required: true, validate: nonEmptyString }, // For debugging, without using to human helper

    destinationTokenId: { type: String, required: true, validate: nonEmptyString },
    destinationTokenName: { type: String, required: true, validate: nonEmptyString },
    destinationTokenSymbol: { type: String, required: true, validate: nonEmptyString },
    destinationTokenAmount: { type: Number },
    destinationTokenAmountUsd: { type: Number },
    destinationTokenUSDValue: { type: Number },
    destinationTokenAmountRaw: { type: String },

    feesTokenId: { type: String, required: true, validate: nonEmptyString },
    feesTokenName: { type: String, required: true, validate: nonEmptyString },
    feesTokenSymbol: { type: String, required: true, validate: nonEmptyString },
    feesTokenAmount: { type: Number, required: true },
    feesTokenAmountUsd: { type: Number, required: true },
    feesTokenAmountRaw: { type: String, required: true, validate: nonEmptyString },

    bridgingFeeTokenId: { type: String },
    bridgingFeeTokenName: { type: String },
    bridgingFeeTokenSymbol: { type: String },
    bridgingFeeTokenAmount: { type: Number },
    bridgingFeeTokenAmountUsd: { type: Number },
    bridgingFeeAmountRaw: { type: String },

    senderAddress: { type: String, required: true, validate: nonEmptyString },
    recipientAddress: { type: String, required: true, validate: nonEmptyString },

    sourceChainUid: { type: String, required: true, validate: nonEmptyString },
    sourceChainId: { type: String, required: true, validate: nonEmptyString },
    sourceChainName: { type: String, required: true, validate: nonEmptyString },
    sourceChainNetwork: { type: String, required: true, validate: nonEmptyString },

    destinationChainUid: { type: String, required: true, validate: nonEmptyString },
    destinationChainId: { type: String, required: true, validate: nonEmptyString },
    destinationChainName: { type: String, required: true, validate: nonEmptyString },
    destinationChainNetwork: { type: String, required: true, validate: nonEmptyString },

    txDate: { type: Date, required: true },
    hostedOn: { type: String, required: true, validate: nonEmptyString },
    status: {
      type: String,
      enum: txStatusOptions,
      required: true,
      default: 'succeeded',
      validate: nonEmptyString,
      set: (v: string) => {
        if (!v) return 'succeeded'
        const lowercased = v.toLowerCase() as TxStatus // Convert to lowercase since the frontend sends status in uppercase format
        return txStatusOptions.includes(lowercased) ? lowercased : 'succeeded'
      },
    },
    migrated: { type: Boolean, required: true, default: false }, // For transactions migrated from an old analytics source
    oldFormat: { type: Boolean, required: true, default: false }, // For transactions migrated from an old analytics source with an old format
  },
  { timestamps: true },
)

transactionSchema.index({ txHashId: -1 }) // For querying by txHashId in descending order
transactionSchema.index({ txDate: -1 }) // For sorting by date in descending order
transactionSchema.index({ status: 1 }) // For filtering by status
transactionSchema.index({ sourceChainUid: 1 }) // For filtering by source chain
transactionSchema.index({ destinationChainUid: 1 }) // For filtering by destination chain
transactionSchema.index({ sourceTokenId: 1 }) // For filtering by source token
transactionSchema.index({ destinationTokenId: 1 }) // For filtering by destination token
transactionSchema.index({ sourceTokenAmountUsd: 1 }) // For aggregations on volume
transactionSchema.index({ status: 1, txDate: -1 }) // For combined status and date queries
transactionSchema.index({ status: 1, sourceTokenId: 1 }) // For token volume by status queries

function nonEmptyString(v: string) {
  return v && v.length > 0
}

const TransactionModel =
  mongoose.models?.Transaction ||
  mongoose.model<TransactionMongooseModel>('Transaction', transactionSchema)

export default TransactionModel
