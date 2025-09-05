import { RouterBuilder } from '@paraspell/xcm-router'
import type { TransferParams } from '@/hooks/useTransfer'
import type { SubstrateAccount } from '@/store/substrateWalletStore'
import { getSenderAddress } from '@/utils/address'
import type { Dex } from '@/utils/paraspellSwap'
import { getParaSpellNode, getParaspellToken } from '@/utils/paraspellTransfer'
import { toHuman } from '@/utils/transfer'

type TxBuilder = ReturnType<typeof RouterBuilder>

class XcmRouterBuilderManager {
  private static instance: XcmRouterBuilderManager
  private builders: Map<string, TxBuilder>

  private constructor() {
    this.builders = new Map()
  }

  static getInstance(): XcmRouterBuilderManager {
    if (!XcmRouterBuilderManager.instance) {
      XcmRouterBuilderManager.instance = new XcmRouterBuilderManager()
    }
    return XcmRouterBuilderManager.instance
  }

  createBuilder(params: TransferParams, exchange: Dex = 'HydrationDex'): TxBuilder {
    const { sourceChain, destinationChain, sourceToken, destinationToken, sourceAmount } = params
    const sourceChainFromId = getParaSpellNode(sourceChain)
    const destinationChainFromId = getParaSpellNode(destinationChain)

    if (!sourceChainFromId || !destinationChainFromId) throw new Error('Transfer failed: chain id not found.')
    if (sourceChainFromId === 'Ethereum' || destinationChainFromId === 'Ethereum')
      throw new Error('Transfer failed: Ethereum is not supported.')

    const currencyIdFrom = getParaspellToken(sourceToken, sourceChainFromId)
    const currencyTo = getParaspellToken(destinationToken, destinationChainFromId)
    const key = txKey(params, exchange)

    if (this.builders.has(key)) return this.builders.get(key)!

    let builder: TxBuilder
    try {
      builder = RouterBuilder({ abstractDecimals: false })
        .from(sourceChainFromId)
        .to(destinationChainFromId)
        // biome-ignore lint/suspicious/noExplicitAny: any
        .exchange(exchange as any)
        .currencyFrom(currencyIdFrom)
        .currencyTo(currencyTo)
        .amount(sourceAmount)

      this.builders.set(key, builder)
    } catch (error) {
      console.error('Failed to create builder: ', error)
      throw error
    }

    return builder
  }

  getBuilder(params: TransferParams, exchange: Dex) {
    const key = txKey(params, exchange)
    const existing = this.builders.get(key)
    return existing ?? this.createBuilder(params, exchange)
  }

  async createRouterPlan(params: TransferParams, exchange: Dex = 'HydrationDex', slippagePct: string = '1') {
    try {
      const account = params.sender as SubstrateAccount
      const senderAddress = await getSenderAddress(params.sender)
      const recipientAddress = params.recipient
      // biome-ignore lint/suspicious/noExplicitAny: any
      const builder = this.getBuilder(params, exchange) as any
      return await builder
        .slippagePct(slippagePct)
        .senderAddress(senderAddress)
        .recipientAddress(recipientAddress)
        // biome-ignore lint/suspicious/noExplicitAny: any
        .signer(account.pjsSigner as any)
        .buildTransactions()
    } catch (error) {
      console.error('Failed to create transfer tx: ', error)
      throw error
    }
  }

  async getExchangeOutputAmount(
    params: Pick<TransferParams, 'sourceChain' | 'destinationChain' | 'sourceToken' | 'destinationToken'> & {
      sourceAmount: bigint | string
    },
    exchange: Dex = 'HydrationDex',
  ) {
    try {
      const builder = this.getBuilder(params as TransferParams, exchange)
      // biome-ignore lint/suspicious/noExplicitAny: any
      const amountOut = await (builder as any).getBestAmountOut()
      return amountOut.amountOut
    } catch (error) {
      console.error('Failed to get best Amount Out: ', error)
      throw error
    }
  }

  disconnect(params: TransferParams, exchange: Dex = 'HydrationDex') {
    this.removeBuilder(params, exchange)
    // TODO Router does not support .disconnect() yet but will be added in future updates
    return true
  }

  removeBuilder(params: TransferParams, exchange: Dex = 'HydrationDex') {
    const key = txKey(params, exchange)
    this.builders.delete(key)
  }

  builderList() {
    return this.builders
  }
}

function txKey(params: TransferParams, exchange: Dex): string {
  const { sourceChain, destinationChain, sourceToken, destinationToken, sourceAmount } = params
  const amount = toHuman(sourceAmount, sourceToken) // Convert large numeric amount to human-readable format to prevent long key strings
  return [
    sourceChain.uid,
    destinationChain.uid,
    sourceToken.id,
    destinationToken.id,
    amount, // Source amount
    exchange,
  ].join('|')
}

const xcmRouterBuilderManager = XcmRouterBuilderManager.getInstance()
export default xcmRouterBuilderManager
