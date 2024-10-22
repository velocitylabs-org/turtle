import { assets, Builder, Extrinsic } from '@paraspell/sdk'
import { TransferParams } from '@/hooks/useTransfer'
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
  const sourceChainFromId = assets.getTNode(sourceChain.chainId)
  const destinationChainFromId = assets.getTNode(destinationChain.chainId)
  if (!sourceChainFromId || !destinationChainFromId)
    throw new Error('Transfer failed: chain id not found.')

  // To be tested + write some test
  const supportedAssets = assets.getAllAssetsSymbols(sourceChainFromId)
  const tokenSymbol = supportedAssets.find(a => a.toLowerCase() === token.symbol.toLowerCase())
  if (!tokenSymbol) throw new Error('Transfer failed: Token symbol not supported.')
  // console.log('All good', tokenSymbol, 'from:', sourceChainFromId, 'to: ', destinationChainFromId)

  return await Builder(api) // Api parameter is optional
    .from(sourceChainFromId)
    .to(destinationChainFromId)
    .currency({ symbol: tokenSymbol })
    /*.feeAsset(feeAsset) */
    .amount(amount)
    .address(recipient)
    /*.xcmVersion(Version.V1/V2/V3/V4)*/
    .build()
}
