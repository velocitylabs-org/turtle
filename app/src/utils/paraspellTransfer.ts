'use client'
import { TransferParams } from '@/hooks/useTransfer'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { REGISTRY } from '@/registry'
import { EthereumTokens, PolkadotTokens } from '@/registry/mainnet/tokens'
import { Environment } from '@/store/environmentStore'
import {
  Builder,
  EvmBuilder,
  getAllAssetsSymbols,
  getNativeAssetSymbol,
  getTNode,
  TCurrencyCore,
  TDryRunResult,
  TNodeDotKsmWithRelayChains,
  TNodeWithRelayChains,
  type TPapiTransaction,
} from '@paraspell/sdk'
import { captureException } from '@sentry/nextjs'
import { getAccountId32 } from './address'

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
  const { sourceChain, destinationChain, sourceToken, amount, recipient, sender } = params

  const sourceChainFromId = getParaSpellNode(sourceChain)
  const destinationChainFromId = getParaSpellNode(destinationChain)

  if (!sourceChainFromId || !destinationChainFromId)
    throw new Error('Transfer failed: chain id not found.')

  const currencyId = getParaspellToken(sourceToken, sourceChainFromId)

  return await Builder(wssEndpoint)
    .from(sourceChainFromId as TNodeDotKsmWithRelayChains)
    .to(destinationChainFromId)
    .currency({ ...currencyId, amount })
    .address(
      recipient,
      destinationChainFromId === 'Ethereum' ? getAccountId32(sender.address) : undefined,
    )
    .build()
}

/**
 * Submits a moonbeam xcm transaction using Paraspell EvmBuilder.
 *
 * @param params - The transfer parameters
 * @returns - A Promise that resolves to the tx hash.
 */
export const moonbeamTransfer = async (
  params: TransferParams,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  viemClient: any,
): Promise<string> => {
  const { sourceChain, destinationChain, sourceToken, amount, recipient } = params

  const sourceChainFromId = getParaSpellNode(sourceChain)
  const destinationChainFromId = getParaSpellNode(destinationChain)
  if (!sourceChainFromId || !destinationChainFromId)
    throw new Error('Transfer failed: chain id not found.')

  const currencyId = getParaspellToken(sourceToken, sourceChainFromId)

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
  const { sourceChain, destinationChain, sourceToken, amount, recipient, sender } = params
  const sourceChainFromId = getParaSpellNode(sourceChain)
  const destinationChainFromId = getParaSpellNode(destinationChain)
  if (!sourceChainFromId || !destinationChainFromId)
    throw new Error('Dry Run failed: chain id not found.')

  const currencyId = getParaspellToken(sourceToken, sourceChainFromId)

  return await Builder(wssEndpoint)
    .from(sourceChainFromId as TNodeDotKsmWithRelayChains)
    .to(destinationChainFromId)
    .currency({ ...currencyId, amount })
    .address(
      recipient,
      destinationChainFromId === 'Ethereum' ? getAccountId32(sender.address) : undefined,
    )
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

    default:
      throw new Error('Cannot find relay node. Unsupported environment')
  }
}

/**
 * Get the ParaSpell token. Used to convert a turtle token to a paraspell token object.
 */
export function getParaspellToken(token: Token, node?: TNodeWithRelayChains): TCurrencyCore {
  // TODO: Edge Cases. Remove once Paraspell fixed it.
  if (
    token.id === PolkadotTokens.ASTR.id ||
    token.id === EthereumTokens.MYTH.id ||
    token.id === PolkadotTokens.DOT.id
  )
    return node ? { symbol: getTokenSymbol(node, token) } : { symbol: token.symbol }

  if (token.multilocation) return { multilocation: token.multilocation }
  if (node) return { symbol: getTokenSymbol(node, token) }

  return { symbol: token.symbol }
}

export function getNativeToken(chain: Chain): Token {
  if (chain.network === 'Ethereum') return EthereumTokens.ETH

  const env = Environment.Mainnet

  const relay = getRelayNode(env)
  const chainNode = getTNode(chain.chainId, relay)
  if (!chainNode) throw Error(`Native Token for ${chain.uid} not found`)

  const symbol = getNativeAssetSymbol(chainNode)
  const token = REGISTRY[env].tokens.find(t => t.symbol === symbol) // TODO handle duplicate symbols
  if (!token) throw Error(`Native Token for ${chain.uid} not found`)
  return token
}

export function getParaSpellNode(chain: Chain): TNodeWithRelayChains | null {
  return chain.network === 'Ethereum' && chain.chainId === 1
    ? 'Ethereum'
    : getTNode(chain.chainId, 'polkadot')
}
