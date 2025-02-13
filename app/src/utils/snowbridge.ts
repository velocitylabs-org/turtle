import { AlchemyProvider, ContractTransaction } from 'ethers'
import { environment, subscan, history, Context } from '@snowbridge/api'
import { BeefyClient__factory, IGateway__factory } from '@snowbridge/contract-types'
import { FromAhToEthTrackingResult, FromEthTrackingResult } from '@/models/snowbridge'
import { Token } from '@/models/token'
import { toHuman } from './transfer'

export const SKIP_LIGHT_CLIENT_UPDATES = true
export const HISTORY_IN_SECONDS = 60 * 60 * 24 * 3 // 3 days
export const ETHEREUM_BLOCK_TIME_SECONDS = 12
export const ACCEPTABLE_BRIDGE_LATENCY = 28800 // 8 hours

export async function trackFromEthTx(
  env: environment.SnowbridgeEnvironment,
  skipLightClientUpdates = SKIP_LIGHT_CLIENT_UPDATES,
  historyInSeconds = HISTORY_IN_SECONDS,
): Promise<FromEthTrackingResult[]> {
  if (!env.config.SUBSCAN_API) throw Error(`No subscan api urls configured for ${env.name}`)

  const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY
  if (!alchemyKey) throw Error('Missing Alchemy Key')

  const subscanKey = process.env.NEXT_PUBLIC_SUBSCAN_KEY
  if (!subscanKey) throw Error('Missing Subscan Key')

  const ethereumProvider = new AlchemyProvider(env.ethChainId, alchemyKey)

  const assetHubScan = subscan.createApi(env.config.SUBSCAN_API.ASSET_HUB_URL, subscanKey)
  const bridgeHubScan = subscan.createApi(env.config.SUBSCAN_API.BRIDGE_HUB_URL, subscanKey)
  const bridgeHubParaId = env.config.BRIDGE_HUB_PARAID
  const beacon_url = env.config.BEACON_HTTP_API
  const gateway = IGateway__factory.connect(env.config.GATEWAY_CONTRACT, ethereumProvider)
  const ethereumSearchPeriodBlocks = historyInSeconds / ETHEREUM_BLOCK_TIME_SECONDS

  const ethNowBlock = await ethereumProvider.getBlock('latest', false)
  const now = new Date()
  const utcNowTimestamp = Math.floor(now.getTime() / 1000)

  const toAssetHubBlock = await subscan.fetchBlockNearTimestamp(assetHubScan, utcNowTimestamp)
  const fromAssetHubBlock = await subscan.fetchBlockNearTimestamp(
    assetHubScan,
    utcNowTimestamp - historyInSeconds,
  )

  const toBridgeHubBlock = await subscan.fetchBlockNearTimestamp(bridgeHubScan, utcNowTimestamp)
  const fromBridgeHubBlock = await subscan.fetchBlockNearTimestamp(
    bridgeHubScan,
    utcNowTimestamp - historyInSeconds,
  )

  if (ethNowBlock === null) throw Error('Could not fetch latest Ethereum block.')

  const searchRange = {
    assetHub: {
      fromBlock: fromAssetHubBlock.block_num,
      toBlock: toAssetHubBlock.block_num,
    },
    bridgeHub: {
      fromBlock: fromBridgeHubBlock.block_num,
      toBlock: toBridgeHubBlock.block_num,
    },
    ethereum: {
      fromBlock: ethNowBlock.number - ethereumSearchPeriodBlocks,
      toBlock: ethNowBlock.number,
    },
  }

  const transfers = await history.toPolkadotHistory(
    assetHubScan,
    bridgeHubScan,
    searchRange,
    skipLightClientUpdates,
    bridgeHubParaId,
    gateway,
    ethereumProvider,
    beacon_url,
  )
  return transfers
}

export async function trackFromAhToEthTx(
  env: environment.SnowbridgeEnvironment,
  skipLightClientUpdates = SKIP_LIGHT_CLIENT_UPDATES,
  historyInSeconds = HISTORY_IN_SECONDS,
): Promise<FromAhToEthTrackingResult[]> {
  if (!env.config.SUBSCAN_API) throw Error(`No subscan api urls configured for ${env.name}`)

  const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY
  if (!alchemyKey) throw Error('Missing Alchemy Key')

  const subscanKey = process.env.NEXT_PUBLIC_SUBSCAN_KEY
  if (!subscanKey) throw Error('Missing Subscan Key')

  const ethereumProvider = new AlchemyProvider(env.ethChainId, alchemyKey)

  const assetHubScan = subscan.createApi(env.config.SUBSCAN_API.ASSET_HUB_URL, subscanKey)
  const bridgeHubScan = subscan.createApi(env.config.SUBSCAN_API.BRIDGE_HUB_URL, subscanKey)
  const relaychainScan = subscan.createApi(env.config.SUBSCAN_API.RELAY_CHAIN_URL, subscanKey)
  const assetHubParaId = env.config.ASSET_HUB_PARAID
  const beefyClient = BeefyClient__factory.connect(env.config.BEEFY_CONTRACT, ethereumProvider)
  const gateway = IGateway__factory.connect(env.config.GATEWAY_CONTRACT, ethereumProvider)
  const ethereumSearchPeriodBlocks = historyInSeconds / ETHEREUM_BLOCK_TIME_SECONDS

  const ethNowBlock = await ethereumProvider.getBlock('latest', false)
  const now = new Date()
  const utcNowTimestamp = Math.floor(now.getTime() / 1000)

  const toAssetHubBlock = await subscan.fetchBlockNearTimestamp(assetHubScan, utcNowTimestamp)
  const fromAssetHubBlock = await subscan.fetchBlockNearTimestamp(
    assetHubScan,
    utcNowTimestamp - historyInSeconds,
  )
  const toBridgeHubBlock = await subscan.fetchBlockNearTimestamp(bridgeHubScan, utcNowTimestamp)
  const fromBridgeHubBlock = await subscan.fetchBlockNearTimestamp(
    bridgeHubScan,
    utcNowTimestamp - historyInSeconds,
  )

  if (ethNowBlock === null) throw Error('Could not fetch latest Ethereum block.')

  const searchRange = {
    assetHub: {
      fromBlock: fromAssetHubBlock.block_num,
      toBlock: toAssetHubBlock.block_num,
    },
    bridgeHub: {
      fromBlock: fromBridgeHubBlock.block_num,
      toBlock: toBridgeHubBlock.block_num,
    },
    ethereum: {
      fromBlock: ethNowBlock.number - ethereumSearchPeriodBlocks,
      toBlock: ethNowBlock.number,
    },
  }

  const transfers = await history.toEthereumHistory(
    assetHubScan,
    bridgeHubScan,
    relaychainScan,
    searchRange,
    skipLightClientUpdates,
    env.ethChainId,
    assetHubParaId,
    beefyClient,
    gateway,
  )
  return transfers
}


/**
 * Estimates the gas cost for a given Ethereum transaction in both native token and USD value.
 *
 * @param tx - The contract transaction object.
 * @param snowbridgeContext - The Snowbridge context containing Ethereum API.
 * @param feeToken - The fee token.
 * @param nativeTokenUSDValue - The USD value of the fee token.
 * @returns An object containing the tx estimate gas fee in native tokens and its USD value.
 */
const estimateTransactionFees = async (
  tx: ContractTransaction,
  snowbridgeContext: Context,
  feeToken: Token,
  feeTokenUSDValue: number,
) => {
  // Fetch gas estimation and fee data
  const [txGas, { gasPrice, maxPriorityFeePerGas }] = await Promise.all([
    snowbridgeContext.ethereum.api.estimateGas(tx),
    snowbridgeContext.ethereum.api.getFeeData(),
  ])

  // Get effective fee per gas & get USD fee value
  const effectiveFeePerGas = (gasPrice ?? 0n) + (maxPriorityFeePerGas ?? 0n)
  const txFeesInToken = toHuman((txGas * effectiveFeePerGas).toString(), feeToken)

  return {
    txFees: txFeesInToken,
    txFeesInDollars: txFeesInToken * feeTokenUSDValue,
  }
}