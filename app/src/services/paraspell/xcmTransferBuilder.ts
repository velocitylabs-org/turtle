import {
  Builder,
  type GeneralBuilder,
  type TSendBaseOptionsWithSenderAddress,
  type TSubstrateChain,
} from '@paraspell/sdk'
import type { TransferParams } from '@/hooks/useTransfer'
import { getParaSpellNode, getParaspellToken } from '@/utils/paraspellTransfer'
import { toHuman } from '@/utils/transfer'

type TxBuilder = ReturnType<typeof Builder>

class XcmTransferBuilderManager {
  private static instance: XcmTransferBuilderManager
  private builders: Map<string, TxBuilder>

  private constructor() {
    this.builders = new Map()
  }

  static getInstance(): XcmTransferBuilderManager {
    if (!XcmTransferBuilderManager.instance) {
      XcmTransferBuilderManager.instance = new XcmTransferBuilderManager()
    }
    return XcmTransferBuilderManager.instance
  }

  createBuilder(params: TransferParams): TxBuilder {
    const { sourceChain, destinationChain, sourceToken, sourceAmount, recipient, sender } = params
    const wssEndpoint = sourceChain.rpcConnection
    const sourceChainNode = getParaSpellNode(sourceChain)
    const destinationChainNode = getParaSpellNode(destinationChain)

    if (!sourceChainNode || !destinationChainNode) {
      throw new Error('Failed to create builder: chain id not found.')
    }

    const currencyId = getParaspellToken(sourceToken, sourceChainNode)
    const key = txKey(params)

    if (this.builders.has(key)) return this.builders.get(key)!

    let builder: TxBuilder
    try {
      const senderAddress = sender.address
      builder = Builder({
        apiOverrides: { [sourceChainNode]: wssEndpoint },
        abstractDecimals: false,
      })
        .from(sourceChainNode as TSubstrateChain)
        .to(destinationChainNode as TSubstrateChain)
        .currency({ ...currencyId, amount: sourceAmount })
        .address(recipient)
        .senderAddress(senderAddress)

      this.builders.set(key, builder)
    } catch (error) {
      console.error('Failed to create builder: ', error)
      throw error
    }

    return builder
  }

  getBuilder(params: TransferParams) {
    const key = txKey(params)
    const existing = this.builders.get(key)
    return existing ?? this.createBuilder(params)
  }

  async createTransferTx(params: TransferParams) {
    try {
      const builder = this.getBuilder(params as TransferParams) as GeneralBuilder<TSendBaseOptionsWithSenderAddress>
      const senderAddress = params.sender.address
      builder.senderAddress(senderAddress)
      return await builder.build()
    } catch (error) {
      console.error('Failed to create transfer tx: ', error)
      throw error
    }
  }

  async isExistentialDepositMetAfterTransfer(params: TransferParams) {
    try {
      const builder = this.getBuilder(params)
      return await (builder as GeneralBuilder<TSendBaseOptionsWithSenderAddress>).verifyEdOnDestination()
    } catch (error) {
      console.error('Failed to verify existential deposit: ', error)
      return false
    }
  }

  async dryRun(params: TransferParams) {
    try {
      const builder = this.getBuilder(params)
      return await (builder as GeneralBuilder<TSendBaseOptionsWithSenderAddress>).dryRun()
    } catch (error) {
      console.error('Failed to dry run: ', error)
      throw error
    }
  }

  async getTransferableAmount(
    params: Pick<
      TransferParams,
      'sourceChain' | 'destinationChain' | 'sourceToken' | 'recipient' | 'sender' | 'sourceAmount'
    >,
  ) {
    try {
      const builder = this.getBuilder(params as TransferParams)
      return await (builder as GeneralBuilder<TSendBaseOptionsWithSenderAddress>).getTransferableAmount()
    } catch (error) {
      console.error('Failed to get transferable amount: ', error)
      return null
    }
  }

  // Origin and destination fees
  async getXcmFee(
    params: Pick<
      TransferParams,
      'sourceChain' | 'destinationChain' | 'sourceToken' | 'recipient' | 'sender' | 'sourceAmount'
    >,
  ) {
    try {
      const builder = this.getBuilder(params as TransferParams)
      return await (builder as GeneralBuilder<TSendBaseOptionsWithSenderAddress>).getXcmFee()
    } catch (error) {
      console.error('Failed to get transferable amount: ', error)
      throw error
    }
  }

  async getOriginXcmFee(
    params: Pick<
      TransferParams,
      'sourceChain' | 'destinationChain' | 'sourceToken' | 'recipient' | 'sender' | 'sourceAmount'
    >,
  ) {
    try {
      const builder = this.getBuilder(params as TransferParams)
      return await (builder as GeneralBuilder<TSendBaseOptionsWithSenderAddress>).getOriginXcmFee()
    } catch (error) {
      console.error('Failed to get transferable amount: ', error)
      throw error
    }
  }

  async disconnect(params: TransferParams) {
    try {
      const builder = this.getBuilder(params)
      await (builder as GeneralBuilder<TSendBaseOptionsWithSenderAddress>).disconnect()
      this.removeBuilder(params)
      return true
    } catch (error) {
      console.error('Failed to disconnect: ', error)
      return false
    }
  }

  removeBuilder(params: TransferParams) {
    const key = txKey(params)
    this.builders.delete(key)
  }

  builderList() {
    return this.builders
  }
}

function txKey(params: TransferParams): string {
  const { sourceChain, destinationChain, sourceToken, sourceAmount, recipient, sender } = params
  const wssEndpoint = sourceChain.rpcConnection
  const amount = toHuman(sourceAmount, sourceToken) // Convert large numeric amount to human-readable format to prevent long key strings
  const senderAddress = sender.address
  return [
    sourceChain.uid,
    destinationChain.uid,
    sourceToken.id,
    amount, // Source amount
    recipient,
    senderAddress,
    ...(wssEndpoint ? [encodeURIComponent(wssEndpoint)] : []), // Encode URL to avoid delimiter conflicts
  ].join('|')
}

const xcmTransferBuilderManager = XcmTransferBuilderManager.getInstance()
export default xcmTransferBuilderManager
