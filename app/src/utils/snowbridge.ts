import { ContractTransaction } from 'ethers'
import { Context, toEthereum, toPolkadot } from '@snowbridge/api'
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
      const feeToken = EthereumTokens.ETH
      const feeTokenInDollars = (await getCachedTokenPrice(feeToken))?.usd ?? 0
      const fee = await toPolkadot.getSendFee(
        context,
        token.address,
        destinationChain.chainId,
        BigInt(destinationChain.destinationFeeDOT ?? 0),
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
          BigInt(3769142),
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
