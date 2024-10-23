import { TransferParams } from '@/hooks/useTransfer'
import { Token } from '@/models/token'
import { assets, Builder, Extrinsic, TNodeWithRelayChains } from '@paraspell/sdk'
import { getApiPromise } from './polkadot'

/**
 * Creates a submittable extrinsic transaction hash using Paraspell Builder.
 *
 * @param params - The transfer parameters
 * @param wssEndpoint - An optional wss chain endpoint to connect to a specific blockchain. // Should not be needed.
 * @returns - A Promise that resolves a submittable extrinsic transaction.
 */
export const createTx = async (
  params: TransferParams,
  wssEndpoint?: string,
): Promise<Extrinsic> => {
  const { sourceChain, destinationChain, token, amount, recipient } = params
  const api = await getApiPromise(wssEndpoint)

  // TODO(victor): write some tests
  // from relay chain
  if (sourceChain.chainId === 0) {
    const destinationChainFromId = assets.getTNode(destinationChain.chainId)
    if (!destinationChainFromId) throw new Error('Transfer failed: destination chain id not found.')

    return await Builder(api).to(destinationChainFromId).amount(amount).address(recipient).build()
  }
  // to relay chain
  else if (destinationChain.chainId === 0) {
    const sourceChainFromId = assets.getTNode(sourceChain.chainId)
    if (!sourceChainFromId) throw new Error('Transfer failed: source chain id not found.')

    return await Builder(api).from(sourceChainFromId).amount(amount).address(recipient).build()
  }
  // para to para
  else {
    const sourceChainFromId = assets.getTNode(sourceChain.chainId)
    const destinationChainFromId = assets.getTNode(destinationChain.chainId)
    if (!sourceChainFromId || !destinationChainFromId)
      throw new Error('Transfer failed: chain id not found.')

    const tokenSymbol = getTokenSymbol(sourceChainFromId, token)

    return await Builder(api)
      .from(sourceChainFromId)
      .to(destinationChainFromId)
      .currency({ symbol: tokenSymbol })
      .amount(amount)
      .address(recipient)
      .build()
  }
}

export const getTokenSymbol = (sourceChain: TNodeWithRelayChains, token: Token) => {
  // TODO(victor): write some tests
  const supportedAssets = assets.getAllAssetsSymbols(sourceChain)
  const tokenSymbol = supportedAssets.find(a => a.toLowerCase() === token.symbol.toLowerCase())
  if (!tokenSymbol) throw new Error('Transfer failed: Token symbol not supported.')

  return tokenSymbol
}
