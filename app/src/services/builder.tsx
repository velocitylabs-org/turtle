import { Builder, TAddress, TNodeDotKsmWithRelayChains } from '@paraspell/sdk'
import { Chain, Token } from '@velocitylabs-org/turtle-registry'
import { getParaSpellNode, getParaspellToken } from '@/utils/paraspellTransfer'

type TxBuilder = ReturnType<typeof Builder>

type TxParams = {
  wssEndpoint?: string
  from: Chain
  to: Chain
  token: Token
  address: TAddress
  senderAddress: string
}

const txKey = ({ wssEndpoint, from, to, token, address }: TxParams): string => {
  if (!wssEndpoint) {
    return [from.uid, to.uid, token.symbol, address].join('|')
  }

  return [wssEndpoint, from.uid, to.uid, token.symbol, address].join('|')
}

class BuilderManager {
  private static instance: BuilderManager
  private builders: Map<string, TxBuilder>

  private constructor() {
    this.builders = new Map()
  }

  static getInstance(): BuilderManager {
    if (!BuilderManager.instance) {
      BuilderManager.instance = new BuilderManager()
    }
    return BuilderManager.instance
  }

  createBuilder(params: TxParams): TxBuilder {
    const sourceChainNode = getParaSpellNode(params.from)
    const destinationChainNode = getParaSpellNode(params.to)

    if (!sourceChainNode || !destinationChainNode) {
      throw new Error('Failed to create builder: chain id not found.')
    }

    const currencyId = getParaspellToken(params.token, sourceChainNode)

    const key = txKey(params)

    if (this.builders.has(key)) {
      return this.builders.get(key)!
    }

    let builder: TxBuilder
    try {
      builder = Builder(params.wssEndpoint)
        .from(sourceChainNode as TNodeDotKsmWithRelayChains)
        .to(destinationChainNode as TNodeDotKsmWithRelayChains)
        .currency({ ...currencyId, amount: BigInt(10 ** params.token.decimals).toString() })
        .address(params.address)
        .senderAddress(params.senderAddress)

      this.builders.set(key, builder)
    } catch (error) {
      console.error('Failed to create builder: ', error)
      throw error
    }

    return builder
  }

  async getBuilder(params: TxParams) {
    const key = txKey(params)
    const existing = this.builders.get(key)
    return existing ?? this.createBuilder(params)
  }

  async getTransferableAmount(params: TxParams) {
    const builder = await this.getBuilder(params)

    // @ts-expect-error - types are being weird and can't find to correctly cast this
    return builder.getTransferableAmount()
  }

  async getOriginAndDestinationXcmFee(params: TxParams) {
    const builder = await this.getBuilder(params)
    // @ts-expect-error - types are being weird and can't find to correctly cast this
    return builder.getXcmFee({ disableFeeCheck: false })
  }

  async getOriginXcmFee(params: TxParams) {
    const builder = await this.getBuilder(params)
    // @ts-expect-error - types are being weird and can't find to correctly cast this
    return builder.getOriginXcmFee()
  }

  async isExistentialDepositMetAfterTransfer(params: TxParams) {
    try {
      const builder = await this.getBuilder(params)
      // @ts-expect-error - types are being weird and can't find to correctly cast this
      return builder.verifyEdOnDestination()
    } catch (error) {
      console.error('Failed to verify existential deposit: ', error)
      return false
    }
  }

  async dryRun(params: TxParams) {
    try {
      const builder = await this.getBuilder(params)
      // @ts-expect-error - types are being weird and can't find to correctly cast this
      return builder.dryRun()
    } catch (error) {
      console.error('Failed to dry run: ', error)
      throw error
    }
  }

  async createTransferTx(params: TxParams) {
    try {
      const builder = await this.getBuilder(params)
      // @ts-expect-error - types are being weird and can't find to correctly cast this
      return builder.senderAddress(params.senderAddress).build()
    } catch (error) {
      console.error('Failed to create transfer tx: ', error)
      throw error
    }
  }
}

const builderManager = BuilderManager.getInstance()

export default builderManager
