import { Fee } from '@/hooks/useFees'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { AmountInfo } from '@/models/transfer'
import { SNOWBRIDGE_MAINNET_PARACHAIN_URLS } from '@/registry'
import { rpcConnectionAsHttps } from '@/registry/helpers'
import { AssetHub, BridgeHub, RelayChain } from '@/registry/mainnet/chains'
import { EthereumTokens, PolkadotTokens } from '@/registry/mainnet/tokens'
import { Environment } from '@/stores/environmentStore'
import { ALCHEMY_API_KEY } from '@/utils/consts'
import { getTokenPrice } from '@/utils/token'
import { Direction, toHuman, safeConvertAmount } from '@/utils/transfer'
import { Context, environment, toEthereum, toPolkadot } from '@snowbridge/api'
import { AbstractProvider, AlchemyProvider, ContractTransaction } from 'ethers'

/**
 * Given an app Environment, return the adequate Snowbridge Api Environment scheme.
 *
 *
 * @param env - The environment in which the app is operating on
 * @returns The adequate SnowbridgeEnvironment for the given input
 */
export function getEnvironment(env: Environment): environment.SnowbridgeEnvironment {
  const network = toSnowbridgeNetwork(env)
  const x = environment.SNOWBRIDGE_ENV[network]

  // apply custom api endpoints
  if (env === Environment.Mainnet) {
    x.config.ASSET_HUB_PARAID = AssetHub.chainId
    x.config.BRIDGE_HUB_PARAID = BridgeHub.chainId
    x.config.RELAY_CHAIN_URL = rpcConnectionAsHttps(RelayChain.rpcConnection)
    x.config.PARACHAINS = SNOWBRIDGE_MAINNET_PARACHAIN_URLS
  }
  // TODO support Paseo testnet

  if (x === undefined) {
    throw Error(`Unknown environment`)
  }

  return x
}

export async function getContext(environment: environment.SnowbridgeEnvironment): Promise<Context> {
  const { config, ethChainId, name } = environment
  const ethereumProvider = new AlchemyProvider(ethChainId, ALCHEMY_API_KEY)
  const ethChains: { [ethChainId: string]: string | AbstractProvider } = {}
  ethChains[ethChainId.toString()] = ethereumProvider

  return new Context({
    environment: name,
    ethereum: {
      ethChainId,
      ethChains,
      beacon_url: config.BEACON_HTTP_API,
    },
    polkadot: {
      assetHubParaId: config.ASSET_HUB_PARAID,
      bridgeHubParaId: config.BRIDGE_HUB_PARAID,
      relaychain: config.RELAY_CHAIN_URL,
      parachains: config.PARACHAINS,
    },
    appContracts: {
      gateway: config.GATEWAY_CONTRACT,
      beefy: config.BEEFY_CONTRACT,
    },
  })
}

/**
 * Convert a given Environment value to the corresponding network string value
 * that the Snowbridge/api SDK understands.
 * @param env - The environmnet in which the app is operating
 * @returns the corresponding network value that Snowbridge/api understands
 */
export function toSnowbridgeNetwork(env: Environment): string {
  switch (env) {
    case Environment.Mainnet:
      return 'polkadot_mainnet'
    case Environment.Testnet:
      return 'rococo_sepolia'
  }
}

export async function getSnowBridgeContext(environment: Environment): Promise<Context> {
  const snowbridgeEnv = getEnvironment(environment)
  return await getContext(snowbridgeEnv)
}

/**
 * Estimates the gas cost for a given Ethereum transaction in both native token and USD value.
 *
 * @param tx - The contract transaction object.
 * @param context - The Snowbridge context containing Ethereum API.
 * @param feeToken - The fee token.
 * @param nativeTokenUSDValue - The USD value of the fee token.
 * @returns An object containing the tx estimate gas fee in the fee token and its USD value.
 */
export const estimateTransactionFees = async (
  tx: ContractTransaction,
  context: Context,
  feeToken: Token,
  feeTokenUSDValue: number,
): Promise<AmountInfo> => {
  // Fetch gas estimation and fee data
  const [txGas, { gasPrice, maxPriorityFeePerGas }] = await Promise.all([
    context.ethereum().estimateGas(tx),
    context.ethereum().getFeeData(),
  ])

  // Get effective fee per gas & get USD fee value
  const effectiveFeePerGas = (gasPrice ?? 0n) + (maxPriorityFeePerGas ?? 0n)
  const fee = toHuman((txGas * effectiveFeePerGas).toString(), feeToken)

  return {
    amount: fee,
    token: feeToken,
    inDollars: fee * feeTokenUSDValue,
  }
}

export const getFeeEstimate = async (
  token: Token,
  destinationChain: Chain,
  direction: Direction,
  context: Context,
  senderAddress?: string,
  recipientAddress?: string,
  amount?: number | null,
): Promise<Fee | null> => {
  switch (direction) {
    case Direction.ToEthereum: {
      return {
        origin: 'Polkadot',
        fee: {
          amount: (await toEthereum.getSendFee(context)).toString(),
          token: PolkadotTokens.DOT,
          inDollars: (await getTokenPrice(PolkadotTokens.DOT))?.usd ?? 0,
        },
      }
    }

    case Direction.ToPolkadot: {
      const feeToken = EthereumTokens.ETH
      const feeTokenInDollars = (await getTokenPrice(feeToken))?.usd ?? 0
      const fee = await toPolkadot.getSendFee(
        context,
        token.address,
        destinationChain.chainId,
        BigInt(0),
      )

      const bridgingFee: AmountInfo = {
        amount: fee,
        token: feeToken,
        inDollars: toHuman(fee, feeToken) * feeTokenInDollars,
      }

      if (!senderAddress || !recipientAddress || !amount || !bridgingFee.amount) {
        return {
          origin: 'Ethereum',
          bridging: bridgingFee,
          execution: null,
        }
      }

      try {
        // Sender, Recipient and amount can't be defaulted here since the Smart contract verify the ERC20 token allowance.
        const { tx } = await toPolkadot.createTx(
          context.config.appContracts.gateway,
          senderAddress,
          recipientAddress,
          token.address,
          destinationChain.chainId,
          safeConvertAmount(amount, token) ?? 0n,
          bridgingFee.amount as bigint,
          BigInt(0),
        )

        const executionFee = await estimateTransactionFees(tx, context, feeToken, feeTokenInDollars)

        return {
          origin: 'Ethereum',
          bridging: bridgingFee,
          execution: executionFee,
        }
      } catch (error) {
        // Estimation can fail for multiple reasons, including errors such as insufficient token approval.
        console.log('Estimated Tx cost failed', error instanceof Error && { ...error })
        // captureException(new Error('Estimated Tx cost failed'), {
        //   level: 'warning',
        //   tags: {
        //     useFeesHook:
        //       error instanceof Error && 'action' in error && typeof error.action === 'string'
        //         ? error.action
        //         : 'estimateTransactionFees',
        //   },
        //   extra: { error },
        // }) - Sentry
        return null
      }
    }

    default:
      throw new Error('Unsupported direction for the SnowbridgeAPI')
  }
}
