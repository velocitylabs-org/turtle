import { assetsV2, Context, toEthereum, toPolkadotV2 } from '@snowbridge/api'
import { Token } from '@/models/token'
import { safeConvertAmount, toHuman } from './transfer'
import { Direction } from '@/services/transfer'
import { EthereumTokens, PolkadotTokens } from '@/registry/mainnet/tokens'
import { getCachedTokenPrice } from '@/services/balance'
import { Chain } from '@/models/chain'
import { AmountInfo } from '@/models/transfer'
import { captureException } from '@sentry/nextjs'
import { Fee } from '@/hooks/useFees'

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
  destinationChain: Chain,
  direction: Direction,
  context: Context,
  senderAddress?: string,
  recipientAddress?: string,
  amount?: number | null,
): Promise<Fee | null> => {
  switch (direction) {
    case Direction.ToEthereum: {
      const amount = await toEthereum.getSendFee(context)
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
        const registry = await assetsV2.buildRegistry(await assetsV2.fromContext(context))
        const feeToken = EthereumTokens.ETH
        const feeTokenInDollars = (await getCachedTokenPrice(feeToken))?.usd ?? 0

        //1. Get bridging fee
        const fee = await toPolkadotV2.getDeliveryFee(
          {
            gateway: context.gateway(),
            assetHub: await context.assetHub(),
            destination: await context.parachain(destinationChain.chainId),
          },
          registry,
          token.address,
          destinationChain.chainId,
        )

        const bridgingFee: AmountInfo = {
          amount: fee.totalFeeInWei,
          token: feeToken,
          inDollars: toHuman(fee.totalFeeInWei, feeToken) * feeTokenInDollars,
        }

        if (!senderAddress || !recipientAddress || !amount || !bridgingFee.amount) {
          console.log("Return here", bridgingFee)
          return {
            origin: 'Ethereum',
            bridging: bridgingFee,
            execution: null,
          }
        }

        // 2. Get execution fee
        // Sender, Recipient and amount can't be defaulted here since the Smart contract verify the ERC20 token allowance.
        const tx = await toPolkadotV2.createTransfer(
          registry,
          senderAddress,
          recipientAddress,
          token.address,
          destinationChain.chainId,
          safeConvertAmount(amount, token) ?? 0n,
          fee,
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
        captureException(new Error('Estimated Tx cost failed'), {
          level: 'warning',
          tags: {
            useFeesHook:
              error instanceof Error && 'action' in error && typeof error.action === 'string'
                ? error.action
                : 'estimateTransactionFees',
          },
          extra: { error },
        })
        return null
      }
    }

    default:
      throw new Error('Unsupported direction for the SnowbridgeAPI')
  }
}
