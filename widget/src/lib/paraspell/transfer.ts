import {
  Builder,
  EvmBuilder,
  getAllAssetsSymbols,
  getNativeAssetSymbol,
  getTNode,
  TCurrencyCore,
  TDryRunResult,
  TEcosystemType,
  TNodeDotKsmWithRelayChains,
  TNodeWithRelayChains,
  TPapiTransaction,
} from '@paraspell/sdk'
import {
  Chain,
  Token,
  getAssetUid,
  REGISTRY,
  EthereumTokens,
  Environment,
  Network,
} from '@velocitylabs-org/turtle-registry'
import { TransferParams } from '@/hooks/useTransfer'

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
  const { sourceChain, destinationChain, sourceToken, sourceAmount, recipient, sender } = params

  const sourceChainNode = getParaSpellNode(sourceChain)
  const destinationChainNode = getParaSpellNode(destinationChain)

  if (!sourceChainNode || !destinationChainNode)
    throw new Error('Transfer failed: chain id not found.')

  const currencyId = getParaspellToken(sourceToken, sourceChainNode)

  return await Builder(wssEndpoint)
    .from(sourceChainNode as TNodeDotKsmWithRelayChains)
    .to(destinationChainNode)
    .currency({ ...currencyId, amount: sourceAmount })
    .address(recipient)
    .senderAddress(sender.address)
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
  const { sourceChain, destinationChain, sourceToken, sourceAmount, recipient } = params
  const sourceChainFromId = getParaSpellNode(sourceChain)
  const destinationChainFromId = getParaSpellNode(destinationChain)
  if (!sourceChainFromId || !destinationChainFromId)
    throw new Error('Transfer failed: chain id not found.')
  const currencyId = getParaspellToken(sourceToken, sourceChainFromId)

  return EvmBuilder()
    .from('Moonbeam')
    .to(destinationChainFromId)
    .currency({ ...currencyId, amount: sourceAmount })
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
  const { sourceChain, destinationChain, sourceToken, sourceAmount, recipient, sender } = params
  const sourceChainNode = getParaSpellNode(sourceChain)
  const destinationChainNode = getParaSpellNode(destinationChain)
  if (!sourceChainNode || !destinationChainNode)
    throw new Error('Dry Run failed: chain id not found.')

  const currencyId = getParaspellToken(sourceToken, sourceChainNode)

  return await Builder(wssEndpoint)
    .from(sourceChainNode as TNodeDotKsmWithRelayChains)
    .to(destinationChainNode)
    .currency({ ...currencyId, amount: sourceAmount })
    .address(recipient)
    .senderAddress(sender.address)
    .dryRun()
}

export const isExistentialDepositMetAfterTransfer = async (
  params: TransferParams,
  wssEndpoint?: string,
): Promise<boolean> => {
  const { sourceChain, destinationChain, sourceToken, sourceAmount, recipient, sender } = params
  const sourceChainNode = getParaSpellNode(sourceChain)
  const destinationChainNode = getParaSpellNode(destinationChain)
  if (!sourceChainNode || !destinationChainNode)
    throw new Error('Dry Run failed: chain id not found.')

  const currencyId = getParaspellToken(sourceToken, sourceChainNode)

  return await Builder(wssEndpoint)
    .from(sourceChainNode as TNodeDotKsmWithRelayChains)
    .to(destinationChainNode)
    .currency({ ...currencyId, amount: sourceAmount })
    .address(recipient)
    .senderAddress(sender.address)
    .verifyEdOnDestination()
}

export const getTransferableAmount = async (
  sourceChain: Chain,
  destinationChain: Chain,
  sourceToken: Token,
  recipient: string,
  sender: string,
  userBalance: bigint,
  wssEndpoint?: string,
): Promise<bigint> => {
  const sourceChainNode = getParaSpellNode(sourceChain)
  const destinationChainNode = getParaSpellNode(destinationChain)
  if (!sourceChainNode || !destinationChainNode)
    throw new Error('Failed to get transferable amount: chain id not found.')

  const currencyId = getParaspellToken(sourceToken, sourceChainNode)

  return await Builder(wssEndpoint)
    .from(sourceChainNode as TNodeDotKsmWithRelayChains)
    .to(destinationChainNode)
    .currency({ ...currencyId, amount: userBalance })
    .address(recipient)
    .senderAddress(sender)
    .getTransferableAmount()
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

  if (!tokenSymbol) console.error(`Token symbol not found: ${token.symbol} on ${sourceChain}`)
  // captureException(new Error(`Token symbol not found: ${token.symbol} on ${sourceChain}`)) - Sentry

  return tokenSymbol ?? token.symbol // if not found, try with fallback
}

export const getRelayNode = (network: Network): 'polkadot' | 'kusama' => {
  switch (network) {
    case 'Polkadot':
      return 'polkadot'
    case 'Kusama':
      return 'kusama'
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

  const relay = getRelayNode(chain.network)
  const chainNode = getTNode(chain.chainId, relay)
  if (!chainNode)
    throw Error(`Can't find chain ${chain.uid} (id ${chain.chainId}) under the relay ${relay}`)

  const symbol = getNativeAssetSymbol(chainNode)
  const token = REGISTRY[Environment.Mainnet].tokens.find(t => t.symbol === symbol) // TODO handle duplicate symbols
  if (!token) throw Error(`Native Token for ${chain.uid} not found`)
  return token
}

export function getParaSpellNode(chain: Chain): TNodeWithRelayChains | null {
  return chain.network === 'Ethereum' && chain.chainId === 1
    ? 'Ethereum'
    : getTNode(chain.chainId, toPsEcosystem(chain.network))
}

/**
 * Get the ParaSpell token. Used to convert a turtle token to a paraspell token object.
 */
export function getParaspellToken(token: Token, node?: TNodeWithRelayChains): TCurrencyCore {
  // Edge Cases. Myth multilocation is not supported by Paraspell.
  if (token.id === EthereumTokens.MYTH.id)
    return node ? { symbol: getTokenSymbol(node, token) } : { symbol: token.symbol }

  if (token.multilocation) return { multilocation: token.multilocation }
  if (node) return { symbol: getTokenSymbol(node, token) }

  return { symbol: token.symbol }
}

/**
 * Convert a Turtle 'network' value to a ParaSpell 'TEcosystemType'
 * @param network
 * @returns the matching paraspell value
 */
export function toPsEcosystem(network: Network): TEcosystemType {
  return network.toLowerCase() as TEcosystemType
}
