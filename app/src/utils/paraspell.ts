import { TransferParams } from '@/hooks/useTransfer'
import { Token } from '@/models/token'
import { getAssetUid } from '@/registry'
import { Environment } from '@/store/environmentStore'
import {
  Builder,
  EvmBuilder,
  getAllAssetsSymbols,
  getTNode,
  TCurrencyCore,
  TNodeDotKsmWithRelayChains,
  type TPapiTransaction,
} from '@paraspell/sdk'
import { captureException } from '@sentry/nextjs'

/**
 * Creates a submittable PAPI transaction using Paraspell Builder.
 *
 * @param params - The transfer parameters
 * @param wssEndpoint - An optional wss chain endpoint to connect to a specific blockchain.
 * @returns - A Promise that resolves a submittable extrinsic transaction.
 */
export const createTx = async (
  params: TransferParams,
  wssEndpoint?: string,
): Promise<TPapiTransaction> => {
  const { environment, sourceChain, destinationChain, token, amount, recipient } = params

  const relay = getRelayNode(environment)
  const sourceChainFromId = getTNode(sourceChain.chainId, relay)
  const destinationChainFromId = getTNode(destinationChain.chainId, relay)
  if (!sourceChainFromId || !destinationChainFromId)
    throw new Error('Transfer failed: chain id not found.')
  else {
    const currencyId = getCurrencyId(environment, sourceChainFromId, sourceChain.uid, token)

    return await Builder(wssEndpoint)
      .from(sourceChainFromId)
      .to(destinationChainFromId)
      .currency({ ...currencyId, amount })
      .address(recipient)
      .build()
  }
}

/**
 * Submits a moonbeam xcm transaction using Paraspell EvmBuilder.
 *
 * @param params - The transfer parameters
 * @returns - A Promise that resolves to the tx hash.
 */
export const moonbeamTransfer = async (
  params: TransferParams,
  viemClient: any,
): Promise<string> => {
  const { environment, sourceChain, destinationChain, token, amount, recipient } = params
  const relay = getRelayNode(environment)
  const sourceChainFromId = getTNode(sourceChain.chainId, relay)
  const destinationChainFromId = getTNode(destinationChain.chainId, relay)
  if (!sourceChainFromId || !destinationChainFromId)
    throw new Error('Transfer failed: chain id not found.')
  const currencyId = getCurrencyId(environment, sourceChainFromId, sourceChain.uid, token)

  console.log('Moonbeam transfer:', {
    sourceChainFromId,
    destinationChainFromId,
    currencyId,
    amount,
    recipient,
    viemClient,
  })

  return EvmBuilder()
    .from('Moonbeam')
    .to(destinationChainFromId)
    .currency({ ...currencyId, amount })
    .address(recipient)
    .signer(viemClient)
    .build()
}

export const getTokenSymbol = (sourceChain: TNodeDotKsmWithRelayChains, token: Token) => {
  const supportedAssets = getAllAssetsSymbols(sourceChain)

  const tokenSymbol = supportedAssets.find(a => a.toLowerCase() === token.symbol.toLowerCase())
  if (!tokenSymbol)
    captureException(new Error(`Token symbol not found: ${token.symbol} on ${sourceChain}`))

  return tokenSymbol ?? token.symbol // if not found, try with fallback
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
 * @remarks We prioritize an local asset id if specified in our registry and otherwise
 * default to the token symbol.
 *
 * */
export function getCurrencyId(
  env: Environment,
  node: TNodeDotKsmWithRelayChains,
  chainId: string,
  token: Token,
): TCurrencyCore {
  return getAssetUid(env, chainId, token.id) ?? { symbol: getTokenSymbol(node, token) }
}
