import { TransferParams } from '@/hooks/useTransfer'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { getAssetUid, REGISTRY } from '@/registry'
import { EthereumTokens } from '@/registry/mainnet/tokens'
import { Environment } from '@/store/environmentStore'
import { SubstrateAccount } from '@/store/substrateWalletStore'
import {
  Builder,
  EvmBuilder,
  getAllAssetsSymbols,
  getNativeAssetSymbol,
  getTNode,
  TDryRunResult,
  TNodeDotKsmWithRelayChains,
  TNodeWithRelayChains,
  type TCurrencyCore,
  type TPapiTransaction,
} from '@paraspell/sdk'
import { RouterBuilder } from '@paraspell/xcm-router'
import { captureException } from '@sentry/nextjs'
import { getSenderAddress } from './address'

export type DryRunResult = { type: 'Supported' | 'Unsupported' } & TDryRunResult

/**
 * Creates a submittable PAPI transaction using Paraspell Builder.
 *
 * @param params - The transfer parameters
 * @param wssEndpoint - An optional wss chain endpoint to connect to a specific blockchain.
 * @returns - A Promise that resolves a submittable extrinsic transaction.
 */
export const createTransferTx = async (
  params: TransferParams,
  wssEndpoint?: string,
): Promise<TPapiTransaction> => {
  const { environment, sourceChain, destinationChain, sourceToken, amount, recipient } = params

  const relay = getRelayNode(environment)
  const sourceChainFromId = getTNode(sourceChain.chainId, relay)
  const destinationChainFromId = getTNode(destinationChain.chainId, relay)
  if (!sourceChainFromId || !destinationChainFromId)
    throw new Error('Transfer failed: chain id not found.')
  else {
    const currencyId = getCurrencyId(environment, sourceChainFromId, sourceChain.uid, sourceToken)

    return await Builder(wssEndpoint)
      .from(sourceChainFromId as TNodeDotKsmWithRelayChains)
      .to(destinationChainFromId)
      .currency({ ...currencyId, amount })
      .address(recipient)
      .build()
  }
}

export const createRouterPlan = async (params: TransferParams, slippagePct: string = '1') => {
  const {
    environment,
    sourceChain,
    destinationChain,
    sourceToken,
    destinationToken,
    amount,
    recipient,
    sender,
  } = params

  const senderAddress = await getSenderAddress(sender)
  const account = params.sender as SubstrateAccount

  const relay = getRelayNode(environment)
  const sourceChainFromId = getTNode(sourceChain.chainId, relay)
  const destinationChainFromId = getTNode(destinationChain.chainId, relay)
  if (!sourceChainFromId || !destinationChainFromId)
    throw new Error('Transfer failed: chain id not found.')

  const currencyIdFrom = getCurrencyId(environment, sourceChainFromId, sourceChain.uid, sourceToken)
  const currencyTo = { symbol: getTokenSymbol(destinationChainFromId, destinationToken) }

  const routerPlan = await RouterBuilder()
    .from(sourceChainFromId as TNodeDotKsmWithRelayChains)
    .to(destinationChainFromId)
    .currencyFrom(currencyIdFrom)
    .currencyTo(currencyTo)
    .amount(amount)
    .slippagePct(slippagePct)
    .senderAddress(senderAddress)
    .recipientAddress(recipient)
    .signer(account.pjsSigner as any)
    .buildTransactions()

  return routerPlan
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
  const { environment, sourceChain, destinationChain, sourceToken, amount, recipient } = params
  const relay = getRelayNode(environment)
  const sourceChainFromId = getTNode(sourceChain.chainId, relay)
  const destinationChainFromId = getTNode(destinationChain.chainId, relay)
  if (!sourceChainFromId || !destinationChainFromId)
    throw new Error('Transfer failed: chain id not found.')
  const currencyId = getCurrencyId(environment, sourceChainFromId, sourceChain.uid, sourceToken)

  return EvmBuilder()
    .from('Moonbeam')
    .to(destinationChainFromId)
    .currency({ ...currencyId, amount })
    .address(recipient)
    .signer(viemClient)
    .build()
}

/**
 * Dry run a transfer using Paraspell.
 *
 * @param params - The transfer parameters
 * @param wssEndpoint - An optional wss chain endpoint to connect to a specific blockchain.
 * @returns - A Promise that resolves a dry run result.
 * @throws - An error if the dry run api is not available.
 */
export const dryRun = async (
  params: TransferParams,
  wssEndpoint?: string,
): Promise<TDryRunResult> => {
  const { environment, sourceChain, destinationChain, sourceToken, amount, recipient, sender } =
    params

  const relay = getRelayNode(environment)
  const sourceChainFromId = getTNode(sourceChain.chainId, relay)
  const destinationChainFromId = getTNode(destinationChain.chainId, relay)
  if (!sourceChainFromId || !destinationChainFromId)
    throw new Error('Dry Run failed: chain id not found.')

  const currencyId = getCurrencyId(environment, sourceChainFromId, sourceChain.uid, sourceToken)

  return await Builder(wssEndpoint)
    .from(sourceChainFromId as TNodeDotKsmWithRelayChains)
    .to(destinationChainFromId)
    .currency({ ...currencyId, amount })
    .address(recipient)
    .dryRun(sender.address)
}

export const getTokenSymbol = (sourceChain: TNodeWithRelayChains, token: Token) => {
  const supportedAssets = getAllAssetsSymbols(sourceChain)

  let tokenSymbol: string | undefined
  if (sourceChain === 'Moonbeam') {
    tokenSymbol = supportedAssets.find(a => {
      const lowered = a.toLowerCase()
      const stripped = lowered.startsWith('xc') ? lowered.slice(2) : lowered
      return stripped === token.symbol.toLowerCase()
    })
  } else tokenSymbol = supportedAssets.find(a => a.toLowerCase() === token.symbol.toLowerCase())

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
  node: TNodeWithRelayChains,
  chainId: string,
  token: Token,
): TCurrencyCore {
  return getAssetUid(env, chainId, token.id) ?? { symbol: getTokenSymbol(node, token) }
}

export function getNativeToken(chain: Chain): Token {
  if (chain.network === 'Ethereum') return EthereumTokens.ETH

  const env = REGISTRY.testnet.chains.map(c => c.uid).includes(chain.uid)
    ? Environment.Testnet
    : Environment.Mainnet

  const relay = getRelayNode(env)
  const chainNode = getTNode(chain.chainId, relay)
  if (!chainNode) throw Error(`Native Token for ${chain.uid} not found`)

  const symbol = getNativeAssetSymbol(chainNode)
  const token = REGISTRY[env].tokens.find(t => t.symbol === symbol) // TODO handle duplicate symbols
  if (!token) throw Error(`Native Token for ${chain.uid} not found`)
  return token
}

export function getParaSpellNode(chain: Chain, relay: 'polkadot'): TNodeWithRelayChains | null {
  return chain.network === 'Ethereum' && chain.chainId === 1
    ? 'Ethereum'
    : getTNode(chain.chainId, relay)
}
