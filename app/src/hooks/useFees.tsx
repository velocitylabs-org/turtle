import useNotification from '@/hooks/useNotification'
import { Chain } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { Token } from '@/models/token'
import { AmountInfo } from '@/models/transfer'
import { getNativeToken } from '@/registry'
import { Eth, Polkadot } from '@/registry/mainnet/tokens'
import { getCachedTokenPrice } from '@/services/balance'
import { Direction, resolveDirection } from '@/services/transfer'
import { getPlaceholderAddress } from '@/utils/address'
import { getCurrencyId, getRelayNode } from '@/utils/paraspell'
import { safeConvertAmount, toHuman } from '@/utils/transfer'
import { getOriginFeeDetails, getTNode } from '@paraspell/sdk'
import { captureException } from '@sentry/nextjs'
import { Context, toEthereum, toPolkadot } from '@snowbridge/api'
import { useCallback, useEffect, useState } from 'react'
import useEnvironment from './useEnvironment'
import useSnowbridgeContext from './useSnowbridgeContext'
import { WalletInfo } from './useWallet'
import { TokenAmount } from '@/models/select'
import { ContractTransaction } from 'ethers'

const useFees = (
  sourceChain?: Chain | null,
  destinationChain?: Chain | null,
  tokenData?: TokenAmount | null,
  sourceWallet?: WalletInfo | undefined,
  recipient?: string,
) => {
  const [fees, setFees] = useState<AmountInfo | null>(null)
  const [ethereumTxfees, setEthereumTxFees] = useState<AmountInfo | null>(null)
  const [canPayFees, setCanPayFees] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const { snowbridgeContext, isSnowbridgeContextLoading, snowbridgeContextError } =
    useSnowbridgeContext()
  const { addNotification } = useNotification()
  const env = useEnvironment()

  const fetchFees = useCallback(async () => {
    if (!sourceChain || !destinationChain || !tokenData?.token) {
      setFees(null)
      setEthereumTxFees(null)
      return
    }

    const direction = resolveDirection(sourceChain, destinationChain)
    // TODO: this should be the fee token, not necessarily the native token. Also adjust the USD value accordingly below.
    const nativeToken = getNativeToken(sourceChain)

    try {
      setLoading(true)
      let fees: string
      let tokenUSDValue: number = 0

      if (
        (direction === Direction.ToEthereum || direction === Direction.ToPolkadot) &&
        isSnowbridgeContextLoading
      ) {
        setFees(null)
        setEthereumTxFees(null)
        return
      }

      switch (direction) {
        case Direction.ToEthereum: {
          if (!snowbridgeContext || snowbridgeContextError)
            throw snowbridgeContextError ?? new Error('Snowbridge context undefined')
          tokenUSDValue = (await getCachedTokenPrice(Polkadot.DOT))?.usd ?? 0
          fees = (await toEthereum.getSendFee(snowbridgeContext)).toString()
          break
        }

        case Direction.ToPolkadot: {
          if (!snowbridgeContext || snowbridgeContextError)
            throw snowbridgeContextError ?? new Error('Snowbridge context undefined')
          tokenUSDValue = (await getCachedTokenPrice(Eth.ETH))?.usd ?? 0

          const sendFee = await toPolkadot.getSendFee(
            snowbridgeContext,
            tokenData.token.address,
            destinationChain.chainId,
            BigInt(0),
          )
          fees = sendFee.toString()

          try {
            if (
              !sourceWallet?.sender?.address ||
              !recipient ||
              !tokenData ||
              !tokenData.amount ||
              !tokenData.token.address ||
              !sendFee
            ) {
              break
            }
            const { amount, token } = tokenData
            // Sender, Recipient and amount can't be defaulted here since the Smart contract verify the ERC20 token allowance.
            const { tx } = await toPolkadot.createTx(
              snowbridgeContext.config.appContracts.gateway,
              sourceWallet.sender?.address,
              recipient,
              token.address,
              destinationChain.chainId,
              safeConvertAmount(amount, token) ?? 0n,
              sendFee,
              BigInt(0),
            )

            const { txFees, txFeesInDollars } = await estimateTransactionFees(
              tx,
              snowbridgeContext,
              nativeToken,
              tokenUSDValue,
            )

            setEthereumTxFees({
              amount: txFees,
              token: nativeToken,
              inDollars: txFeesInDollars ? txFeesInDollars : 0,
            })
            break
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
            break
          }
        }

        case Direction.WithinPolkadot: {
          const relay = getRelayNode(env)
          const sourceChainNode = getTNode(sourceChain.chainId, relay)
          const destinationChainNode = getTNode(destinationChain.chainId, relay)
          if (!sourceChainNode || !destinationChainNode) throw new Error('Chain id not found')
          const currency = getCurrencyId(env, sourceChainNode, sourceChain.uid, tokenData.token)

          const info = await getOriginFeeDetails({
            origin: sourceChainNode,
            destination: destinationChainNode,
            currency: { ...currency, amount: BigInt(10 ** tokenData.token.decimals).toString() }, // hardcoded amount because the fee is usually independent of the amount
            account: getPlaceholderAddress(sourceChain.supportedAddressTypes[0]), // hardcode sender address because the fee is usually independent of the sender
            accountDestination: getPlaceholderAddress(destinationChain.supportedAddressTypes[0]), // hardcode recipient address because the fee is usually independent of the recipient
            api: sourceChain.rpcConnection,
          })
          tokenUSDValue = (await getCachedTokenPrice(nativeToken))?.usd ?? 0
          fees = info.xcmFee.toString()
          setCanPayFees(info.sufficientForXCM)
          break
        }

        default:
          throw new Error('Unsupported direction')
      }

      setFees({
        amount: fees,
        token: nativeToken,
        inDollars: tokenUSDValue ? toHuman(fees, nativeToken) * tokenUSDValue : 0,
      })
    } catch (error) {
      setFees(null)
      setEthereumTxFees(null)
      captureException(error)
      console.error(error)
      addNotification({
        severity: NotificationSeverity.Error,
        message: 'Failed to fetch the fees. Please try again later.',
        dismissible: true,
      })
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    env,
    sourceChain,
    destinationChain,
    tokenData?.token?.id,
    snowbridgeContext,
    addNotification,
    sourceWallet?.sender?.address,
    recipient,
    tokenData?.amount,
  ])

  useEffect(() => {
    fetchFees()
  }, [fetchFees])

  return { fees, ethereumTxfees, loading, refetch: fetchFees, canPayFees }
}

/**
 * Estimates the gas cost for a given Ethereum transaction in both native token and USD value.
 *
 * @param tx - The contract transaction object.
 * @param snowbridgeContext - The Snowbridge context containing Ethereum API.
 * @param nativeToken - The native token.
 * @param nativeTokenUSDValue - The USD value of the native token.
 * @returns An object containing the tx estimate gas fee in native tokens and its USD value.
 */
const estimateTransactionFees = async (
  tx: ContractTransaction,
  snowbridgeContext: Context,
  nativeToken: Token,
  nativeTokenUSDValue: number,
) => {
  // Fetch gas estimation and fee data
  const [txGas, { gasPrice, maxPriorityFeePerGas }] = await Promise.all([
    snowbridgeContext.ethereum.api.estimateGas(tx),
    snowbridgeContext.ethereum.api.getFeeData(),
  ])

  // Get effective fee per gas & get USD fee value
  const effectiveFeePerGas = (gasPrice ?? 0n) + (maxPriorityFeePerGas ?? 0n)
  const txFeesInToken = toHuman((txGas * effectiveFeePerGas).toString(), nativeToken)

  return {
    txFees: txFeesInToken,
    txFeesInDollars: txFeesInToken * nativeTokenUSDValue,
  }
}

export default useFees
