import { Context, contextConfigFor, environment, toEthereumV2, toPolkadotV2 } from '@snowbridge/api'
import {
  Chain,
  Token,
  isAssetHub,
  rpcConnectionAsHttps,
  AssetHub,
  BridgeHub,
  Polkadot,
  EthereumTokens,
  PolkadotTokens,
  SNOWBRIDGE_MAINNET_PARACHAIN_URLS,
  getTokenPrice,
  Network,
} from '@velocitylabs-org/turtle-registry'
import { Fee } from '@/hooks/useFees'
import { SnowbridgeContext } from '@/models/snowbridge'
import { AmountInfo } from '@/models/transfer'
import { Direction, toHuman, safeConvertAmount } from '@/utils/transfer'

/**
 * Given a network, return the adequate Snowbridge Api Environment scheme.
 *
 *
 * @param network - The network in which the app is operating on
 * @returns The adequate SnowbridgeEnvironment for the given input
 */
export function getSbEnvironment(network: Network): environment.SnowbridgeEnvironment {
  const sbNetwork = toSnowbridgeNetwork(network)
  if (sbNetwork === undefined) throw Error(`Snowbridge doesn't support the given Network`)

  const env = environment.SNOWBRIDGE_ENV[sbNetwork]

  // Apply custom api endpoints for each supported network
  if (network === 'Polkadot') {
    env.config.ASSET_HUB_PARAID = AssetHub.chainId
    env.config.BRIDGE_HUB_PARAID = BridgeHub.chainId
    env.config.RELAY_CHAIN_URL = rpcConnectionAsHttps(Polkadot.rpcConnection)
    env.config.PARACHAINS = SNOWBRIDGE_MAINNET_PARACHAIN_URLS
  } else {
    throw Error(`Snowbridge doesn't support the given Network`)
  }

  return env
}

export async function getSnowBridgeContext(network: Network = 'Polkadot'): Promise<Context> {
  const snowbridgeNetwork = toSnowbridgeNetwork(network)
  if (!snowbridgeNetwork) throw new Error(`Snowbridge context not supported on ${network}`)

  const config = contextConfigFor(snowbridgeNetwork)
  return new Context(config)
}

/**
 * Convert a Network value to the corresponding network string value
 * that the Snowbridge/api SDK understands.
 * @param network - The network in which the app is operating
 * @returns the corresponding network value that Snowbridge/api understands
 */
export function toSnowbridgeNetwork(network: Network): string | undefined {
  switch (network) {
    case 'Polkadot':
    case 'Ethereum':
      return 'polkadot_mainnet'
    default:
      return undefined
  }
}

/**
 * Estimates the gas cost for a given Ethereum transaction in both native token and USD value.
 *
 * @param transfer
 * @param context - The Snowbridge context containing Ethereum API.
 * @param feeToken - The fee token.
 * @param feeTokenUSDValue
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
            destParachain: isAssetHub(destinationChain) ? undefined : await context.parachain(destinationChain.chainId),
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
