import { type Context, toEthereumV2, toPolkadotV2 } from '@snowbridge/api'
import { type Chain, EthereumTokens, isAssetHub, PolkadotTokens, type Token } from '@velocitylabs-org/turtle-registry'
import type { SnowbridgeContext } from '@/models/snowbridge'
import type { AmountInfo } from '@/models/transfer'
import { getCachedTokenPrice } from '@/services/balance'
import { Direction } from '@/services/transfer'
import { safeConvertAmount, toHuman } from './transfer'

export type SnowbridgeEstimateFee =
  | { origin: 'Ethereum'; bridging: AmountInfo; execution: AmountInfo | null }
  | { origin: 'Ethereum'; error: 'INSUFFICIENT_FUNDS' }
  | { origin: 'Polkadot'; fee: AmountInfo }

/*
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
): Promise<SnowbridgeEstimateFee | null> => {
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
      const feeTokenInDollars = (await getCachedTokenPrice(PolkadotTokens.DOT))?.usd ?? 0

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
        const feeTokenInDollars = (await getCachedTokenPrice(feeToken))?.usd ?? 0

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
        // Estimation can fail for multiple reasons, including errors such as insufficient token approval
        console.log('Estimated Tx cost failed', error instanceof Error && { ...error })

        // Check if this is an insufficient funds error
        const errorWithCode = error as { code?: string; shortMessage?: string }
        if (errorWithCode?.code === 'INSUFFICIENT_FUNDS' || errorWithCode?.shortMessage === 'insufficient funds') {
          return {
            origin: 'Ethereum',
            error: 'INSUFFICIENT_FUNDS',
          }
        }

        // Rethrow the error to be handled by the caller
        throw error
      }
    }

    default:
      throw new Error('Unsupported direction for the SnowbridgeAPI')
  }
}

export const findValidationError = (
  validation: toPolkadotV2.ValidationResult | toEthereumV2.ValidationResult,
): toPolkadotV2.ValidationLog | toEthereumV2.ValidationLog | undefined => {
  return validation.logs.find(log => log.kind === toPolkadotV2.ValidationKind.Error)
}
