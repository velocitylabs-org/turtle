import { getAssetUid, isAssetHub } from '@/config/registry'
import { TransferParams } from '@/hooks/useTransfer'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { Environment } from '@/store/environmentStore'
import {
  assets,
  Builder,
  Extrinsic,
  TCurrencyCore,
  TNodeDotKsmWithRelayChains,
} from '@paraspell/sdk'
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
  const { environment, sourceChain, destinationChain, token, amount, recipient } = params
  const api = await getApiPromise(wssEndpoint)

  const relay = getRelayNode(environment)
  const sourceChainFromId = assets.getTNode(sourceChain.chainId, relay)
  const destinationChainFromId = assets.getTNode(destinationChain.chainId, relay)
  if (!sourceChainFromId || !destinationChainFromId)
    throw new Error('Transfer failed: chain id not found.')

  // TODO(victor): write some tests
  // from relay chain
  if (sourceChain.chainId === 0) {
    return await Builder(api)
      .to(destinationChainFromId as Exclude<TNodeDotKsmWithRelayChains, 'Polkadot' | 'Kusama'>) // TODO: remove type casts once Paraspell releases an update
      .amount(amount)
      .address(recipient)
      .build()
  }
  // to relay chain
  else if (destinationChain.chainId === 0) {
    return await Builder(api)
      .from(sourceChainFromId as Exclude<TNodeDotKsmWithRelayChains, 'Polkadot' | 'Kusama'>)
      .amount(amount)
      .address(recipient)
      .build()
  }
  // para to para
  else {
    const currencyId = getCurrencyId(
      environment,
      sourceChainFromId,
      sourceChain.uid,
      token,
      destinationChain,
    )

    console.log(
      'PSpell params:',
      sourceChainFromId,
      destinationChainFromId,
      currencyId,
      amount,
      recipient,
    )

    return await Builder(api)
      .from(sourceChainFromId as ParaChain)
      .to(destinationChainFromId as ParaChain)
      .currency(currencyId)
      .amount(amount)
      .address(recipient)
      .build()
  }
}

type ParaChain = Exclude<TNodeDotKsmWithRelayChains, 'Polkadot' | 'Kusama'>

export const getTokenSymbol = (sourceChain: TNodeDotKsmWithRelayChains, token: Token) => {
  // TODO(victor): write some tests
  const supportedAssets = assets.getAllAssetsSymbols(sourceChain)
  const tokenSymbol = supportedAssets.find(a => a.toLowerCase() === token.symbol.toLowerCase())
  if (!tokenSymbol) throw new Error('Token symbol not supported.')

  return tokenSymbol
}

export const getRelayNode = (env: Environment): 'polkadot' => {
  switch (env) {
    case Environment.Mainnet:
      return 'polkadot'

    case Environment.Testnet:
      return 'polkadot' // TODO: change to Paseo once available

    default:
      throw new Error('Cannot find relay node. Unsupported environment')
  }
}

/**
 * Get the ParaSpell currency id in the form of `TCurrencyCore`.
 *
 * @remarks We prioritize an local asset id if specified in our registry and otherwise default
 * to the paraspell token symbol. AH edge case is handled.
 *
 * */
export function getCurrencyId(
  env: Environment,
  node: TNodeDotKsmWithRelayChains,
  chainId: string,
  token: Token,
  destinationChain?: Chain,
): TCurrencyCore {
  // When sending a token to AssetHub, this currency id must be specified in a way that's
  // known to AssetHub rather than providing an identifier relative to the source chain.
  // Quoting Dudo:
  // "So every Parachain with xTokens transfering to AssetHub (If compatible) have to
  // enter asset ID on asset hub(the asset id you wish to receive) rather than on source chain"
  const lookupChainId =
    destinationChain && isAssetHub(destinationChain) ? destinationChain.uid : chainId
  const localAssetId = getAssetUid(env, lookupChainId, token.id)

  return localAssetId ?? { symbol: getTokenSymbol(node, token) }
}
