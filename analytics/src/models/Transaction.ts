import mongoose from 'mongoose'

export type txStatus = 'succeeded' | 'failed' | 'undefined'

export interface TransactionModel extends mongoose.Document {
  txHashId: string

  sourceTokenId: string
  sourceTokenName: string
  sourceTokenSymbol: string
  sourceTokenAmount: number // Amount of tokens sent from a source chain
  sourceTokenAmountUsd: number // Transaction amount converted to USD at the time of transaction
  sourceTokenUSDValue: number // USD value per token at transaction time
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
  status: txStatus
  migrated: boolean // For transactions migrated from an old analytics source
  oldFormat: boolean // For transactions migrated from an old analytics source with an old format
}

const transactionSchema = new mongoose.Schema<TransactionModel>(
  {
    txHashId: { type: String, unique: true, required: true },

    sourceTokenId: { type: String, required: true },
    sourceTokenName: { type: String, required: true },
    sourceTokenSymbol: { type: String, required: true },
    sourceTokenAmount: { type: Number, required: true }, // Amount of tokens sent from a source chain
    sourceTokenAmountUsd: { type: Number, required: true }, // Transaction amount converted to USD at the time of transaction
    sourceTokenUSDValue: { type: Number, required: true }, // USD value per token at transaction time
    sourceTokenAmountRaw: { type: String, required: true }, // For debugging, without using to human helper

    destinationTokenId: { type: String, required: true },
    destinationTokenName: { type: String, required: true },
    destinationTokenSymbol: { type: String, required: true },
    destinationTokenAmount: { type: Number },
    destinationTokenAmountUsd: { type: Number },
    destinationTokenUSDValue: { type: Number },
    destinationTokenAmountRaw: { type: String },

    feesTokenId: { type: String, required: true },
    feesTokenName: { type: String, required: true },
    feesTokenSymbol: { type: String, required: true },
    feesTokenAmount: { type: Number, required: true },
    feesTokenAmountUsd: { type: Number, required: true },
    feesTokenAmountRaw: { type: String, required: true },

    bridgingFeeTokenId: { type: String },
    bridgingFeeTokenName: { type: String },
    bridgingFeeTokenSymbol: { type: String },
    bridgingFeeTokenAmount: { type: Number },
    bridgingFeeTokenAmountUsd: { type: Number },
    bridgingFeeAmountRaw: { type: String },

    senderAddress: { type: String, required: true },
    recipientAddress: { type: String, required: true },

    sourceChainUid: { type: String, required: true },
    sourceChainId: { type: String, required: true },
    sourceChainName: { type: String, required: true },
    sourceChainNetwork: { type: String, required: true },

    destinationChainUid: { type: String, required: true },
    destinationChainId: { type: String, required: true },
    destinationChainName: { type: String, required: true },
    destinationChainNetwork: { type: String, required: true },

    txDate: { type: Date, required: true },
    hostedOn: { type: String, required: true },
    status: {
      type: String,
      enum: ['succeeded', 'failed', 'undefined'],
      required: true,
      default: 'succeeded',
    },
    migrated: { type: Boolean, required: true, default: false }, // For transactions migrated from an old analytics source
    oldFormat: { type: Boolean, required: true, default: false }, // For transactions migrated from an old analytics source with an old format
  },
  { timestamps: true },
)

transactionSchema.index({ txDate: -1 }) // For sorting by date in descending order
transactionSchema.index({ status: 1 }) // For filtering by status
transactionSchema.index({ sourceChainUid: 1 }) // For filtering by source chain
transactionSchema.index({ destinationChainUid: 1 }) // For filtering by destination chain
transactionSchema.index({ sourceTokenId: 1 }) // For filtering by source token
transactionSchema.index({ destinationTokenId: 1 }) // For filtering by destination token
transactionSchema.index({ sourceTokenAmountUsd: 1 }) // For aggregations on volume
transactionSchema.index({ status: 1, txDate: -1 }) // For combined status and date queries
transactionSchema.index({ status: 1, sourceTokenId: 1 }) // For token volume by status queries

export default mongoose.models.Transaction ||
  mongoose.model<TransactionModel>('Transaction', transactionSchema)
