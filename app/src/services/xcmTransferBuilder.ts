import {
  Builder,
  GeneralBuilder,
  TNodeDotKsmWithRelayChains,
  TSendBaseOptionsWithSenderAddress,
} from '@paraspell/sdk'
import { TransferParams } from '@/hooks/useTransfer'
import { getParaSpellNode, getParaspellToken } from '@/utils/paraspellTransfer'

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
      builder = Builder(wssEndpoint)
        .from(sourceChainNode as TNodeDotKsmWithRelayChains)
        .to(destinationChainNode as TNodeDotKsmWithRelayChains)
        .currency({ ...currencyId, amount: sourceAmount })
        .address(recipient)
        .senderAddress(sender.address)

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

  async isExistentialDepositMetAfterTransfer(params: TransferParams) {
    try {
      const builder = this.getBuilder(params)
      return await (
        builder as GeneralBuilder<TSendBaseOptionsWithSenderAddress>
      ).verifyEdOnDestination()
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

  async getTransferableAmount(params: TransferParams) {
    const builder = this.getBuilder(params)
    return await (
      builder as GeneralBuilder<TSendBaseOptionsWithSenderAddress>
    ).getTransferableAmount()
  }

  async createTransferTx(params: TransferParams) {
    try {
      const builder = this.getBuilder(params)
      return await (builder as GeneralBuilder<TSendBaseOptionsWithSenderAddress>)
        .senderAddress(params.sender.address)
        .build()
    } catch (error) {
      console.error('Failed to create transfer tx: ', error)
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
  return [
    ...(wssEndpoint ? [wssEndpoint] : []),
    sourceChain.uid,
    destinationChain.uid,
    sourceToken.id,
    sourceAmount,
    recipient,
    sender.address,
  ].join('|')
}

const xcmTransferBuilderManager = XcmTransferBuilderManager.getInstance()
export default xcmTransferBuilderManager
