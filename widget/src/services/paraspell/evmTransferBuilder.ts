import { EvmBuilder } from '@paraspell/sdk'
import type { Client } from 'viem'
import type { TransferParams } from '@/hooks/useTransfer'
import { getParaSpellChain, getParaspellToken } from '@/lib/paraspell/transfer'
import { toHuman } from '@/utils/transfer'

type TxBuilder = ReturnType<typeof EvmBuilder>

class EvmTransferBuilderManager {
  private static instance: EvmTransferBuilderManager
  private builders: Map<string, TxBuilder>

  private constructor() {
    this.builders = new Map()
  }

  static getInstance(): EvmTransferBuilderManager {
    if (!EvmTransferBuilderManager.instance) {
      EvmTransferBuilderManager.instance = new EvmTransferBuilderManager()
    }
    return EvmTransferBuilderManager.instance
  }

  createBuilder(params: TransferParams): TxBuilder {
    const { sourceChain, destinationChain, sourceToken, sourceAmount, recipient } = params
    const sourceChainNode = getParaSpellChain(sourceChain)
    const destinationChainNode = getParaSpellChain(destinationChain)

    if (!sourceChainNode || !destinationChainNode) {
      throw new Error('Failed to create builder: chain id not found.')
    }

    const currencyId = getParaspellToken(sourceToken, sourceChainNode)
    const key = txKey(params)

    if (this.builders.has(key)) return this.builders.get(key)!

    let builder: TxBuilder
    try {
      builder = EvmBuilder({ abstractDecimals: false })
        .from(sourceChainNode)
        .to(destinationChainNode)
        .currency({ ...currencyId, amount: sourceAmount })
        .address(recipient)

      this.builders.set(key, builder)
    } catch (error) {
      console.error('Failed to create builder: ', error)
      throw error
    }

    return builder
  }

  getBuilder(params: TransferParams): TxBuilder {
    const key = txKey(params)
    const existing = this.builders.get(key)
    return existing ?? this.createBuilder(params)
  }

  async transferTx(params: TransferParams, viemClient: Client) {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: any
      const builder = this.getBuilder(params) as any
      return await builder.signer(viemClient).build()
    } catch (error) {
      console.error('Failed to create transfer tx: ', error)
      throw error
    }
  }

  async disconnect(params: TransferParams) {
    this.removeBuilder(params)
    // TODO Evm builder does not support .disconnect() yet but will be added in future updates
    return true
  }

  removeBuilder(params: TransferParams) {
    const key = txKey(params)
    this.builders.delete(key)
  }

  builderList(): Map<string, TxBuilder> {
    return this.builders
  }
}

function txKey(params: TransferParams): string {
  const { sourceChain, destinationChain, sourceToken, sourceAmount, recipient } = params
  const amount = toHuman(sourceAmount, sourceToken) // Convert large numeric amount to human-readable format to prevent long key strings
  return [sourceChain.uid, destinationChain.uid, sourceToken.id, amount, recipient].join('|')
}

const evmTransferBuilderManager = EvmTransferBuilderManager.getInstance()
export default evmTransferBuilderManager
