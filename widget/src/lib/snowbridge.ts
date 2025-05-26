import { Context, environment, toEthereumV2, toPolkadotV2 } from '@snowbridge/api'
import {
  Chain,
  Token,
  isAssetHub,
  rpcConnectionAsHttps,
  AssetHub,
  BridgeHub,
  RelayChain,
  EthereumTokens,
  PolkadotTokens,
  SNOWBRIDGE_MAINNET_PARACHAIN_URLS,
  getTokenPrice,
  Environment,
} from '@velocitylabs-org/turtle-registry'
import { AbstractProvider, AlchemyProvider } from 'ethers'
import { Fee } from '@/hooks/useFees'
import { SnowbridgeContext } from '@/models/snowbridge'
import { AmountInfo } from '@/models/transfer'
import { ALCHEMY_API_KEY } from '@/utils/consts'
import { Direction, toHuman, safeConvertAmount } from '@/utils/transfer'

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
      // ethChains,
      ethChains: { '1': config.ETHEREUM_CHAINS[1](ALCHEMY_API_KEY) },
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
    default:
      return 'polkadot_mainnet'
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
  transfer: toPolkadotV2.Transfer,
  context: Context,
  feeToken: Token,
  feeTokenUSDValue: number,
): Promise<AmountInfo> => {
  const { tx } = transfer
  const estimatedGas = await context.ethereum().estimateGas(tx)
  const feeData = await context.ethereum().getFeeData()
  const executionFee = (feeData.gasPrice ?? 0n) * estimatedGas

  return {
    amount: executionFee,
    token: feeToken,
    inDollars: toHuman(executionFee, feeToken) * feeTokenUSDValue,
  }
}

export const getFeeEstimate = async (
  token: Token,
  sourceChain: Chain,
  destinationChain: Chain,
  direction: Direction,
  context: SnowbridgeContext,
  senderAddress: string,
  recipientAddress: string,
  amount: number,
): Promise<Fee | null> => {
  switch (direction) {
    case Direction.ToEthereum: {
      const amount = await toEthereumV2
        .getDeliveryFee(
          {
            assetHub: await context.assetHub(),
            source: await context.parachain(sourceChain.chainId),
          },
          sourceChain.chainId,
          context.registry,
          token.address,
        )
        .then(x => x.totalFeeInDot)
      const feeTokenInDollars = (await getTokenPrice(PolkadotTokens.DOT))?.usd ?? 0

      return {
        origin: 'Polkadot',
        fee: {
          amount,
          token: PolkadotTokens.DOT,
          inDollars: toHuman(amount, PolkadotTokens.DOT) * feeTokenInDollars,
        },
      }
    }

    case Direction.ToPolkadot: {
      try {
        const feeToken = EthereumTokens.ETH
        const feeTokenInDollars = (await getTokenPrice(feeToken))?.usd ?? 0

        //1. Get bridging fee
        const fee = await toPolkadotV2.getDeliveryFee(
          {
            gateway: context.gateway(),
            assetHub: await context.assetHub(),
            destination: await context.parachain(destinationChain.chainId),
          },
          context.registry,
          token.address,
          destinationChain.chainId,
        )

        const bridgingFee: AmountInfo = {
          amount: fee.totalFeeInWei,
          token: feeToken,
          inDollars: toHuman(fee.totalFeeInWei, feeToken) * feeTokenInDollars,
        }

        // 2. Get execution fee
        // Sender, Recipient and amount can't be defaulted here since the Smart contract verify the ERC20 token allowance.
        const tx = await toPolkadotV2.createTransfer(
          context.registry,
          senderAddress,
          recipientAddress,
          token.address,
          destinationChain.chainId,
          safeConvertAmount(amount, token) ?? 0n,
          fee,
        )

        const validation = await toPolkadotV2.validateTransfer(
          {
            ethereum: context.ethereum(),
            gateway: context.gateway(),
            bridgeHub: await context.bridgeHub(),
            assetHub: await context.assetHub(),
            destParachain: isAssetHub(destinationChain)
              ? undefined
              : await context.parachain(destinationChain.chainId),
          },
          tx,
        )

        if (findValidationError(validation))
          return {
            origin: 'Ethereum',
            bridging: bridgingFee,
            execution: null,
          }

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

export const findValidationError = (
  validation: toPolkadotV2.ValidationResult | toEthereumV2.ValidationResult,
): toPolkadotV2.ValidationLog | toEthereumV2.ValidationLog | undefined => {
  return validation.logs.find(log => log.kind == toPolkadotV2.ValidationKind.Error)
}
